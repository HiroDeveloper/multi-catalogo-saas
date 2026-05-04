import Link from "next/link";
import { getAdminTenantDetailServer } from "@/lib/api/admin-server";
import type { AdminTenantDetail } from "@/lib/api/admin-types";
import { TenantAdminEditor } from "@/components/admin/tenant-admin-editor";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function DashboardTenantDetailPage({ params }: PageProps) {
  const { tenantId } = await params;
  const tenant = (await getAdminTenantDetailServer(tenantId)) as AdminTenantDetail | null;

  if (!tenant) {
    return (
      <main className="min-h-screen bg-[#eef3ff] p-8">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white p-10">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">
            Tenant no disponible
          </h1>
          <Link
            href="/dashboard/tenants"
            className="mt-8 inline-flex rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white"
          >
            Volver
          </Link>
        </div>
      </main>
    );
  }

  return <TenantAdminEditor initialTenant={tenant} />;
}
