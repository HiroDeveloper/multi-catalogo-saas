import { getPublicEnv } from "@/lib/env";

export type MarketplaceBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

export type MarketplaceTenant = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  banners: MarketplaceBanner[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  _count: {
    products: number;
    categories: number;
    promotions: number;
  };
};

export type MarketplaceProduct = {
  id: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
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
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    primaryColor: string | null;
    secondaryColor: string | null;
  };
};

export type MarketplaceCategory = {
  id: string;
  name: string;
  slug: string;
  tenant: {
    slug: string;
    name: string;
  };
  _count: {
    products: number;
  };
};

export type MarketplaceHomeResponse = {
  heroTenants: MarketplaceTenant[];
  tenants: MarketplaceTenant[];
  featuredProducts: MarketplaceProduct[];
  categories: MarketplaceCategory[];
};

export async function getMarketplaceHome(): Promise<MarketplaceHomeResponse | null> {
  const env = getPublicEnv();

  try {
    const response = await fetch(
      `${env.apiUrl.replace(/\/$/, "")}/marketplace/home`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MarketplaceHomeResponse;
  } catch {
    return null;
  }
}
