"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  async function onGoogleLogin() {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push("/porra");
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión con Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="wc-card p-5 sm:p-7">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-wc-muted">
            Accede rápido a Mi Porra con Google o usa tu correo si ya tienes
            cuenta.
          </p>
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={googleLoading || loading}
            className="wc-btn-primary mt-6 w-full"
          >
            {googleLoading
              ? "Conectando con Google..."
              : "Continuar con Google"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-wc-muted">
            <span className="h-px flex-1 bg-wc-border" />
            <span>o email</span>
            <span className="h-px flex-1 bg-wc-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
