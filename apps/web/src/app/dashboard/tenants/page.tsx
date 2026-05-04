import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { getAdminTenantsServer } from "@/lib/api/admin-server";
import type { AdminTenant } from "@/lib/api/admin-types";
import { getPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function buildTenantHref(rootDomain: string, tenantSlug: string) {
  const isLocal = rootDomain === "lvh.me" || rootDomain.endsWith(".local");
  const protocol = isLocal ? "http" : "https";
  const port = isLocal ? ":3000" : "";

  return `${protocol}://${tenantSlug}.${rootDomain}${port}/`;
}

export default async function DashboardTenantsPage() {
  const env = getPublicEnv();
  const tenants = await getAdminTenantsServer();

  if (!tenants) {
    return (
      <main className="min-h-screen bg-[#eef3ff] p-8">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white p-10">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">
            Lista de tiendas no disponible
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3ff] p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[28px] bg-white px-6 py-5 shadow-[0_20px_50px_rgba(23,104,229,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Superadmin
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                Gestion de tiendas
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white"
            >
              Volver al dashboard
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_rgba(23,104,229,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Tienda</th>
                  <th className="px-4 py-4 font-medium">Subdominio</th>
                  <th className="px-4 py-4 font-medium">Productos</th>
                  <th className="px-4 py-4 font-medium">Categorias</th>
                  <th className="px-4 py-4 font-medium">Promociones</th>
                  <th className="px-4 py-4 font-medium">Estado</th>
                  <th className="px-4 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant: AdminTenant) => (
                  <tr key={tenant.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                          <Store className="size-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{tenant.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            {tenant.plan}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{tenant.subdomain}.lvh.me</td>
                    <td className="px-4 py-4 text-slate-600">{tenant._count.products}</td>
                    <td className="px-4 py-4 text-slate-600">{tenant._count.categories}</td>
                    <td className="px-4 py-4 text-slate-600">{tenant._count.promotions}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#1768e5]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1768e5]">
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/tenants/${tenant.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Editar
                          <ChevronRight className="size-4" />
                        </Link>
                        <a
                          href={buildTenantHref(env.rootDomain, tenant.slug)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Ver tienda
                          <ChevronRight className="size-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
