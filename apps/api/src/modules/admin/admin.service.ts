import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CouponStatus,
  Prisma,
  ProductStatus,
  PromotionStatus,
  PromotionType,
  TenantStatus,
} from '@prisma/client';
import { AppEnvironment } from '../../common/config/validate-env';
import { PrismaService } from '../prisma/prisma.service';

type TenantPayload = {
  name?: string;
  slug?: string;
  subdomain?: string;
  status?: string;
  plan?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  whatsappNumber?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

type CategoryPayload = {
  name?: string;
  slug?: string;
  description?: string | null;
  position?: number;
};

type ProductPayload = {
  name?: string;
  slug?: string;
  categoryId?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  sku?: string | null;
  price?: number | string;
  compareAtPrice?: number | string | null;
  featured?: boolean;
  stock?: number;
  status?: string;
  imageUrl?: string | null;
};

type PromotionPayload = {
  name?: string;
  slug?: string;
  type?: string;
  status?: string;
  priority?: number;
  bannerUrl?: string | null;
  couponCode?: string | null;
  stackable?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  rules?: Array<{
    scope: string;
    operator: string;
    value?: string | null;
    minQuantity?: number;
    minAmount?: number | string;
  }>;
};

type BannerPayload = {
  title?: string;
  subtitle?: string | null;
  imageUrl?: string;
  linkUrl?: string | null;
  position?: number;
  status?: string;
  startsAt?: string | null;
  endsAt?: string | null;
};

type CreateTenantPayload = {
  name: string;
  slug?: string;
  subdomain?: string;
  plan?: string;
  whatsappNumber?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async getOverview() {
    const [
      tenants,
      products,
      categories,
      promotions,
      banners,
      recentTenants,
      recentProducts,
    ] = await Promise.all([
      this.prisma.tenant.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.product.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.category.count(),
      this.prisma.promotion.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.banner.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.tenant.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          _count: {
            select: {
              products: true,
              categories: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 5,
      }),
      this.prisma.product.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          tenant: {
            select: {
              name: true,
              slug: true,
            },
          },
          category: true,
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
            take: 1,
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 8,
      }),
    ]);

    return {
      metrics: {
        tenants,
        products,
        categories,
        promotions,
        banners,
      },
      recentTenants,
      recentProducts,
    };
  }

  async getTenants() {
    return this.prisma.tenant.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        domains: {
          where: {
            isPrimary: true,
          },
        },
        _count: {
          select: {
            products: true,
            categories: true,
            promotions: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async getTenantDetail(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
      include: {
        domains: {
          orderBy: [{ isPrimary: 'desc' }, { hostname: 'asc' }],
        },
        categories: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        products: {
          orderBy: [{ updatedAt: 'desc' }],
          include: {
            category: true,
            images: {
              orderBy: {
                sortOrder: 'asc',
              },
              take: 1,
            },
          },
        },
        promotions: {
          orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
          include: {
            coupons: true,
            rules: true,
          },
        },
        banners: {
          orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
        },
        _count: {
          select: {
            categories: true,
            products: true,
            promotions: true,
            banners: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return tenant;
  }

  async updateTenant(tenantId: string, input: TenantPayload) {
    const tenant = await this.ensureTenant(tenantId);
    const nextSlug = input.slug ? this.slugify(input.slug) : undefined;
    const nextSubdomain = input.subdomain
      ? this.slugify(input.subdomain)
      : undefined;

    if (nextSlug && nextSlug !== tenant.slug) {
      await this.ensureUniqueTenantSlug(nextSlug, tenant.id);
    }

    if (nextSubdomain && nextSubdomain !== tenant.subdomain) {
      await this.ensureUniqueTenantSubdomain(nextSubdomain, tenant.id);
    }

    await this.prisma.tenant.update({
      where: {
        id: tenant.id,
      },
      data: {
        name: this.optionalString(input.name),
        slug: nextSlug,
        subdomain: nextSubdomain,
        status: this.parseTenantStatus(input.status),
        plan: this.optionalString(input.plan),
        logoUrl: this.nullableString(input.logoUrl),
        coverUrl: this.nullableString(input.coverUrl),
        whatsappNumber: this.nullableString(input.whatsappNumber),
        primaryColor: this.nullableColor(input.primaryColor),
        secondaryColor: this.nullableColor(input.secondaryColor),
      },
    });

    if (nextSubdomain && nextSubdomain !== tenant.subdomain) {
      await this.syncPrimarySubdomain(tenant.id, nextSubdomain);
    }

    return this.getTenantDetail(tenant.id);
  }

  async createCategory(tenantId: string, input: CategoryPayload) {
    await this.ensureTenant(tenantId);
    const categorySlug = await this.ensureCategorySlug(
      tenantId,
      input.slug ?? input.name ?? 'categoria',
    );

    const category = await this.prisma.category.create({
      data: {
        tenantId,
        name: input.name?.trim() ?? 'Categoria',
        slug: categorySlug,
        description: this.nullableString(input.description),
        position: this.parseInteger(input.position, 0),
      },
    });

    return this.prisma.category.findUnique({
      where: {
        id: category.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async updateCategory(categoryId: string, input: CategoryPayload) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    const nextSlug = input.slug ? this.slugify(input.slug) : undefined;

    if (nextSlug && nextSlug !== category.slug) {
      await this.ensureUniqueCategorySlug(nextSlug, category.tenantId, category.id);
    }

    return this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        name: this.optionalString(input.name),
        slug: nextSlug,
        description: this.nullableString(input.description),
        position:
          input.position === undefined
            ? undefined
            : this.parseInteger(input.position, category.position),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async deleteCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    await this.prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    return {
      success: true,
      id: category.id,
    };
  }

  async createProduct(tenantId: string, input: ProductPayload) {
    await this.ensureTenant(tenantId);
    const slug = await this.ensureProductSlug(
      tenantId,
      input.slug ?? input.name ?? 'producto',
    );
    const categoryId = await this.resolveCategoryId(tenantId, input.categoryId);

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        categoryId,
        name: input.name?.trim() ?? 'Producto',
        slug,
        shortDescription: this.nullableString(input.shortDescription),
        description: this.nullableString(input.description),
        sku: this.nullableString(input.sku),
        price: this.parseDecimal(input.price, '0'),
        compareAtPrice: this.parseNullableDecimal(input.compareAtPrice),
        featured: Boolean(input.featured),
        stock: this.parseInteger(input.stock, 0),
        status: this.parseProductStatus(input.status),
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
    });

    await this.syncPrimaryProductImage(
      product.id,
      tenantId,
      input.imageUrl,
      product.name,
    );

    return this.prisma.product.findUnique({
      where: {
        id: product.id,
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
    });
  }

  async updateProduct(productId: string, input: ProductPayload) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const nextSlug = input.slug ? this.slugify(input.slug) : undefined;

    if (nextSlug && nextSlug !== product.slug) {
      await this.ensureUniqueProductSlug(nextSlug, product.tenantId, product.id);
    }

    const updated = await this.prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        name: this.optionalString(input.name),
        slug: nextSlug,
        categoryId:
          input.categoryId === undefined
            ? undefined
            : await this.resolveCategoryId(product.tenantId, input.categoryId),
        shortDescription: this.nullableString(input.shortDescription),
        description: this.nullableString(input.description),
        sku: this.nullableString(input.sku),
        price:
          input.price === undefined
            ? undefined
            : this.parseDecimal(input.price, String(product.price)),
        compareAtPrice:
          input.compareAtPrice === undefined
            ? undefined
            : this.parseNullableDecimal(input.compareAtPrice),
        featured: input.featured,
        stock:
          input.stock === undefined
            ? undefined
            : this.parseInteger(input.stock, product.stock),
        status: this.parseProductStatus(input.status),
      },
    });

    if (input.imageUrl !== undefined) {
      await this.syncPrimaryProductImage(
        updated.id,
        updated.tenantId,
        input.imageUrl,
        updated.name,
      );
    }

    return this.prisma.product.findUnique({
      where: {
        id: updated.id,
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
    });
  }

  async deleteProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    await this.prisma.product.delete({
      where: {
        id: product.id,
      },
    });

    return {
      success: true,
      id: product.id,
    };
  }

  async createPromotion(tenantId: string, input: PromotionPayload) {
    await this.ensureTenant(tenantId);
    const slug = await this.ensurePromotionSlug(
      tenantId,
      input.slug ?? input.name ?? 'promocion',
    );

    const promotion = await this.prisma.promotion.create({
      data: {
        tenantId,
        name: input.name?.trim() ?? 'Promocion',
        slug,
        type: this.parsePromotionType(input.type) ?? PromotionType.PERCENTAGE,
        status: this.parsePromotionStatus(input.status),
        priority: this.parseInteger(input.priority, 0),
        bannerUrl: this.nullableString(input.bannerUrl),
        couponCode: this.nullableString(input.couponCode),
        stackable: Boolean(input.stackable),
        startsAt: this.parseNullableDate(input.startsAt),
        endsAt: this.parseNullableDate(input.endsAt),
      },
      include: {
        coupons: true,
        rules: true,
      },
    });

    await this.syncPromotionCoupon(tenantId, promotion.id, input.couponCode);

    if (input.rules && input.rules.length > 0) {
      await this.syncPromotionRules(promotion.id, input.rules);
    }

    return this.prisma.promotion.findUnique({
      where: {
        id: promotion.id,
      },
      include: {
        coupons: true,
        rules: true,
      },
    });
  }

  async updatePromotion(promotionId: string, input: PromotionPayload) {
    const promotion = await this.prisma.promotion.findUnique({
      where: {
        id: promotionId,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found.');
    }

    const nextSlug = input.slug ? this.slugify(input.slug) : undefined;

    if (nextSlug && nextSlug !== promotion.slug) {
      await this.ensureUniquePromotionSlug(
        nextSlug,
        promotion.tenantId,
        promotion.id,
      );
    }

    const updated = await this.prisma.promotion.update({
      where: {
        id: promotion.id,
      },
      data: {
        name: this.optionalString(input.name),
        slug: nextSlug,
        type: this.parsePromotionType(input.type),
        status: this.parsePromotionStatus(input.status),
        priority:
          input.priority === undefined
            ? undefined
            : this.parseInteger(input.priority, promotion.priority),
        bannerUrl: this.nullableString(input.bannerUrl),
        couponCode: this.nullableString(input.couponCode),
        stackable: input.stackable,
        startsAt: input.startsAt !== undefined ? this.parseNullableDate(input.startsAt) : undefined,
        endsAt: input.endsAt !== undefined ? this.parseNullableDate(input.endsAt) : undefined,
      },
    });

    if (input.couponCode !== undefined) {
      await this.syncPromotionCoupon(
        updated.tenantId,
        updated.id,
        input.couponCode,
      );
    }

    if (input.rules !== undefined) {
      await this.syncPromotionRules(updated.id, input.rules);
    }

    return this.prisma.promotion.findUnique({
      where: {
        id: updated.id,
      },
      include: {
        coupons: true,
        rules: true,
      },
    });
  }

  async deletePromotion(promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: {
        id: promotionId,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found.');
    }

    await this.prisma.coupon.deleteMany({
      where: {
        promotionId: promotion.id,
      },
    });

    await this.prisma.promotion.delete({
      where: {
        id: promotion.id,
      },
    });

    return {
      success: true,
      id: promotion.id,
    };
  }

  private async ensureTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return tenant;
  }

  private async resolveCategoryId(
    tenantId: string,
    categoryId: string | null | undefined,
  ) {
    if (categoryId === undefined) {
      return undefined;
    }

    if (categoryId === null || categoryId === '') {
      return null;
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        tenantId,
      },
    });

    if (!category) {
      throw new BadRequestException('Category does not belong to tenant.');
    }

    return category.id;
  }

  private optionalString(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private nullableString(value: string | null | undefined) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private nullableColor(value: string | null | undefined) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (!/^#([0-9a-fA-F]{6})$/.test(trimmed)) {
      throw new BadRequestException('Colors must be in #RRGGBB format.');
    }

    return trimmed;
  }

  private parseInteger(value: number | undefined, fallback: number) {
    if (value === undefined || Number.isNaN(Number(value))) {
      return fallback;
    }

    return Math.max(0, Math.trunc(Number(value)));
  }

  private parseDecimal(value: number | string | undefined, fallback: string) {
    const parsed =
      value === undefined || value === null || value === ''
        ? Number(fallback)
        : Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException('Price must be a positive number.');
    }

    return new Prisma.Decimal(parsed.toFixed(2));
  }

  private parseNullableDecimal(value: number | string | null | undefined) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException(
        'Compare at price must be a positive number.',
      );
    }

    return new Prisma.Decimal(parsed.toFixed(2));
  }

  private parseProductStatus(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.toUpperCase();

    if (!(normalized in ProductStatus)) {
      throw new BadRequestException('Invalid product status.');
    }

    return normalized as ProductStatus;
  }

  private parsePromotionStatus(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.toUpperCase();

    if (!(normalized in PromotionStatus)) {
      throw new BadRequestException('Invalid promotion status.');
    }

    return normalized as PromotionStatus;
  }

  private parsePromotionType(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.toUpperCase();

    if (!(normalized in PromotionType)) {
      throw new BadRequestException('Invalid promotion type.');
    }

    return normalized as PromotionType;
  }

  private parseTenantStatus(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.toUpperCase();

    if (!(normalized in TenantStatus)) {
      throw new BadRequestException('Invalid tenant status.');
    }

    return normalized as TenantStatus;
  }

  private slugify(value: string) {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!normalized) {
      throw new BadRequestException('A valid slug is required.');
    }

    return normalized;
  }

  private async ensureUniqueTenantSlug(slug: string, excludeTenantId?: string) {
    const existing = await this.prisma.tenant.findFirst({
      where: {
        slug,
        NOT: excludeTenantId ? { id: excludeTenantId } : undefined,
      },
    });

    if (existing) {
      throw new BadRequestException('Tenant slug is already in use.');
    }
  }

  private async ensureUniqueTenantSubdomain(
    subdomain: string,
    excludeTenantId?: string,
  ) {
    const existing = await this.prisma.tenant.findFirst({
      where: {
        subdomain,
        NOT: excludeTenantId ? { id: excludeTenantId } : undefined,
      },
    });

    if (existing) {
      throw new BadRequestException('Tenant subdomain is already in use.');
    }
  }

  private async ensureCategorySlug(tenantId: string, source: string) {
    const baseSlug = this.slugify(source);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await this.prisma.category.findFirst({
        where: {
          tenantId,
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async ensureUniqueCategorySlug(
    slug: string,
    tenantId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.category.findFirst({
      where: {
        tenantId,
        slug,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    if (existing) {
      throw new BadRequestException('Category slug is already in use.');
    }
  }

  private async ensureProductSlug(tenantId: string, source: string) {
    const baseSlug = this.slugify(source);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await this.prisma.product.findFirst({
        where: {
          tenantId,
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async ensureUniqueProductSlug(
    slug: string,
    tenantId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.product.findFirst({
      where: {
        tenantId,
        slug,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    if (existing) {
      throw new BadRequestException('Product slug is already in use.');
    }
  }

  private async ensurePromotionSlug(tenantId: string, source: string) {
    const baseSlug = this.slugify(source);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await this.prisma.promotion.findFirst({
        where: {
          tenantId,
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async ensureUniquePromotionSlug(
    slug: string,
    tenantId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.promotion.findFirst({
      where: {
        tenantId,
        slug,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    if (existing) {
      throw new BadRequestException('Promotion slug is already in use.');
    }
  }

  private async syncPrimaryProductImage(
    productId: string,
    tenantId: string,
    imageUrl: string | null | undefined,
    alt: string,
  ) {
    const existing = await this.prisma.productImage.findFirst({
      where: {
        productId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const nextUrl = imageUrl?.trim();

    if (!nextUrl) {
      if (existing) {
        await this.prisma.productImage.delete({
          where: {
            id: existing.id,
          },
        });
      }

      return;
    }

    if (existing) {
      await this.prisma.productImage.update({
        where: {
          id: existing.id,
        },
        data: {
          url: nextUrl,
          alt,
          sortOrder: 1,
        },
      });

      return;
    }

    await this.prisma.productImage.create({
      data: {
        tenantId,
        productId,
        url: nextUrl,
        alt,
        sortOrder: 1,
      },
    });
  }

  private async syncPromotionCoupon(
    tenantId: string,
    promotionId: string,
    couponCode: string | null | undefined,
  ) {
    const existingCoupons = await this.prisma.coupon.findMany({
      where: {
        promotionId,
      },
    });
    const nextCode = couponCode?.trim();

    if (!nextCode) {
      if (existingCoupons.length > 0) {
        await this.prisma.coupon.deleteMany({
          where: {
            promotionId,
          },
        });
      }

      return;
    }

    const duplicate = await this.prisma.coupon.findFirst({
      where: {
        code: nextCode,
        NOT: {
          promotionId,
        },
      },
    });

    if (duplicate) {
      throw new BadRequestException('Coupon code is already in use.');
    }

    if (existingCoupons[0]) {
      await this.prisma.coupon.update({
        where: {
          id: existingCoupons[0].id,
        },
        data: {
          code: nextCode,
          status: CouponStatus.ACTIVE,
          tenantId,
          promotionId,
        },
      });

      if (existingCoupons.length > 1) {
        await this.prisma.coupon.deleteMany({
          where: {
            promotionId,
            NOT: {
              id: existingCoupons[0].id,
            },
          },
        });
      }

      return;
    }

    await this.prisma.coupon.create({
      data: {
        tenantId,
        promotionId,
        code: nextCode,
        status: CouponStatus.ACTIVE,
        maxUses: 500,
        maxUsesPerCustomer: 1,
      },
    });
  }

  private async syncPrimarySubdomain(tenantId: string, subdomain: string) {
    const rootDomain = this.configService.get('PLATFORM_ROOT_DOMAIN', {
      infer: true,
    });
    const hostname = `${subdomain}.${rootDomain}`;
    const primaryDomain = await this.prisma.domain.findFirst({
      where: {
        tenantId,
        isPrimary: true,
      },
    });

    if (primaryDomain) {
      await this.prisma.domain.update({
        where: {
          id: primaryDomain.id,
        },
        data: {
          hostname,
        },
      });

      return;
    }

    await this.prisma.domain.create({
      data: {
        tenantId,
        hostname,
        type: 'SUBDOMAIN',
        isPrimary: true,
        verificationStatus: 'VERIFIED',
        sslStatus: 'ACTIVE',
      },
    });
  }

  private async syncPromotionRules(
    promotionId: string,
    rules: Array<{
      scope: string;
      operator: string;
      value?: string | null;
      minQuantity?: number;
      minAmount?: number | string;
    }>,
  ) {
    await this.prisma.promotionRule.deleteMany({
      where: { promotionId },
    });

    if (rules.length === 0) {
      return;
    }

    await this.prisma.promotionRule.createMany({
      data: rules.map((rule) => ({
        promotionId,
        scope: rule.scope || 'all_products',
        operator: rule.operator || 'eq',
        value: rule.value ?? null,
        minQuantity: rule.minQuantity ?? null,
        minAmount: rule.minAmount
          ? new Prisma.Decimal(Number(rule.minAmount).toFixed(2))
          : null,
      })),
    });
  }

  private parseNullableDate(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }

    return date;
  }

  private parseBannerStatus(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.toUpperCase();
    const validStatuses = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

    if (!validStatuses.includes(normalized)) {
      throw new BadRequestException('Invalid banner status.');
    }

    return normalized as 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  }

  private parseQuoteRequestStatus(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.toUpperCase();
    const validStatuses = ['PENDING', 'SENT', 'VIEWED', 'CLOSED'];

    if (!validStatuses.includes(normalized)) {
      throw new BadRequestException('Invalid quote request status.');
    }

    return normalized as 'PENDING' | 'SENT' | 'VIEWED' | 'CLOSED';
  }

  // ── Banner CRUD ─────────────────────────────────────

  async createBanner(tenantId: string, input: BannerPayload) {
    await this.ensureTenant(tenantId);

    return this.prisma.banner.create({
      data: {
        tenantId,
        title: input.title?.trim() ?? 'Banner',
        subtitle: this.nullableString(input.subtitle),
        imageUrl: input.imageUrl?.trim() ?? '',
        linkUrl: this.nullableString(input.linkUrl),
        position: this.parseInteger(input.position, 0),
        status: this.parseBannerStatus(input.status) ?? 'DRAFT',
        startsAt: this.parseNullableDate(input.startsAt) ?? null,
        endsAt: this.parseNullableDate(input.endsAt) ?? null,
      },
    });
  }

  async updateBanner(bannerId: string, input: BannerPayload) {
    const banner = await this.prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found.');
    }

    return this.prisma.banner.update({
      where: { id: banner.id },
      data: {
        title: this.optionalString(input.title),
        subtitle: this.nullableString(input.subtitle),
        imageUrl: input.imageUrl !== undefined ? input.imageUrl.trim() : undefined,
        linkUrl: this.nullableString(input.linkUrl),
        position:
          input.position === undefined
            ? undefined
            : this.parseInteger(input.position, banner.position),
        status: this.parseBannerStatus(input.status),
        startsAt: input.startsAt !== undefined ? this.parseNullableDate(input.startsAt) ?? null : undefined,
        endsAt: input.endsAt !== undefined ? this.parseNullableDate(input.endsAt) ?? null : undefined,
      },
    });
  }

  async deleteBanner(bannerId: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found.');
    }

    await this.prisma.banner.delete({
      where: { id: banner.id },
    });

    return { success: true, id: banner.id };
  }

  // ── Quote Requests (Orders) ─────────────────────────

  async getQuoteRequests(tenantId: string, status?: string) {
    await this.ensureTenant(tenantId);

    const where: Prisma.QuoteRequestWhereInput = {
      tenantId,
    };

    const parsedStatus = this.parseQuoteRequestStatus(status);

    if (parsedStatus) {
      where.status = parsedStatus;
    }

    const [quoteRequests, total] = await Promise.all([
      this.prisma.quoteRequest.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
      }),
      this.prisma.quoteRequest.count({ where }),
    ]);

    return { quoteRequests, total };
  }

  async getQuoteRequestDetail(requestId: string) {
    const quoteRequest = await this.prisma.quoteRequest.findUnique({
      where: { id: requestId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!quoteRequest) {
      throw new NotFoundException('Quote request not found.');
    }

    return quoteRequest;
  }

  async updateQuoteRequestStatus(requestId: string, status?: string) {
    const quoteRequest = await this.prisma.quoteRequest.findUnique({
      where: { id: requestId },
    });

    if (!quoteRequest) {
      throw new NotFoundException('Quote request not found.');
    }

    const parsedStatus = this.parseQuoteRequestStatus(status);

    if (!parsedStatus) {
      throw new BadRequestException('A valid status is required.');
    }

    return this.prisma.quoteRequest.update({
      where: { id: quoteRequest.id },
      data: { status: parsedStatus },
      include: {
        items: true,
      },
    });
  }

  // ── Create Tenant ───────────────────────────────────

  async createTenant(input: CreateTenantPayload) {
    const name = input.name.trim();
    const slug = await this.ensureUniqueTenantSlugAuto(
      input.slug ?? name,
    );
    const subdomain = await this.ensureUniqueTenantSubdomainAuto(
      input.subdomain ?? name,
    );

    const tenant = await this.prisma.tenant.create({
      data: {
        name,
        slug,
        subdomain,
        status: 'ACTIVE',
        plan: input.plan?.trim() || 'starter',
        whatsappNumber: input.whatsappNumber?.trim() || null,
        primaryColor: this.nullableColor(input.primaryColor) ?? null,
        secondaryColor: this.nullableColor(input.secondaryColor) ?? null,
      },
    });

    await this.syncPrimarySubdomain(tenant.id, subdomain);

    return this.getTenantDetail(tenant.id);
  }

  private async ensureUniqueTenantSlugAuto(source: string) {
    const baseSlug = this.slugify(source);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await this.prisma.tenant.findFirst({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async ensureUniqueTenantSubdomainAuto(source: string) {
    const baseSub = this.slugify(source);
    let subdomain = baseSub;
    let suffix = 1;

    while (
      await this.prisma.tenant.findFirst({
        where: { subdomain },
      })
    ) {
      subdomain = `${baseSub}-${suffix}`;
      suffix += 1;
    }

    return subdomain;
  }
}
