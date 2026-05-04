export type AdminMetrics = {
  tenants: number;
  products: number;
  categories: number;
  promotions: number;
  banners: number;
};

export type AdminRecentProduct = {
  id: string;
  name: string;
  price: number | string;
  tenant: {
    name: string;
    slug: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
  }>;
};

export type AdminRecentTenant = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  plan: string;
  _count: {
    products: number;
    categories: number;
  };
};

export type AdminTenant = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  plan: string;
  domains: Array<{
    id: string;
    hostname: string;
    isPrimary: boolean;
  }>;
  _count: {
    products: number;
    categories: number;
    promotions: number;
  };
};

export type AdminTenantDetail = AdminTenant & {
  logoUrl: string | null;
  coverUrl: string | null;
  whatsappNumber: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  banners: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string;
    linkUrl: string | null;
    status: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    position: number;
    _count: {
      products: number;
    };
  }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    sku: string | null;
    price: number | string;
    compareAtPrice: number | string | null;
    featured: boolean;
    stock: number;
    status: string;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    images: Array<{
      id: string;
      url: string;
      alt: string | null;
    }>;
    options: Array<{
      id: string;
      name: string;
      position: number;
      values: Array<{
        id: string;
        value: string;
        position: number;
      }>;
    }>;
    variants: Array<{
      id: string;
      name: string;
      sku: string | null;
      price: number | string | null;
      compareAtPrice: number | string | null;
      stock: number;
      weight: number | string | null;
      imageId: string | null;
      imageUrl?: string | null;
      image: { id: string; url: string } | null;
      options: Array<{
        optionId: string;
        valueId: string;
        option: { name: string };
        value: { value: string };
      }>;
    }>;
  }>;
  promotions: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    priority: number;
    bannerUrl: string | null;
    couponCode: string | null;
    stackable: boolean;
    coupons: Array<{
      id: string;
      code: string;
      status: string;
    }>;
    rules: Array<{
      id: string;
      scope: string;
      operator: string;
      value: string | null;
    }>;
  }>;
};

export type AdminOverviewResponse = {
  metrics: AdminMetrics;
  recentTenants: AdminRecentTenant[];
  recentProducts: AdminRecentProduct[];
};

export type AuthMeResponse = {
  supabaseUser: {
    id: string;
    email?: string;
  };
  appUser: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  memberships: Array<{
    id: string;
    tenantId: string | null;
    role: string;
    tenant: {
      id: string;
      name: string;
      slug: string;
      subdomain: string;
    } | null;
  }>;
  roles: string[];
};

export type AdminBanner = {
  id: string;
  tenantId: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: number;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
};

export type AdminQuoteRequestItem = {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: string | null;
  variantName: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ id: string; url: string; alt: string | null }>;
  } | null;
};

export type AdminQuoteRequest = {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  message: string | null;
  source: string;
  status: string;
  subtotal: string | null;
  total: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: AdminQuoteRequestItem[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
};

export type AdminQuoteRequestsResponse = {
  quoteRequests: AdminQuoteRequest[];
  total: number;
};

export type CreateTenantInput = {
  name: string;
  slug?: string;
  subdomain?: string;
  plan?: string;
  whatsappNumber?: string;
  primaryColor?: string;
  secondaryColor?: string;
};
