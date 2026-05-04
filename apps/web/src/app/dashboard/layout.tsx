import { redirect } from "next/navigation";
import { getAuthMeServer } from "@/lib/api/admin-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen">
      <div className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Sesion activa
            </div>
            <div className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
              {me.appUser.displayName ?? me.appUser.email}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
