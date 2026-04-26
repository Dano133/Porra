'use client';
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/lib/firebase-client';
import type { Match } from '@/lib/types';

export default function AdminResultados() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const snap = await getDocs(query(collection(getDb(), 'matches'), orderBy('kickoffAt', 'asc')));
    setMatches(snap.docs.map(d => d.data() as Match));
  }
  useEffect(() => { load(); }, []);

  async function save(m: Match, h: string, a: string) {
    const home = h === '' ? null : Number(h);
    const away = a === '' ? null : Number(a);
    let winner: Match['winnerAfter90Or120'] = null;
    if (home != null && away != null) {
      winner = home === away ? 'draw' : home > away ? 'home' : 'away';
    }
    await updateDoc(doc(getDb(), 'matches', m.id), {
      officialHomeScore: home, officialAwayScore: away,
      winnerAfter90Or120: winner,
      status: home != null && away != null ? 'finished' : m.status,
      updatedAt: Date.now(),
    });
    load();
  }

  async function recalc() {
    setMsg('Recalculando…');
    const user = getFirebaseAuth().currentUser!;
    const token = await user.getIdToken();
    const url = process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
      `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
    const res = await fetch(`${url}/recalculateScores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMsg(res.ok ? `Recalculado: ${data.processed} participantes` : `Error: ${data.error}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resultados oficiales</h1>
      <button onClick={recalc} className="mb-4 bg-wc-primary text-white px-4 py-2 rounded-md">
        Recalcular puntuaciones
      </button>
      {msg && <p className="text-sm mb-3">{msg}</p>}
      <div className="bg-white rounded-md shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr><th className="p-2">Fecha</th><th>Fase</th><th>Local</th><th></th><th>Visitante</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <Row key={m.id} m={m} onSave={save} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ m, onSave }: { m: Match; onSave: (m: Match, h: string, a: string) => void }) {
  const [h, setH] = useState(m.officialHomeScore?.toString() ?? '');
  const [a, setA] = useState(m.officialAwayScore?.toString() ?? '');
  return (
    <tr className="border-t">
      <td className="p-2">{new Date(m.kickoffAt).toLocaleString('es-ES')}</td>
      <td>{m.stage}{m.group ? ` ${m.group}` : ''}</td>
      <td>{m.homeTeam}</td>
      <td className="space-x-1">
        <input value={h} onChange={e => setH(e.target.value)} className="w-12 border rounded text-center" />
        -
        <input value={a} onChange={e => setA(e.target.value)} className="w-12 border rounded text-center" />
        <button onClick={() => onSave(m, h, a)} className="ml-2 text-blue-600 text-xs">Guardar</button>
      </td>
      <td>{m.awayTeam}</td>
      <td>{m.status}</td>
    </tr>
  );
}
