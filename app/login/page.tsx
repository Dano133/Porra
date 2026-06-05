"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loginWithEmail } from "@/lib/firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      router.push("/porra");
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="wc-card p-5 sm:p-7">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Correo electrónico
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="wc-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Contraseña
              </label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="wc-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="wc-btn-primary w-full"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            {error && <p className="text-sm text-wc-accentSoft">{error}</p>}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
