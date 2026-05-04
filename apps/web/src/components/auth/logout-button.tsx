"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() => {
          void (async () => {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            router.replace("/login");
            router.refresh();
          })();
        })
      }
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
    >
      <LogOut className="size-4" />
      Salir
    </button>
  );
}
