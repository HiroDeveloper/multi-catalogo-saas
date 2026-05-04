import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#eef3ff] px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-[0_24px_60px_rgba(23,104,229,0.10)] lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1768e5]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1768e5]">
            <ShieldCheck className="size-4" />
            Admin seguro
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-slate-900">
            Ingreso al panel
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
            El panel ya no es publico. Ingresa con un usuario autenticado en
            Supabase con rol `SUPER_ADMIN`.
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-[0_24px_60px_rgba(23,104,229,0.10)] lg:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
            Login
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Para desarrollo local queda precargado el superadmin de prueba.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
