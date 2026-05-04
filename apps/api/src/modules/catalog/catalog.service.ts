import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getStorefront(tenantSlug: string) {
    const tenant = await this.getTenantOrThrow(tenantSlug);
    const now = new Date();

    const [categories, banners, featuredProducts, promotions] =
      await Promise.all([
        this.prisma.category.findMany({
          where: {
            tenantId: tenant.id,
          },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { name: 'asc' }],
        }),
        this.prisma.banner.findMany({
          where: {
            tenantId: tenant.id,
            status: 'ACTIVE',
            AND: [
              {
                OR: [{ startsAt: null }, { startsAt: { lte: now } }],
              },
              {
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
            ],
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        }),
        this.prisma.product.findMany({
          where: {
            tenantId: tenant.id,
            status: 'ACTIVE',
            featured: true,
          },
          include: {
            category: true,
            images: {
              orderBy: {
                sortOrder: 'asc',
              },
              take: 1,
            },
          },
          orderBy: [{ updatedAt: 'desc' }],
          take: 8,
        }),
        this.prisma.promotion.findMany({
          where: {
            tenantId: tenant.id,
            status: 'ACTIVE',
            AND: [
              {
                OR: [{ startsAt: null }, { startsAt: { lte: now } }],
              },
              {
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
            ],
          },
          include: {
            rules: true,
          },
          orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
          take: 6,
        }),
      ]);

    const enrichedFeatured = this.applyPromotionsToProducts(
      featuredProducts,
      promotions,
    );

    return {
      tenant,
      categories,
      banners,
      featuredProducts: enrichedFeatured,
      promotions,
    };
  }

  async getCategories(tenantSlug: string) {
    const tenant = await this.getTenantOrThrow(tenantSlug);

    return this.prisma.category.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
  }

  async getProducts(tenantSlug: string, query: GetProductsDto) {
    const tenant = await this.getTenantOrThrow(tenantSlug);
    const where: Prisma.ProductWhereInput = {
      tenantId: tenant.id,
      status: 'ACTIVE',
    };

    if (query.categorySlug) {
      where.category = {
        slug: query.categorySlug,
      };
    }

    if (query.featured === 'true') {
      where.featured = true;
    }

    if (query.q) {
      where.OR = [
        {
          name: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
        {
          shortDescription: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
            take: 1,
          },
        },
        orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
        take: query.limit ?? 12,
      }),
      this.prisma.product.count({ where }),
    ]);

    const now = new Date();
    const activePromotions = await this.prisma.promotion.findMany({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      include: { rules: true },
      orderBy: [{ priority: 'desc' }],
    });

    const enrichedProducts = this.applyPromotionsToProducts(
      products,
      activePromotions,
    );

    return {
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      total,
      products: enrichedProducts,
    };
  }

  async getProductBySlug(tenantSlug: string, productSlug: string) {
    const tenant = await this.getTenantOrThrow(tenantSlug);
    const product = await this.prisma.product.findFirst({
      where: {
        tenantId: tenant.id,
        slug: productSlug,
        status: 'ACTIVE',
      },
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const relatedProducts = product.categoryId
      ? await this.prisma.product.findMany({
          where: {
            tenantId: tenant.id,
            categoryId: product.categoryId,
            status: 'ACTIVE',
            NOT: {
              id: product.id,
            },
          },
          include: {
            category: true,
            images: {
              orderBy: {
                sortOrder: 'asc',
              },
              take: 1,
            },
          },
          take: 4,
        })
      : [];

    const now = new Date();
    const activePromotions = await this.prisma.promotion.findMany({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      include: { rules: true },
      orderBy: [{ priority: 'desc' }],
    });

    const [enrichedProduct] = this.applyPromotionsToProducts(
      [product],
      activePromotions,
    );
    const enrichedRelated = this.applyPromotionsToProducts(
      relatedProducts,
      activePromotions,
    );

    return {
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      product: enrichedProduct ?? product,
      relatedProducts: enrichedRelated,
    };
  }

  async createQuoteRequest(
    tenantSlug: string,
    input: {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      message?: string;
      items?: Array<{
        productId?: string;
        quantity?: number;
      }>;
    },
  ) {
    const tenant = await this.getTenantOrThrow(tenantSlug);
    const items = input.items?.filter((item) => item.productId) ?? [];

    if (items.length === 0) {
      throw new BadRequestException('At least one product is required.');
    }

    const productIds = [...new Set(items.map((item) => item.productId as string))];
    const products = await this.prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        id: {
          in: productIds,
        },
        status: 'ACTIVE',
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'One or more products are not available for this tenant.',
      );
    }

    const productsMap = new Map(products.map((product) => [product.id, product]));
    const requestItems = items.map((item) => {
      const product = productsMap.get(item.productId as string);

      if (!product) {
        throw new BadRequestException('Invalid product in cart.');
      }

      const quantity = Math.max(1, Math.trunc(item.quantity ?? 1));

      return {
        product,
        quantity,
        lineTotal: product.price.mul(quantity),
      };
    });

    const subtotal = requestItems.reduce(
      (accumulator, current) => accumulator.add(current.lineTotal),
      new Prisma.Decimal(0),
    );
    const customerName = input.customerName?.trim() || 'Cliente';
    const customerPhone = input.customerPhone?.trim() || tenant.whatsappNumber || 'N/A';
    const customerEmail = input.customerEmail?.trim() || null;
    const message = input.message?.trim() || null;

    const quoteRequest = await this.prisma.quoteRequest.create({
      data: {
        tenantId: tenant.id,
        customerName,
        customerPhone,
        customerEmail,
        message,
        subtotal,
        total: subtotal,
        currency: 'USD',
        items: {
          create: requestItems.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const whatsappNumber = tenant.whatsappNumber?.replace(/[^\d]/g, '') ?? '';
    const whatsappMessage = this.buildWhatsappMessage(
      tenant.name,
      quoteRequest.id,
      customerName,
      requestItems.map(({ product, quantity }) => ({
        name: product.name,
        quantity,
        price: product.price.toString(),
      })),
      subtotal.toString(),
    );

    return {
      quoteRequestId: quoteRequest.id,
      total: subtotal.toString(),
      items: quoteRequest.items,
      whatsappUrl: whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
        : null,
    };
  }

  private async getTenantOrThrow(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug: tenantSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        status: true,
        plan: true,
        logoUrl: true,
        coverUrl: true,
        primaryColor: true,
        secondaryColor: true,
        whatsappNumber: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return tenant;
  }

  private buildWhatsappMessage(
    tenantName: string,
    quoteId: string,
    customerName: string,
    items: Array<{
      name: string;
      quantity: number;
      price: string;
    }>,
    total: string,
  ) {
    const lines = [
      `Hola ${tenantName}, quiero confirmar este pedido.`,
      `Referencia: ${quoteId}`,
      `Cliente: ${customerName}`,
      '',
      'Productos:',
      ...items.map(
        (item) => `- ${item.quantity} x ${item.name} ($${item.price} USD)`,
      ),
      '',
      `Total estimado: $${total} USD`,
    ];

    return lines.join('\n');
  }

  // ── Promotion Engine ──────────────────────────────────

  private applyPromotionsToProducts<
    T extends {
      id: string;
      price: { toString(): string } | number | string;
      categoryId?: string | null;
      category?: { id: string; slug: string } | null;
    },
  >(
    products: T[],
    promotions: Array<{
      id: string;
      name: string;
      type: string;
      rules: Array<{
        scope: string;
        operator: string;
        value: string | null;
      }>;
    }>,
  ): Array<T & { promotion?: { name: string; type: string; finalPrice: string; discountPercent: number } }> {
    return products.map((product) => {
      const originalPrice = Number(product.price.toString());
      let bestPromo: { name: string; type: string; finalPrice: number; discountPercent: number } | null = null;

      for (const promo of promotions) {
        if (!this.promotionAppliesToProduct(promo, product)) {
          continue;
        }

        const rule = promo.rules[0];
        let finalPrice = originalPrice;

        if (promo.type === 'PERCENTAGE' && rule?.value) {
          const discount = Number(rule.value);
          finalPrice = originalPrice * (1 - discount / 100);
        } else if (promo.type === 'FIXED_AMOUNT' && rule?.value) {
          finalPrice = Math.max(0, originalPrice - Number(rule.value));
        } else if (promo.type === 'SPECIAL_PRICE' && rule?.value) {
          finalPrice = Number(rule.value);
        }

        if (finalPrice < originalPrice) {
          const discountPercent = Math.round(
            ((originalPrice - finalPrice) / originalPrice) * 100,
          );

          if (!bestPromo || finalPrice < bestPromo.finalPrice) {
            bestPromo = {
              name: promo.name,
              type: promo.type,
              finalPrice,
              discountPercent,
            };
          }
        }
      }

      if (bestPromo) {
        return {
          ...product,
          promotion: {
            name: bestPromo.name,
            type: bestPromo.type,
            finalPrice: bestPromo.finalPrice.toFixed(2),
            discountPercent: bestPromo.discountPercent,
          },
        };
      }

      return product as T & { promotion?: undefined };
    });
  }

  private promotionAppliesToProduct(
    promo: {
      rules: Array<{
        scope: string;
        operator: string;
        value: string | null;
      }>;
    },
    product: {
      id: string;
      categoryId?: string | null;
      category?: { id: string; slug: string } | null;
    },
  ): boolean {
    if (promo.rules.length === 0) {
      return true;
    }

    return promo.rules.some((rule) => {
      if (rule.scope === 'all_products') {
        return true;
      }

      if (rule.scope === 'product' && rule.value) {
        return product.id === rule.value;
      }

      if (rule.scope === 'category' && rule.value) {
        const catId = product.categoryId ?? product.category?.id;
        return catId === rule.value;
      }

      return false;
    });
  }
}
