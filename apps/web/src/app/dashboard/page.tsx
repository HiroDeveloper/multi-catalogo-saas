import Link from "next/link";
import {
  Boxes,
  ImageIcon,
  Layers3,
  LayoutDashboard,
  Megaphone,
  Store,
} from "lucide-react";
import {
  getAdminOverviewServer,
} from "@/lib/api/admin-server";
import type {
  AdminMetrics,
  AdminOverviewResponse,
  AdminRecentProduct,
  AdminRecentTenant,
} from "@/lib/api/admin-types";

export const dynamic = "force-dynamic";

type StatKey = keyof AdminMetrics;

const statCards: Array<{
  key: StatKey;
  label: string;
  icon: typeof Boxes;
}> = [
  { key: "products", label: "Productos", icon: Boxes },
  { key: "tenants", label: "Tiendas", icon: Store },
  { key: "categories", label: "Categorias", icon: Layers3 },
  { key: "banners", label: "Banners", icon: ImageIcon },
  { key: "promotions", label: "Promociones", icon: Megaphone },
];

export default async function DashboardPage() {
  const data = (await getAdminOverviewServer()) as AdminOverviewResponse | null;

  if (!data) {
    return (
      <main className="min-h-screen bg-[#eef3ff] p-8">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-10">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">
            Dashboard no disponible
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3ff] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[96px_1fr]">
        <aside className="hidden bg-[#1768e5] lg:flex lg:flex-col lg:items-center lg:gap-8 lg:py-8">
          <div className="flex size-14 items-center justify-center rounded-[24px] bg-white text-[#1768e5] shadow-[0_12px_30px_rgba(255,255,255,0.28)]">
            <LayoutDashboard className="size-6" />
          </div>
          {[LayoutDashboard, Store, Boxes, Layers3, Megaphone].map((Icon, index) => (
            <div
              key={Icon.displayName ?? index}
              className={`flex size-12 items-center justify-center rounded-2xl ${
                index === 0 ? "bg-white text-[#1768e5]" : "text-white/86"
              }`}
            >
              <Icon className="size-5" />
            </div>
          ))}
        </aside>

        <section className="flex flex-col gap-6 p-4 lg:p-8">
          <header className="rounded-[28px] bg-white px-6 py-5 shadow-[0_20px_50px_rgba(23,104,229,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Superadmin
                </div>
                <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                  Panel multi tenant
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/tenants"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white"
                >
                  Gestionar tiendas
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Volver al marketplace
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map(({ key, label, icon: Icon }) => (
              <article
                key={key}
                className="rounded-[28px] bg-white p-5 shadow-[0_16px_40px_rgba(23,104,229,0.08)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                  <Icon className="size-5" />
                </div>
                <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                  {data.metrics[key]}
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Ultimos productos
                </div>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
                  Actividad comercial
                </h2>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="rounded-l-2xl px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium">Tienda</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="rounded-r-2xl px-4 py-3 font-medium">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentProducts.map((product: AdminRecentProduct) => (
                      <tr key={product.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {product.tenant.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {product.category?.name ?? "General"}
                        </td>
                        <td className="px-4 py-4 font-medium text-[#1768e5]">
                          ${product.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Ultimas tiendas
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
                Alta y operacion
              </h2>
              <div className="mt-6 space-y-4">
                {data.recentTenants.map((tenant: AdminRecentTenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between rounded-[24px] bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {tenant.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {tenant._count.products} productos · {tenant._count.categories} categorias
                      </div>
                    </div>
                    <div className="rounded-full bg-[#1768e5]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1768e5]">
                      {tenant.status}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
