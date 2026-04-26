'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegistroPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      // La URL apunta a la Cloud Function HTTPS `registerParticipant`.
      // Configura NEXT_PUBLIC_FUNCTIONS_URL si usas región custom.
      const url =
        process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
        `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
      const res = await fetch(`${url}/registerParticipant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, consentEmails: consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de registro');
      setMsg({ type: 'ok', text: '¡Registro completado! Revisa tu correo.' });
      setFullName(''); setEmail('');
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Registro</h1>
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              required minLength={2} maxLength={80}
              value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              required type="email" maxLength={200}
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            <span>Acepto recibir comunicaciones por email sobre la porra.</span>
          </label>
          <button
            type="submit" disabled={loading}
            className="w-full bg-wc-primary text-white py-2 rounded-md font-medium disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Registrarme'}
          </button>
          {msg && (
            <p className={msg.type === 'ok' ? 'text-green-700 text-sm' : 'text-red-700 text-sm'}>
              {msg.text}
            </p>
          )}
        </form>
      </main>
      <Footer />
    </>
  );
}
