import { getPublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminOverviewResponse,
  AdminTenant,
  AdminTenantDetail,
  AuthMeResponse,
} from "./admin-types";

async function requestServerJson(path: string, init?: RequestInit) {
  const env = getPublicEnv();
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const response = await fetch(`${env.apiUrl.replace(/\/$/, "")}${path}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export function getAuthMeServer() {
  return requestServerJson("/auth/me") as Promise<AuthMeResponse | null>;
}

export function getAdminOverviewServer() {
  return requestServerJson("/admin/overview") as Promise<AdminOverviewResponse | null>;
}

export function getAdminTenantsServer() {
  return requestServerJson("/admin/tenants") as Promise<AdminTenant[] | null>;
}

export function getAdminTenantDetailServer(tenantId: string) {
  return requestServerJson(`/admin/tenants/${tenantId}`) as Promise<AdminTenantDetail | null>;
}
