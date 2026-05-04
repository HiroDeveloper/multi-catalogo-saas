"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@multicatalogo.demo");
  const [password, setPassword] = useState("Admin123456!");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(() => {
      void (async () => {
        const supabase = createSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        const next = searchParams.get("next") ?? "/dashboard";
        router.replace(next);
        router.refresh();
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-slate-600">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          className="rounded-2xl border border-slate-200 px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-slate-600">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="rounded-2xl border border-slate-200 px-4 py-3"
        />
      </label>
      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        <LogIn className="size-4" />
        {isPending ? "Ingresando" : "Ingresar"}
      </button>
    </form>
  );
}
