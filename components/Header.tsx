"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { logout } from "@/lib/firebase/auth";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <header className="sticky top-0 z-40 border-b border-wc-border bg-wc-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:px-6">
        <Link href="/" className="flex w-full items-center gap-3 sm:w-auto">
          <Image
            src="/images/world-cup-logo.png"
            alt="Logo Mundial 2026"
            width={48}
            height={48}
            className="h-11 w-auto"
            priority
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-wc-primary sm:tracking-[0.25em]">
              Porra 2026
            </p>
            <span className="block truncate text-base font-bold text-wc-text sm:text-lg">
              Rumbo a la gloria
            </span>
          </div>
        </Link>

        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <nav className="flex max-w-full gap-1 overflow-x-auto pb-1 text-sm sm:pb-0 md:gap-3">
            {[
              ["Registro", "/registro"],
              ["Login", "/login"],
              ["Ranking", "/ranking"],
              ["Mi porra", "/porra"],
              ["Reglas", "/reglas"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-lg border border-transparent px-3 py-2 text-wc-muted transition hover:border-wc-border hover:bg-wc-background hover:text-wc-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="max-w-full truncate text-xs text-wc-muted sm:max-w-48 md:max-w-none">
            {user ? `Sesión: ${user.email}` : "Sin sesión"}
          </div>
          {user && (
            <button
              className="wc-btn-secondary w-full sm:w-auto"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
