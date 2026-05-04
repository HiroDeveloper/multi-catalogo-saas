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
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="text-sm text-slate-500">
          Métricas generales de todo el ecosistema de tiendas.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ key, label, icon: Icon }) => (
          <article
            key={key}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Icon className="size-4 text-blue-600" />
              {label}
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {data.metrics[key]}
            </div>
          </article>
        ))}
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Actividad reciente (Productos)</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Producto</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Tienda</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.recentProducts.map((product: AdminRecentProduct) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {product.tenant.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                      ${product.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Últimas tiendas</h2>
            <Link href="/dashboard/tenants" className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todas</Link>
          </div>
          <div className="flex flex-col gap-3">
            {data.recentTenants.map((tenant: AdminRecentTenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {tenant.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {tenant._count.products} productos · {tenant._count.categories} categorias
                  </div>
                </div>
                <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {tenant.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
