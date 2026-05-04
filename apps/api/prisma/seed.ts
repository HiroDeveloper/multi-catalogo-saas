import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TenantSeed = {
  name: string;
  slug: string;
  subdomain: string;
  whatsappNumber: string;
  primaryColor: string;
  secondaryColor: string;
  coverUrl: string;
  categories: Array<{
    name: string;
    slug: string;
    description: string;
  }>;
  banners: Array<{
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
  }>;
  products: Array<{
    name: string;
    slug: string;
    categorySlug: string;
    shortDescription: string;
    description: string;
    sku: string;
    price: string;
    compareAtPrice?: string;
    featured?: boolean;
    stock: number;
    imageUrl: string;
  }>;
  promotion?: {
    name: string;
    slug: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SPECIAL_PRICE' | 'BUY_X_GET_Y';
    couponCode: string;
    categorySlug: string;
  };
};

const tenantsSeed: TenantSeed[] = [
  {
    name: 'Indumentaria',
    slug: 'indumentaria-demo',
    subdomain: 'indumentaria-demo',
    whatsappNumber: '573001112233',
    primaryColor: '#1768e5',
    secondaryColor: '#25c1f6',
    coverUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    categories: [
      {
        name: 'Zapatillas',
        slug: 'zapatillas',
        description: 'Calzado deportivo y urbano para venta por catálogo.',
      },
      {
        name: 'Remeras',
        slug: 'remeras',
        description: 'Básicos y entrenamiento con stock visible.',
      },
      {
        name: 'Medias',
        slug: 'medias',
        description: 'Accesorios de apoyo para running y gym.',
      },
    ],
    banners: [
      {
        title: 'Nueva temporada',
        subtitle: 'Zapatillas y textil con salida directa a WhatsApp',
        imageUrl:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/promociones/nueva-temporada',
      },
      {
        title: 'Entrena mejor',
        subtitle: 'Productos listos para vender por catálogo',
        imageUrl:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/colecciones/entrenamiento',
      },
    ],
    products: [
      {
        name: 'Nike Vapor Run',
        slug: 'nike-vapor-run',
        categorySlug: 'zapatillas',
        shortDescription: 'Modelo destacado para running urbano.',
        description: 'Producto demo para validar catálogo, promociones y flujo de pedido a WhatsApp.',
        sku: 'IND-NVR-001',
        price: '129.90',
        compareAtPrice: '159.90',
        featured: true,
        stock: 12,
        imageUrl:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Jordan Delta 3',
        slug: 'jordan-delta-3',
        categorySlug: 'zapatillas',
        shortDescription: 'Zapatilla urbana con foco en confort.',
        description: 'Referencia demo para catálogo visual con precio promocional.',
        sku: 'IND-JD3-002',
        price: '114.00',
        compareAtPrice: '139.00',
        featured: true,
        stock: 9,
        imageUrl:
          'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Remera Dry Motion',
        slug: 'remera-dry-motion',
        categorySlug: 'remeras',
        shortDescription: 'Textil técnico para entrenamiento diario.',
        description: 'Producto base para validar categorías, filtros y merchandising.',
        sku: 'IND-RDM-003',
        price: '34.50',
        compareAtPrice: '44.00',
        stock: 22,
        imageUrl:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Pack Running Socks',
        slug: 'pack-running-socks',
        categorySlug: 'medias',
        shortDescription: 'Pack técnico de alto giro.',
        description: 'Accesorio rentable para sumar al carrito o pedido por WhatsApp.',
        sku: 'IND-PRS-004',
        price: '18.90',
        compareAtPrice: '24.90',
        stock: 30,
        imageUrl:
          'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    promotion: {
      name: 'Apertura 20 OFF',
      slug: 'apertura-20-off',
      type: 'PERCENTAGE',
      couponCode: 'APERTURA20',
      categorySlug: 'zapatillas',
    },
  },
  {
    name: 'Tecnologia',
    slug: 'tecnologia-demo',
    subdomain: 'tecnologia-demo',
    whatsappNumber: '573001112244',
    primaryColor: '#5b2df5',
    secondaryColor: '#8c5eff',
    coverUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
    categories: [
      {
        name: 'Auriculares',
        slug: 'auriculares',
        description: 'Audio, inalámbricos y accesorios.',
      },
      {
        name: 'Wearables',
        slug: 'wearables',
        description: 'Relojes y dispositivos inteligentes.',
      },
      {
        name: 'Accesorios',
        slug: 'accesorios',
        description: 'Carga, cables y setup personal.',
      },
    ],
    banners: [
      {
        title: 'Audio y conectividad',
        subtitle: 'Campañas rápidas para vender por WhatsApp',
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/promociones/audio',
      },
    ],
    products: [
      {
        name: 'Auriculares Pulse Pro',
        slug: 'auriculares-pulse-pro',
        categorySlug: 'auriculares',
        shortDescription: 'Cancelación de ruido y batería extendida.',
        description: 'Producto demo para tenant tecnología con enfoque en audio premium.',
        sku: 'TEC-APP-101',
        price: '89.90',
        compareAtPrice: '119.90',
        featured: true,
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Smartwatch Nova',
        slug: 'smartwatch-nova',
        categorySlug: 'wearables',
        shortDescription: 'Notificaciones, salud y tracking deportivo.',
        description: 'Referencia demo para mix de catálogo y campañas de temporada.',
        sku: 'TEC-SWN-102',
        price: '119.00',
        compareAtPrice: '149.00',
        featured: true,
        stock: 11,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Dock USB-C Desk',
        slug: 'dock-usbc-desk',
        categorySlug: 'accesorios',
        shortDescription: 'Base compacta para productividad.',
        description: 'Accesorio tech para catálogos B2C o venta directa por chat.',
        sku: 'TEC-DUD-103',
        price: '49.90',
        compareAtPrice: '64.90',
        stock: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    promotion: {
      name: 'Tech Week',
      slug: 'tech-week',
      type: 'FIXED_AMOUNT',
      couponCode: 'TECH15',
      categorySlug: 'auriculares',
    },
  },
  {
    name: 'Fitness Gym',
    slug: 'fitness-gym-demo',
    subdomain: 'fitness-gym-demo',
    whatsappNumber: '573001112255',
    primaryColor: '#1652c8',
    secondaryColor: '#18c8f2',
    coverUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
    categories: [
      {
        name: 'Suplementos',
        slug: 'suplementos',
        description: 'Pre, post y apoyo deportivo.',
      },
      {
        name: 'Pesas',
        slug: 'pesas',
        description: 'Accesorios y fuerza funcional.',
      },
      {
        name: 'Indumentaria',
        slug: 'indumentaria',
        description: 'Ropa y básicos para entrenamiento.',
      },
    ],
    banners: [
      {
        title: 'Catálogo fitness',
        subtitle: 'Suplementos y entrenamiento con salida inmediata',
        imageUrl:
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/promociones/fitness',
      },
    ],
    products: [
      {
        name: 'Pre Workout Core',
        slug: 'pre-workout-core',
        categorySlug: 'suplementos',
        shortDescription: 'Impulso previo para entrenamientos intensos.',
        description: 'Producto demo de alto margen para panel multiempresa.',
        sku: 'FIT-PWC-201',
        price: '45.00',
        compareAtPrice: '58.00',
        featured: true,
        stock: 18,
        imageUrl:
          'https://images.unsplash.com/photo-1594737625785-c45c45cfdb0d?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Mancuernas Hex 10kg',
        slug: 'mancuernas-hex-10kg',
        categorySlug: 'pesas',
        shortDescription: 'Set funcional para hogar y gimnasio.',
        description: 'Artículo demo para validar mix de catálogo y venta por WhatsApp.',
        sku: 'FIT-MH10-202',
        price: '62.00',
        compareAtPrice: '74.00',
        stock: 8,
        imageUrl:
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Tank Performance',
        slug: 'tank-performance',
        categorySlug: 'indumentaria',
        shortDescription: 'Prenda ligera y respirable.',
        description: 'Indumentaria demo para tienda fitness dentro del marketplace.',
        sku: 'FIT-TP-203',
        price: '28.00',
        compareAtPrice: '34.00',
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    promotion: {
      name: 'Gym Days',
      slug: 'gym-days',
      type: 'PERCENTAGE',
      couponCode: 'GYM10',
      categorySlug: 'suplementos',
    },
  },
  {
    name: 'Muebles de Sala',
    slug: 'muebles-sala-demo',
    subdomain: 'muebles-sala-demo',
    whatsappNumber: '573001112266',
    primaryColor: '#26344a',
    secondaryColor: '#a36f4f',
    coverUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    categories: [
      {
        name: 'Sala',
        slug: 'sala',
        description: 'Sofás y piezas principales.',
      },
      {
        name: 'Mesas',
        slug: 'mesas',
        description: 'Mesas de centro y apoyo.',
      },
      {
        name: 'Decoracion',
        slug: 'decoracion',
        description: 'Complementos para cierre de venta.',
      },
    ],
    banners: [
      {
        title: 'Living renovado',
        subtitle: 'Muebles listos para catálogo y cotización por WhatsApp',
        imageUrl:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/promociones/hogar',
      },
    ],
    products: [
      {
        name: 'Sofa Oslo',
        slug: 'sofa-oslo',
        categorySlug: 'sala',
        shortDescription: 'Diseño limpio para sala contemporánea.',
        description: 'Producto demo para rubro hogar y multiempresa.',
        sku: 'HOG-SO-301',
        price: '649.00',
        compareAtPrice: '749.00',
        featured: true,
        stock: 4,
        imageUrl:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Mesa Aura',
        slug: 'mesa-aura',
        categorySlug: 'mesas',
        shortDescription: 'Mesa de centro en madera clara.',
        description: 'Apoyo ideal para mix de catálogo de hogar.',
        sku: 'HOG-MA-302',
        price: '189.00',
        compareAtPrice: '229.00',
        stock: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Lampara Halo',
        slug: 'lampara-halo',
        categorySlug: 'decoracion',
        shortDescription: 'Pieza decorativa para elevar ticket medio.',
        description: 'Demo para decoración y venta cruzada.',
        sku: 'HOG-LH-303',
        price: '78.00',
        compareAtPrice: '95.00',
        stock: 16,
        imageUrl:
          'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    promotion: {
      name: 'Living Sale',
      slug: 'living-sale',
      type: 'SPECIAL_PRICE',
      couponCode: 'LIVING30',
      categorySlug: 'sala',
    },
  },
];

async function main() {
  const superAdmin = await prisma.user.upsert({
    where: {
      email: 'admin@multicatalogo.demo',
    },
    update: {
      displayName: 'Admin',
    },
    create: {
      email: 'admin@multicatalogo.demo',
      supabaseUserId: 'supabase-super-admin-demo',
      displayName: 'Admin',
    },
  });

  const existingSuperAdminMembership = await prisma.membership.findFirst({
    where: {
      userId: superAdmin.id,
      tenantId: null,
      role: 'SUPER_ADMIN',
    },
  });

  if (!existingSuperAdminMembership) {
    await prisma.membership.create({
      data: {
        userId: superAdmin.id,
        tenantId: null,
        role: 'SUPER_ADMIN',
      },
    });
  }

  for (const tenantSeed of tenantsSeed) {
    await seedTenant(tenantSeed);
  }
}

async function seedTenant(seed: TenantSeed) {
  const tenant = await prisma.tenant.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      status: 'ACTIVE',
      plan: 'starter',
      coverUrl: seed.coverUrl,
      primaryColor: seed.primaryColor,
      secondaryColor: seed.secondaryColor,
      whatsappNumber: seed.whatsappNumber,
    },
    create: {
      name: seed.name,
      slug: seed.slug,
      subdomain: seed.subdomain,
      status: 'ACTIVE',
      plan: 'starter',
      coverUrl: seed.coverUrl,
      primaryColor: seed.primaryColor,
      secondaryColor: seed.secondaryColor,
      whatsappNumber: seed.whatsappNumber,
    },
  });

  await upsertDomain(tenant.id, `${seed.subdomain}.lvh.me`);
  await upsertDomain(tenant.id, `${seed.subdomain}.midominio.local`);

  const owner = await prisma.user.upsert({
    where: { email: `owner@${seed.slug}.demo` },
    update: {
      displayName: `${seed.name} Owner`,
    },
    create: {
      email: `owner@${seed.slug}.demo`,
      supabaseUserId: `supabase-${seed.slug}-owner`,
      displayName: `${seed.name} Owner`,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_tenantId_role: {
        userId: owner.id,
        tenantId: tenant.id,
        role: 'TENANT_OWNER',
      },
    },
    update: {},
    create: {
      userId: owner.id,
      tenantId: tenant.id,
      role: 'TENANT_OWNER',
    },
  });

  const categoriesMap = new Map<string, string>();

  for (let index = 0; index < seed.categories.length; index += 1) {
    const categorySeed = seed.categories[index];
    const category = await prisma.category.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: categorySeed.slug,
        },
      },
      update: {
        name: categorySeed.name,
        description: categorySeed.description,
        position: index + 1,
      },
      create: {
        tenantId: tenant.id,
        name: categorySeed.name,
        slug: categorySeed.slug,
        description: categorySeed.description,
        position: index + 1,
      },
    });

    categoriesMap.set(categorySeed.slug, category.id);
  }

  for (let index = 0; index < seed.banners.length; index += 1) {
    const bannerSeed = seed.banners[index];
    const existingBanner = await prisma.banner.findFirst({
      where: {
        tenantId: tenant.id,
        title: bannerSeed.title,
      },
    });

    if (existingBanner) {
      await prisma.banner.update({
        where: {
          id: existingBanner.id,
        },
        data: {
          subtitle: bannerSeed.subtitle,
          imageUrl: bannerSeed.imageUrl,
          linkUrl: bannerSeed.linkUrl,
          position: index + 1,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.banner.create({
        data: {
          tenantId: tenant.id,
          title: bannerSeed.title,
          subtitle: bannerSeed.subtitle,
          imageUrl: bannerSeed.imageUrl,
          linkUrl: bannerSeed.linkUrl,
          position: index + 1,
          status: 'ACTIVE',
        },
      });
    }
  }

  for (const productSeed of seed.products) {
    const categoryId = categoriesMap.get(productSeed.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for slug ${productSeed.categorySlug}`);
    }

    const product = await prisma.product.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: productSeed.slug,
        },
      },
      update: {
        categoryId,
        name: productSeed.name,
        shortDescription: productSeed.shortDescription,
        description: productSeed.description,
        sku: productSeed.sku,
        price: new Prisma.Decimal(productSeed.price),
        compareAtPrice: productSeed.compareAtPrice
          ? new Prisma.Decimal(productSeed.compareAtPrice)
          : null,
        status: 'ACTIVE',
        featured: productSeed.featured ?? false,
        stock: productSeed.stock,
      },
      create: {
        tenantId: tenant.id,
        categoryId,
        name: productSeed.name,
        slug: productSeed.slug,
        shortDescription: productSeed.shortDescription,
        description: productSeed.description,
        sku: productSeed.sku,
        price: new Prisma.Decimal(productSeed.price),
        compareAtPrice: productSeed.compareAtPrice
          ? new Prisma.Decimal(productSeed.compareAtPrice)
          : null,
        status: 'ACTIVE',
        featured: productSeed.featured ?? false,
        stock: productSeed.stock,
      },
    });

    await upsertProductImage({
      tenantId: tenant.id,
      productId: product.id,
      url: productSeed.imageUrl,
      alt: productSeed.name,
    });
  }

  if (seed.promotion) {
    const categoryId = categoriesMap.get(seed.promotion.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing promotion category for slug ${seed.promotion.categorySlug}`);
    }

    const promotion = await prisma.promotion.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: seed.promotion.slug,
        },
      },
      update: {
        name: seed.promotion.name,
        type: seed.promotion.type,
        status: 'ACTIVE',
        couponCode: seed.promotion.couponCode,
        priority: 1,
      },
      create: {
        tenantId: tenant.id,
        name: seed.promotion.name,
        slug: seed.promotion.slug,
        type: seed.promotion.type,
        status: 'ACTIVE',
        couponCode: seed.promotion.couponCode,
        priority: 1,
        stackable: false,
      },
    });

    const existingRule = await prisma.promotionRule.findFirst({
      where: {
        promotionId: promotion.id,
        scope: 'category',
        operator: 'equals',
        value: categoryId,
      },
    });

    if (!existingRule) {
      await prisma.promotionRule.create({
        data: {
          promotionId: promotion.id,
          scope: 'category',
          operator: 'equals',
          value: categoryId,
        },
      });
    }

    await prisma.coupon.upsert({
      where: {
        code: seed.promotion.couponCode,
      },
      update: {
        tenantId: tenant.id,
        promotionId: promotion.id,
        status: 'ACTIVE',
      },
      create: {
        tenantId: tenant.id,
        code: seed.promotion.couponCode,
        promotionId: promotion.id,
        status: 'ACTIVE',
        maxUses: 500,
        maxUsesPerCustomer: 1,
      },
    });
  }
}

async function upsertDomain(tenantId: string, hostname: string) {
  await prisma.domain.upsert({
    where: { hostname },
    update: {
      tenantId,
      type: 'SUBDOMAIN',
      isPrimary: hostname.endsWith('.lvh.me'),
      verificationStatus: 'VERIFIED',
      sslStatus: 'ACTIVE',
    },
    create: {
      tenantId,
      hostname,
      type: 'SUBDOMAIN',
      isPrimary: hostname.endsWith('.lvh.me'),
      verificationStatus: 'VERIFIED',
      sslStatus: 'ACTIVE',
    },
  });
}

async function upsertProductImage(data: {
  tenantId: string;
  productId: string;
  url: string;
  alt: string;
}) {
  const existing = await prisma.productImage.findFirst({
    where: {
      productId: data.productId,
      url: data.url,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.productImage.create({
    data: {
      tenantId: data.tenantId,
      productId: data.productId,
      url: data.url,
      alt: data.alt,
      sortOrder: 1,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
