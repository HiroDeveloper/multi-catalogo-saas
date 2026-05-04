import { getPublicEnv } from "@/lib/env";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    products: number;
  };
};

export type StorefrontBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

export type StorefrontPromotion = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  couponCode: string | null;
  rules: Array<{
    id: string;
    scope: string;
    operator: string;
    value: string | null;
  }>;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  slug: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  featured: boolean;
  stock: number;
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
  promotion?: {
    name: string;
    type: string;
    finalPrice: string;
    discountPercent: number;
  };
};

export type StorefrontTenant = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  plan: string;
  logoUrl: string | null;
  coverUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  whatsappNumber: string | null;
};

export type StorefrontResponse = {
  tenant: StorefrontTenant;
  categories: StorefrontCategory[];
  banners: StorefrontBanner[];
  featuredProducts: StorefrontProduct[];
  promotions: StorefrontPromotion[];
};

export type TenantProductsResponse = {
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  total: number;
  products: StorefrontProduct[];
};

export type QuoteRequestResponse = {
  quoteRequestId: string;
  total: string;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    quantity: number;
    unitPrice: string | null;
  }>;
  whatsappUrl: string | null;
};

export async function getStorefront(
  tenantSlug: string,
): Promise<StorefrontResponse | null> {
  const env = getPublicEnv();

  try {
    const response = await fetch(
      `${env.apiUrl.replace(/\/$/, "")}/catalog/${tenantSlug}/storefront`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as StorefrontResponse;
  } catch {
    return null;
  }
}

export async function getTenantProducts(
  tenantSlug: string,
  searchParams?: Record<string, string>,
): Promise<TenantProductsResponse | null> {
  const env = getPublicEnv();
  const url = new URL(
    `${env.apiUrl.replace(/\/$/, "")}/catalog/${tenantSlug}/products`,
  );

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TenantProductsResponse;
  } catch {
    return null;
  }
}

export async function createQuoteRequest(
  tenantSlug: string,
  body: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    message?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  },
): Promise<QuoteRequestResponse | null> {
  const env = getPublicEnv();

  try {
    const response = await fetch(
      `${env.apiUrl.replace(/\/$/, "")}/catalog/${tenantSlug}/quote-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as QuoteRequestResponse;
  } catch {
    return null;
  }
}
