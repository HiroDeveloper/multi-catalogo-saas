"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Store, ChevronLeft, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

export function MobileNav({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <span className="font-semibold text-sm text-neutral-900">{userName}</span>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Gestión</p>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link
            href="/dashboard/tenants"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <Store className="h-4 w-4" />
            Catálogos
          </Link>

          <div className="my-4 border-t border-neutral-100" />
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Sistema</p>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al portal
          </Link>
          <div className="px-3">
            <LogoutButton />
          </div>
        </nav>
      </div>
    </>
  );
}
