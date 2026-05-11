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

  async function onSubmit(e: React.FormEvent) { /* unchanged */
    e.preventDefault(); setLoading(true); setMsg(null);
    try {
      const url = process.env.NEXT_PUBLIC_FUNCTIONS_URL || `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
      const res = await fetch(`${url}/registerParticipant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, email, consentEmails: consent }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Error de registro');
      setMsg({ type: 'ok', text: 'Golazo. Ya estás dentro.' }); setFullName(''); setEmail('');
    } catch (e: any) { setMsg({ type: 'err', text: e.message }); } finally { setLoading(false); }
  }

  return (<><Header /><main className="mx-auto max-w-lg px-4 py-10"><div className="wc-card p-7"><h1 className="text-3xl font-bold">Empieza el partido.</h1><p className="mt-2 text-sm text-wc-muted">Da el primer toque y asegura tu plaza en la porra.</p><form onSubmit={onSubmit} className="mt-6 space-y-4"><div><label className="mb-1 block text-sm font-medium">Nombre completo</label><input required minLength={2} maxLength={80} value={fullName} onChange={e => setFullName(e.target.value)} className="wc-input" /></div><div><label className="mb-1 block text-sm font-medium">Correo electrónico</label><input required type="email" maxLength={200} value={email} onChange={e => setEmail(e.target.value)} className="wc-input" /></div><label className="flex items-start gap-2 text-sm text-wc-muted"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" /><span>Acepto recibir novedades, resultados y movimientos de la tabla.</span></label><button type="submit" disabled={loading} className="wc-btn-primary w-full">{loading ? 'Calentando motores…' : 'Unirme a la porra'}</button>{msg && <p className={`text-sm ${msg.type === 'ok' ? 'text-wc-primary' : 'text-wc-accentSoft'}`}>{msg.text}</p>}</form></div></main><Footer /></>);
}
