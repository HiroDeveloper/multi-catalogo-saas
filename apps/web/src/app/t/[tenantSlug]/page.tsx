import Link from "next/link";
import {
  getStorefront,
  getTenantProducts,
  type StorefrontResponse,
  type TenantProductsResponse,
} from "@/lib/api/catalog";
import { TenantStorefrontClient } from "@/components/storefront/tenant-storefront-client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    tenantSlug: string;
  }>;
};

export default async function TenantPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const storefront = (await getStorefront(tenantSlug)) as StorefrontResponse | null;
  const productsResponse = (await getTenantProducts(tenantSlug, {
    limit: "24",
  })) as TenantProductsResponse | null;

  if (!storefront || !productsResponse) {
    return (
      <main className="min-h-screen bg-[#f2f6ff] px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-10 shadow-[0_24px_60px_rgba(23,104,229,0.12)]">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">
            Tienda no disponible
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            El subdominio ya esta conectado, pero esta tienda no devolvio datos
            desde la API.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white"
          >
            Volver
          </Link>
        </div>
      </main>
    );
  }

  return (
    <TenantStorefrontClient
      tenantSlug={tenantSlug}
      storefront={storefront}
      productsResponse={productsResponse}
    />
  );
}
