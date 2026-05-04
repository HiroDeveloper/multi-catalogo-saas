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
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tiendas (Tenants)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona todas las tiendas registradas en la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Volver al Overview
          </Link>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
            Añadir Tienda
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-500">Tienda</th>
                <th className="px-6 py-3 font-medium text-slate-500">Métricas</th>
                <th className="px-6 py-3 font-medium text-slate-500">Estado</th>
                <th className="px-6 py-3 font-medium text-slate-500">Subdominio</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {tenants.map((tenant: AdminTenant) => (
                <tr key={tenant.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                        <Store className="size-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{tenant.name}</div>
                        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          {tenant.plan}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    <div className="flex gap-4">
                      <span><strong className="font-medium text-slate-900">{tenant._count.products}</strong> prod.</span>
                      <span><strong className="font-medium text-slate-900">{tenant._count.categories}</strong> cat.</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      {tenant.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                    {tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lvh.me'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/t/${tenant.subdomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        Ver portal
                      </a>
                      <Link
                        href={`/dashboard/tenants/${tenant.id}`}
                        className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
                      >
                        Administrar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
