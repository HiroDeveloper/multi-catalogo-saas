import { redirect } from "next/navigation";
import { getAuthMeServer } from "@/lib/api/admin-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?next=/dashboard");
  }

  const me = await getAuthMeServer();

  if (!me || !me.roles.includes("SUPER_ADMIN")) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased selection:bg-black selection:text-white">
      {/* Premium Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-neutral-200 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-neutral-900">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white">
              <Shield className="h-3 w-3" />
            </div>
            MultiCatálogo Admin
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
          <nav className="flex flex-col gap-1">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Gestión
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/tenants"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <Store className="h-4 w-4" />
              Catálogos
            </Link>
          </nav>

          <nav className="flex flex-col gap-1">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Sistema
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al portal
            </Link>
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-neutral-900">{me.appUser.displayName || 'Admin'}</p>
                <p className="truncate text-xs text-neutral-500">{me.appUser.email}</p>
              </div>
              <div className="px-2">
                <LogoutButton />
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
          <div className="font-bold tracking-tight text-neutral-900">MultiCatálogo Admin</div>
          <LogoutButton />
        </div>
        
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
