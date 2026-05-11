'use client';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getDb } from '@/lib/firebase-client';
import { collection, doc, getDoc, getDocs, orderBy, query, where, limit } from 'firebase/firestore';
import type { Score, Settings, Participant, RankingSnapshot } from '@/lib/types';

interface Row {
  rank: number;
  participantId: string;
  fullName: string;
  totalPoints: number;
  delta: number;
}

export default function RankingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [filter, setFilter] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = getDb();
      const sSnap = await getDoc(doc(db, 'settings', 'global'));
      const s = sSnap.exists() ? (sSnap.data() as Settings) : null;
      if (!s) { setLoading(false); return; }
      setEnabled(s.publicLeaderboardEnabled);
      if (!s.publicLeaderboardEnabled) { setLoading(false); return; }

      const scoresQ = query(
        collection(db, 'scores'),
        where('tournamentId', '==', s.currentTournamentId),
        orderBy('totalPoints', 'desc'),
        limit(500),
      );
      const scoresSnap = await getDocs(scoresQ);
      const scores = scoresSnap.docs.map(d => d.data() as Score);

      // Última fecha de snapshot para deltas (lectura pública)
      const snapsQ = query(
        collection(db, 'rankingSnapshots'),
        orderBy('snapshotDate', 'desc'),
        limit(500),
      );
      const snapsSnap = await getDocs(snapsQ);
      const latestDate = snapsSnap.docs[0]?.data().snapshotDate;
      const deltaByParticipant = new Map<string, number>();
      snapsSnap.docs.forEach(d => {
        const v = d.data() as RankingSnapshot;
        if (v.snapshotDate === latestDate) deltaByParticipant.set(v.participantId, v.delta);
      });

      // Nombres: las reglas no permiten leer participants públicamente,
      // así que el ranking se sirve con el nombre denormalizado en `scores`.
      // Si no existe, mostramos un alias.
      const built: Row[] = scores.map((sc, i) => ({
        rank: i + 1,
        participantId: sc.participantId,
        fullName: (sc as any).fullName || `Participante ${sc.participantId.slice(0, 6)}`,
        totalPoints: sc.totalPoints,
        delta: deltaByParticipant.get(sc.participantId) || 0,
      }));
      setRows(built);
      setUpdatedAt(scores[0]?.updatedAt || null);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => rows.filter(r => r.fullName.toLowerCase().includes(filter.toLowerCase())),
    [rows, filter],
  );

  if (!enabled) {
    return (<><Header /><main className="mx-auto max-w-4xl px-4 py-10"><div className="wc-card p-8 text-center text-wc-muted">El ranking público está deshabilitado por ahora.</div></main><Footer /></>);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold">Así se mueve la tabla.</h1>
        {updatedAt && (
          <p className="text-sm text-wc-muted mt-1">
            Última actualización: {new Date(updatedAt).toLocaleString('es-ES')}
          </p>
        )}

        <input
          placeholder="Buscar por nombre…"
          value={filter} onChange={e => setFilter(e.target.value)}
          className="mt-4 w-full wc-input px-3 py-2"
        />

        {loading ? (
          <p className="mt-6">Cargando…</p>
        ) : (
          <>
            <h2 className="mt-6 font-bold text-wc-gold">Top 10 · Zona dorada</h2>
            <ol className="mt-2 wc-card divide-y divide-wc-border">
              {filtered.slice(0, 10).map(r => <RankRow key={r.participantId} row={r} highlight />)}
            </ol>

            <h2 className="mt-6 font-bold">Tabla completa</h2><p className="text-sm text-wc-muted">Cada punto vale, cada jornada pesa.</p>
            <ol className="mt-2 wc-card divide-y divide-wc-border">
              {filtered.map(r => <RankRow key={r.participantId} row={r} />)}
            </ol>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function RankRow({ row, highlight }: { row: Row; highlight?: boolean }) {
  return (
    <li className={`flex items-center gap-3 px-4 py-2 ${highlight ? 'bg-wc-gold/10' : ''}`}>
      <span className="w-8 text-right font-bold text-wc-muted">{row.rank}</span>
      <span className="flex-1">{row.fullName}</span>
      <span className="font-semibold">{row.totalPoints} pts</span>
      <span className={`w-12 text-right text-xs ${row.delta > 0 ? 'text-wc-primary' : row.delta < 0 ? 'text-wc-accentSoft' : 'text-wc-muted/60'}`}>
        {row.delta > 0 ? `▲${row.delta}` : row.delta < 0 ? `▼${Math.abs(row.delta)}` : '–'}
      </span>
    </li>
  );
}
