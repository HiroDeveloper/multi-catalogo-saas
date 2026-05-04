"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key) return;

    posthog.init(key, {
      api_host: host || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// ── Helper functions for custom events ──────────────

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
}

export function trackProductView(productId: string, productName: string, tenantSlug: string) {
  trackEvent("product_viewed", { productId, productName, tenantSlug });
}

export function trackAddToCart(productId: string, productName: string, price: number, tenantSlug: string) {
  trackEvent("add_to_cart", { productId, productName, price, tenantSlug });
}

export function trackCheckoutStarted(tenantSlug: string, itemCount: number, total: number) {
  trackEvent("checkout_started", { tenantSlug, itemCount, total });
}

export function trackWhatsAppClick(tenantSlug: string, quoteRequestId: string, total: number) {
  trackEvent("whatsapp_click", { tenantSlug, quoteRequestId, total });
}

export function trackPromotionViewed(promotionName: string, tenantSlug: string) {
  trackEvent("promotion_viewed", { promotionName, tenantSlug });
}

export function identifyUser(userId: string, email: string, role?: string) {
  if (typeof window !== "undefined") {
    posthog.identify(userId, { email, role });
  }
}
