import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShoppingCart,
  Store,
  Package,
  Layers,
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
  return `/t/${tenantSlug}`;
}

export default async function MarketplacePage() {
  const env = getPublicEnv();
  const data = await getMarketplaceHome();

  if (!data) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 flex items-center justify-center">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
            Plataforma en mantenimiento
          </h1>
          <p className="mt-4 text-neutral-500">
            Estamos preparando la plataforma multi-catálogo. Vuelve pronto.
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
    <main className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Plataforma B2B
              </div>
              <div className="font-semibold tracking-tight text-neutral-900">
                MultiCatálogo
              </div>
            </div>
          </div>

          <div className="hidden flex-1 max-w-md mx-8 lg:block">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-400 transition-colors focus-within:border-neutral-400 focus-within:bg-white">
              <Search className="h-4 w-4" />
              <input 
                type="text" 
                placeholder="Buscar catálogos o marcas..." 
                className="bg-transparent border-none outline-none w-full text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800"
            >
              Portal Empresas
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-100 via-neutral-50 to-neutral-50 -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-neutral-600 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                Infraestructura E-commerce B2B
              </div>
              <h1 className="text-5xl font-medium tracking-tight text-neutral-900 lg:text-7xl lg:leading-[1.1]">
                Digitaliza el catálogo de tu empresa.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-neutral-500">
                La plataforma diseñada para mayoristas y marcas. Administra múltiples catálogos, gestiona inventario en tiempo real y recibe pedidos directamente a tu canal de ventas preferido.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-black/10"
                >
                  Comenzar ahora
                </Link>
                {heroTenants[0] && (
                  <a
                    href={buildTenantHref(env.rootDomain, heroTenants[0].slug)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium text-neutral-900 shadow-sm border border-neutral-200 transition-all hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    Ver catálogo demo
                  </a>
                )}
              </div>
              
              <div className="mt-12 flex items-center gap-8 border-t border-neutral-200 pt-8">
                <div>
                  <div className="text-3xl font-medium tracking-tight text-neutral-900">+{tenants.length}</div>
                  <div className="text-sm font-medium text-neutral-500 mt-1">Marcas activas</div>
                </div>
                <div className="w-px h-12 bg-neutral-200"></div>
                <div>
                  <div className="text-3xl font-medium tracking-tight text-neutral-900">+{products.length}</div>
                  <div className="text-sm font-medium text-neutral-500 mt-1">Productos listados</div>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-200 to-white rounded-[40px] rotate-3 scale-105 -z-10 shadow-sm" />
              <div className="absolute inset-0 bg-black rounded-[40px] -rotate-2 scale-105 -z-20 opacity-5" />
              
              {heroTenants[0] ? (
                <a
                  href={buildTenantHref(env.rootDomain, heroTenants[0].slug)}
                  className="group relative block w-full h-[500px] overflow-hidden rounded-[32px] bg-neutral-900 shadow-2xl transition-transform duration-500 hover:-translate-y-2"
                >
                  {heroTenants[0].banners[0]?.imageUrl && (
                    <Image
                      src={heroTenants[0].banners[0].imageUrl}
                      alt={heroTenants[0].name}
                      fill
                      className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-10">
                    <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white mb-4 border border-white/10">
                      Caso de éxito
                    </div>
                    <h2 className="text-3xl font-medium tracking-tight text-white">
                      {heroTenants[0].name}
                    </h2>
                    <div className="mt-6 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium">
                        Visitar catálogo <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="w-full h-[500px] rounded-[32px] bg-neutral-100 flex items-center justify-center border border-neutral-200">
                  <div className="text-neutral-400 font-medium">No hay marcas destacadas</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-24 sm:py-32 border-y border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Arquitectura robusta</h2>
            <p className="mt-2 text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
              Todo lo que necesitas para escalar tu distribución.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Gestión Multi-Catálogo',
                  description: 'Administra múltiples marcas o sucursales desde un único panel centralizado con dominios personalizados para cada una.',
                  icon: Layers,
                },
                {
                  name: 'Variantes Complejas',
                  description: 'Controla tallas, colores, pesos y SKU independientes. Asigna inventario y fotografías específicas por variante.',
                  icon: Package,
                },
                {
                  name: 'Recepción de Pedidos',
                  description: 'Flujo de checkout B2B optimizado que envía el resumen de compra estructurado directamente a WhatsApp o correo.',
                  icon: ShoppingCart,
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-medium text-neutral-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 border border-neutral-200">
                      <feature.icon className="h-6 w-6 text-neutral-700" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Tenants Showcase */}
      <section className="bg-[#FAFAFA] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
                Marcas utilizando MultiCatálogo
              </h2>
              <p className="mt-4 text-lg text-neutral-500">
                Explora cómo otras empresas han digitalizado su inventario.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category: MarketplaceCategory) => (
                <span
                  key={`${category.id}-${category.tenant.slug}`}
                  className="rounded-full bg-white border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 shadow-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant: MarketplaceTenant) => (
              <a
                key={tenant.id}
                href={buildTenantHref(env.rootDomain, tenant.slug)}
                className="group flex flex-col overflow-hidden rounded-[24px] bg-white border border-neutral-200 shadow-sm transition-all hover:shadow-lg hover:border-neutral-300"
              >
                <div className="relative aspect-[16/9] w-full bg-neutral-100 overflow-hidden">
                  {tenant.banners[0]?.imageUrl ? (
                    <Image
                      src={tenant.banners[0].imageUrl}
                      alt={tenant.banners[0].title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Store className="h-10 w-10 text-neutral-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-black">
                      {tenant.name}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
                      Catálogo digital operando con {tenant._count.products} productos activos.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-sm font-medium text-neutral-900">
                    Visitar catálogo <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-neutral-900" />
            <span className="font-semibold tracking-tight text-neutral-900">MultiCatálogo SaaS</span>
          </div>
          <p className="text-sm text-neutral-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Plataforma MultiCatálogo. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
              Acceso Empresas
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
