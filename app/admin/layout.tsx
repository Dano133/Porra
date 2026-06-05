"use client";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase-client";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminDoc = await getDoc(doc(getDb(), "admins", u.uid));
        setIsAdmin(adminDoc.exists());
      } else setIsAdmin(false);
      setReady(true);
    });
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, pass);
    } catch (e: any) {
      setErr("Credenciales incorrectas.");
    }
  }

  if (!ready) return <main className="p-10 text-center">Cargando…</main>;

  if (!user || !isAdmin) {
    return (
      <main className="mx-auto max-w-sm p-4 sm:p-8">
        <h1 className="text-xl font-bold mb-4">Acceso administrador</h1>
        {user && !isAdmin && (
          <p className="mb-3 text-red-700 text-sm">
            Tu cuenta no tiene permisos de admin.
          </p>
        )}
        <form
          onSubmit={login}
          className="bg-white p-6 rounded-md shadow-sm space-y-3"
        >
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded-md border px-3 py-2 text-base md:text-sm"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="min-h-11 w-full rounded-md border px-3 py-2 text-base md:text-sm"
          />
          <button className="min-h-11 w-full rounded-md bg-wc-primary py-2 text-white">
            Entrar
          </button>
          {err && <p className="text-red-700 text-sm">{err}</p>}
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <div className="border-b bg-gray-900 p-3 text-white md:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-bold">Admin</h2>
          <button
            className="text-xs underline"
            onClick={() => signOut(getFirebaseAuth())}
          >
            Cerrar sesión
          </button>
        </div>
        <nav className="flex gap-3 overflow-x-auto pb-1 text-sm">
          <Link href="/admin" className="shrink-0 py-1">
            Dashboard
          </Link>
          <Link href="/admin/participantes" className="shrink-0 py-1">
            Participantes
          </Link>
          <Link href="/admin/predicciones" className="shrink-0 py-1">
            Predicciones
          </Link>
          <Link href="/admin/resultados" className="shrink-0 py-1">
            Resultados
          </Link>
          <Link href="/admin/ranking" className="shrink-0 py-1">
            Ranking interno
          </Link>
          <Link href="/admin/emails" className="shrink-0 py-1">
            Emails
          </Link>
          <Link href="/admin/configuracion" className="shrink-0 py-1">
            Configuración
          </Link>
        </nav>
      </div>
      <aside className="w-56 bg-gray-900 text-white p-4 hidden md:block">
        <h2 className="font-bold mb-6">Admin</h2>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block py-1">
            Dashboard
          </Link>
          <Link href="/admin/participantes" className="block py-1">
            Participantes
          </Link>
          <Link href="/admin/predicciones" className="block py-1">
            Predicciones
          </Link>
          <Link href="/admin/resultados" className="block py-1">
            Resultados
          </Link>
          <Link href="/admin/ranking" className="block py-1">
            Ranking interno
          </Link>
          <Link href="/admin/emails" className="block py-1">
            Emails
          </Link>
          <Link href="/admin/configuracion" className="block py-1">
            Configuración
          </Link>
        </nav>
        <button
          className="mt-8 text-xs underline"
          onClick={() => signOut(getFirebaseAuth())}
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="min-w-0 flex-1 bg-gray-50 p-4 text-gray-950 sm:p-6">
        {children}
      </main>
    </div>
  );
}
