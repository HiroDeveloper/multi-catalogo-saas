import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  LayoutDashboard,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import {
  getMarketplaceHome,
  type MarketplaceCategory,
  type MarketplaceProduct,
  type MarketplaceTenant,
} from "@/lib/api/marketplace";
import { getPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function formatCurrency(value: unknown) {
  const parsed =
    typeof value === "string" ? Number(value) : typeof value === "number" ? value : 0;

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(parsed);
}

function buildTenantHref(rootDomain: string, tenantSlug: string) {
  const isLocal = rootDomain === "lvh.me" || rootDomain.endsWith(".local");
  const protocol = isLocal ? "http" : "https";
  const port = isLocal ? ":3000" : "";

  return `${protocol}://${tenantSlug}.${rootDomain}${port}/`;
}

export default async function MarketplacePage() {
  const env = getPublicEnv();
  const data = await getMarketplaceHome();

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f4f7fd] px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-10 shadow-[0_24px_60px_rgba(23,104,229,0.12)]">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">
            Marketplace no disponible
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            La raiz del proyecto ya esta preparada para funcionar como portal
            principal multiempresa, pero la API no respondio datos.
          </p>
        </div>
      </main>
    );
  }

  const heroTenants = data.heroTenants ?? [];
  const tenants = data.tenants ?? [];
  const products = data.featuredProducts ?? [];
  const categories = data.categories ?? [];

  return (
    <main className="min-h-screen bg-[#f4f7fd] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white shadow-[0_10px_30px_rgba(23,104,229,0.35)]">
              <Store className="size-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Marketplace
              </div>
              <div className="text-lg font-semibold tracking-[-0.02em]">
                Multi Catalogo
              </div>
            </div>
          </div>

          <div className="hidden max-w-md flex-1 lg:block">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-400 transition-all focus-within:border-[#1768e5]/40 focus-within:shadow-[0_0_0_3px_rgba(23,104,229,0.1)]">
              <Search className="size-4" />
              Buscar tiendas, productos o categorias
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(23,104,229,0.3)] transition-all hover:shadow-[0_12px_32px_rgba(23,104,229,0.4)] active:scale-95"
            >
              <LayoutDashboard className="size-4" />
              Admin demo
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="overflow-hidden rounded-[36px] bg-white shadow-[0_24px_60px_rgba(23,104,229,0.12)]">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#1768e5]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1768e5]">
                  <Sparkles className="size-3" />
                  Multiempresa
                </div>
                <div>
                  <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.06em] text-slate-900 lg:text-6xl">
                    Marketplace principal con tiendas por subdominio y admin central.
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                    Portal principal para descubrir tiendas, promociones y productos.
                    Cada empresa vive en su propio subdominio y el superadmin opera
                    todo desde un panel central.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Ver panel admin
                    <ChevronRight className="size-4" />
                  </Link>
                  {heroTenants[0] ? (
                    <a
                      href={buildTenantHref(env.rootDomain, heroTenants[0].slug)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Abrir tienda demo
                      <ChevronRight className="size-4" />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4">
                {heroTenants.map((tenant: MarketplaceTenant) => (
                  <a
                    key={tenant.id}
                    href={buildTenantHref(env.rootDomain, tenant.slug)}
                    className="group overflow-hidden rounded-[28px] bg-[#1768e5] text-white shadow-[0_20px_50px_rgba(23,104,229,0.2)]"
                  >
                    <div className="relative min-h-[220px]">
                      {tenant.banners[0]?.imageUrl ? (
                        <Image
                          src={tenant.banners[0].imageUrl}
                          alt={tenant.banners[0].title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="50vw"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1768e5]/88 via-[#1768e5]/62 to-[#1768e5]/20" />
                      <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-5">
                        <div className="inline-flex w-fit rounded-full bg-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/90">
                          {tenant.categories[0]?.name ?? "Catalogo"}
                        </div>
                        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                          {tenant.name}
                        </h2>
                        <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                          <span>{tenant._count.products} productos</span>
                          <span>{tenant._count.categories} categorias</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

        <section className="overflow-hidden rounded-[36px] bg-[#152d60] p-6 text-white shadow-[0_24px_60px_rgba(21,45,96,0.18)] lg:p-8">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/60">
              <Zap className="size-3" />
              Estado de plataforma
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              Multi tenant funcionando
            </h2>
            <div className="mt-6 space-y-3 stagger-children">
              {[
                { label: `${tenants.length} tiendas activas`, icon: "🏪" },
                { label: `${products.length} productos destacados`, icon: "📦" },
                { label: `${categories.length} categorias indexadas`, icon: "🏷️" },
                { label: `Subdominios sobre ${env.rootDomain}`, icon: "🌐" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[36px] bg-white p-6 shadow-[0_24px_60px_rgba(23,104,229,0.10)] lg:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Tiendas
              </div>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                Catalogos por empresa
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories
                .slice(0, 7)
                .map((category: MarketplaceCategory, index: number) => (
                  <span
                    key={`${category.id}-${category.tenant.slug}`}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      index === 0
                        ? "bg-[#1768e5] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {category.name}
                  </span>
                ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 stagger-children lg:grid-cols-2 xl:grid-cols-4">
            {tenants.map((tenant: MarketplaceTenant) => (
              <article
                key={tenant.id}
                className="card-lift animate-fade-in-up overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="relative aspect-[5/3] bg-slate-100">
                  {tenant.banners[0]?.imageUrl ? (
                    <Image
                      src={tenant.banners[0].imageUrl}
                      alt={tenant.banners[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : null}
                  <div className="absolute left-4 top-4 rounded-full bg-[#1768e5] px-3 py-1 text-xs font-semibold text-white">
                    {tenant.categories[0]?.name ?? "Tienda"}
                  </div>
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                      {tenant.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {tenant.banners[0]?.subtitle ??
                        "Catalogo visual con promociones y pedido a WhatsApp."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{tenant._count.products} productos</span>
                    <span>{tenant._count.promotions} promos</span>
                  </div>
                  <a
                    href={buildTenantHref(env.rootDomain, tenant.slug)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(23,104,229,0.25)] transition-all hover:shadow-[0_10px_28px_rgba(23,104,229,0.35)] active:scale-95"
                  >
                    Entrar
                    <ChevronRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] bg-white p-6 shadow-[0_24px_60px_rgba(23,104,229,0.10)] lg:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Productos destacados
              </div>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                Venta cruzada del marketplace
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 stagger-children sm:grid-cols-2 xl:grid-cols-6">
            {products.map((product: MarketplaceProduct) => (
              <article
                key={product.id}
                className="card-lift animate-fade-in-up overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 16vw"
                    />
                  ) : null}
                  <div className="absolute left-3 top-3 rounded-full bg-[#1768e5] px-3 py-1 text-[11px] font-semibold text-white">
                    Mas vendido
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {product.tenant.name}
                    </p>
                  </div>
                  <div className="text-2xl font-semibold tracking-[-0.04em] text-[#1768e5]">
                    {formatCurrency(product.price)}
                  </div>
                  <a
                    href={buildTenantHref(env.rootDomain, product.tenant.slug)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-[#1768e5]/30 hover:text-[#1768e5] active:scale-95"
                  >
                    <ShoppingCart className="size-4" />
                    Ver tienda
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-4 rounded-[36px] bg-[#0f172a] p-8 text-white lg:p-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#1768e5]">
                  <Store className="size-5" />
                </div>
                <span className="text-lg font-semibold">Multi Catalogo</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Plataforma SaaS multi-tenant para catalogos digitales con storefront propio, admin central y checkout por WhatsApp.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Plataforma
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li className="transition-colors hover:text-white"><Link href="/dashboard">Panel admin</Link></li>
                <li className="transition-colors hover:text-white"><Link href="/dashboard/tenants">Gestion de tiendas</Link></li>
                <li className="transition-colors hover:text-white"><a href="#">Documentacion</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Funcionalidades
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>✅ Subdominios automaticos</li>
                <li>✅ Promociones con precios dinamicos</li>
                <li>✅ Checkout a WhatsApp</li>
                <li>✅ Almacenamiento en Cloudflare R2</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-xs text-slate-500">© 2026 Multi Catalogo SaaS. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistema operativo · v1.0.0
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
