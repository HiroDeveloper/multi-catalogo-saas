import Link from "next/link";
import { Store, ChevronRight, Plus } from "lucide-react";
import { getAdminTenantsServer } from "@/lib/api/admin-server";
import type { AdminTenant } from "@/lib/api/admin-types";

export const dynamic = "force-dynamic";

export default async function DashboardTenantsPage() {
  const tenants = await getAdminTenantsServer();

  if (!tenants) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
        <p className="text-neutral-500">Lista de catálogos no disponible.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Catálogos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {tenants.length} empresa{tenants.length !== 1 ? "s" : ""} registrada{tenants.length !== 1 ? "s" : ""} en la plataforma.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Añadir Catálogo
        </button>
      </header>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-neutral-500">Empresa</th>
              <th className="px-6 py-3 text-xs font-medium text-neutral-500">Subdominio</th>
              <th className="px-6 py-3 text-xs font-medium text-neutral-500 text-center">Productos</th>
              <th className="px-6 py-3 text-xs font-medium text-neutral-500 text-center">Categorías</th>
              <th className="px-6 py-3 text-xs font-medium text-neutral-500 text-center">Estado</th>
              <th className="px-6 py-3 text-xs font-medium text-neutral-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {tenants.map((tenant: AdminTenant) => (
              <tr key={tenant.id} className="transition-colors hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{tenant.name}</div>
                      <div className="text-xs text-neutral-400 uppercase tracking-wider">{tenant.plan}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lvh.me'}
                </td>
                <td className="px-6 py-4 text-center font-medium text-neutral-900">{tenant._count.products}</td>
                <td className="px-6 py-4 text-center font-medium text-neutral-900">{tenant._count.categories}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    tenant.status === "ACTIVE"
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-neutral-100 text-neutral-600 ring-neutral-500/20"
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/t/${tenant.subdomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Ver tienda
                    </a>
                    <Link
                      href={`/dashboard/tenants/${tenant.id}`}
                      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors"
                    >
                      Administrar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-neutral-400">
                  No hay catálogos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {tenants.map((tenant: AdminTenant) => (
          <div key={tenant.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <Store className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{tenant.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lvh.me'}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                tenant.status === "ACTIVE"
                  ? "bg-green-50 text-green-700 ring-green-600/20"
                  : "bg-neutral-100 text-neutral-600 ring-neutral-500/20"
              }`}>
                {tenant.status}
              </span>
            </div>

            <div className="mt-3 flex gap-4 text-sm text-neutral-600">
              <span><strong className="font-semibold text-neutral-900">{tenant._count.products}</strong> productos</span>
              <span><strong className="font-semibold text-neutral-900">{tenant._count.categories}</strong> categorías</span>
              <span className="text-neutral-400 text-xs uppercase tracking-wide">{tenant.plan}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={`/t/${tenant.subdomain}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-md border border-neutral-200 py-2 text-center text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Ver tienda
              </a>
              <Link
                href={`/dashboard/tenants/${tenant.id}`}
                className="flex-1 rounded-md bg-neutral-900 py-2 text-center text-xs font-medium text-white hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1"
              >
                Administrar <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
        {tenants.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-200 p-10 text-center text-neutral-400 text-sm">
            No hay catálogos registrados.
          </div>
        )}
      </div>
    </div>
  );
}
