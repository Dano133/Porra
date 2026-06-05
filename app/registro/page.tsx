"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerWithEmail } from "@/lib/firebase/auth";

export default function RegistroPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerWithEmail(email, password, displayName);
      router.push("/porra");
    } catch (e: any) {
      setError(e?.message ?? "Error de registro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="wc-card p-5 sm:p-7">
          <h1 className="text-3xl font-bold">Crear cuenta</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nombre (opcional)
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="wc-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Correo electrónico
              </label>
              <input
                required
                type="email"
                maxLength={200}
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
            {error && <p className="text-sm text-wc-accentSoft">{error}</p>}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
