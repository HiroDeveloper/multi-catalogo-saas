"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getPublicEnv } from "@/lib/env";

async function requestClientJson(path: string, init?: RequestInit) {
  const env = getPublicEnv();
  const supabase = createSupabaseBrowserClient();
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
      const text = await response.text();
      throw new Error(text || "Request failed");
    }

    return response.json();
  } catch {
    return null;
  }
}

export function updateAdminTenant(tenantId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/tenants/${tenantId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function getAdminTenantDetailClient(tenantId: string) {
  return requestClientJson(`/admin/tenants/${tenantId}`);
}

export function createAdminCategory(tenantId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/tenants/${tenantId}/categories`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminCategory(categoryId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminCategory(categoryId: string) {
  return requestClientJson(`/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function createAdminProduct(tenantId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/tenants/${tenantId}/products`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminProduct(productId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminProduct(productId: string) {
  return requestClientJson(`/admin/products/${productId}`, {
    method: "DELETE",
  });
}

export function createAdminPromotion(tenantId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/tenants/${tenantId}/promotions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminPromotion(promotionId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/promotions/${promotionId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminPromotion(promotionId: string) {
  return requestClientJson(`/admin/promotions/${promotionId}`, {
    method: "DELETE",
  });
}

// ── Banners ──────────────────────────────────────────

export function createAdminBanner(tenantId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/tenants/${tenantId}/banners`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminBanner(bannerId: string, body: Record<string, unknown>) {
  return requestClientJson(`/admin/banners/${bannerId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminBanner(bannerId: string) {
  return requestClientJson(`/admin/banners/${bannerId}`, {
    method: "DELETE",
  });
}

// ── Quote Requests (Orders) ─────────────────────────

export function getAdminQuoteRequests(tenantId: string, status?: string) {
  const qs = status ? `?status=${status}` : "";
  return requestClientJson(`/admin/tenants/${tenantId}/quote-requests${qs}`);
}

export function getAdminQuoteRequestDetail(requestId: string) {
  return requestClientJson(`/admin/quote-requests/${requestId}`);
}

export function updateAdminQuoteRequestStatus(requestId: string, status: string) {
  return requestClientJson(`/admin/quote-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Create Tenant ───────────────────────────────────

export function createAdminTenant(body: Record<string, unknown>) {
  return requestClientJson("/admin/tenants", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

