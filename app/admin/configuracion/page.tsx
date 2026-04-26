'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';
import type { Settings } from '@/lib/types';

export default function AdminConfig() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const d = await getDoc(doc(getDb(), 'settings', 'global'));
      setS(d.exists() ? (d.data() as Settings) : {
        competitionName: 'Mundial 2026',
        predictionDeadline: Date.now() + 7 * 24 * 3600 * 1000,
        publicLeaderboardEnabled: true,
        emailUpdatesEnabled: true,
        senderName: 'Porra del Mundial',
        senderEmail: 'noreply@example.com',
        currentTournamentId: 'mundial-2026',
        createdAt: Date.now(), updatedAt: Date.now(),
      });
    })();
  }, []);

  async function save() {
    if (!s) return;
    await setDoc(doc(getDb(), 'settings', 'global'), { ...s, updatedAt: Date.now() });
    setMsg('Guardado.');
  }
  if (!s) return <p>Cargando…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <div className="space-y-3 bg-white p-4 rounded-md shadow-sm">
        <Field label="Nombre de la competición" value={s.competitionName}
          onChange={v => setS({ ...s, competitionName: v })} />
        <div>
          <label className="block text-sm">Fecha límite de predicciones</label>
          <input type="datetime-local" className="w-full border rounded-md px-3 py-2"
            value={new Date(s.predictionDeadline).toISOString().slice(0, 16)}
            onChange={e => setS({ ...s, predictionDeadline: new Date(e.target.value).getTime() })} />
        </div>
        <Toggle label="Ranking público activado" value={s.publicLeaderboardEnabled}
          onChange={v => setS({ ...s, publicLeaderboardEnabled: v })} />
        <Toggle label="Emails automáticos activados" value={s.emailUpdatesEnabled}
          onChange={v => setS({ ...s, emailUpdatesEnabled: v })} />
        <Field label="Nombre remitente" value={s.senderName} onChange={v => setS({ ...s, senderName: v })} />
        <Field label="Email remitente" value={s.senderEmail} onChange={v => setS({ ...s, senderEmail: v })} />
        <Field label="Torneo actual (ID)" value={s.currentTournamentId} onChange={v => setS({ ...s, currentTournamentId: v })} />
        <button onClick={save} className="bg-wc-primary text-white px-4 py-2 rounded-md">Guardar</button>
        {msg && <p className="text-green-700 text-sm">{msg}</p>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <input className="w-full border rounded-md px-3 py-2" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
