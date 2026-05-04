import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getHome() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        banners: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
          take: 1,
        },
        categories: {
          orderBy: [{ position: 'asc' }, { name: 'asc' }],
          take: 4,
        },
        products: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            images: {
              orderBy: {
                sortOrder: 'asc',
              },
              take: 1,
            },
          },
          orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
          take: 3,
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
      take: 12,
    });

    const featuredProducts = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        featured: true,
        tenant: {
          status: 'ACTIVE',
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subdomain: true,
            primaryColor: true,
            secondaryColor: true,
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
      orderBy: [{ updatedAt: 'desc' }],
      take: 18,
    });

    const categories = await this.prisma.category.findMany({
      where: {
        tenant: {
          status: 'ACTIVE',
        },
      },
      include: {
        tenant: {
          select: {
            slug: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      take: 20,
    });

    return {
      heroTenants: tenants.slice(0, 3),
      tenants,
      featuredProducts,
      categories,
    };
  }
}
