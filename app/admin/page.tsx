'use client';
import { useEffect, useState } from 'react';
import { collection, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';
import type { Settings } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      const db = getDb();
      const sSnap = await getDoc(doc(db, 'settings', 'global'));
      const s = sSnap.exists() ? (sSnap.data() as Settings) : null;
      setSettings(s);
      const total = await getCountFromServer(collection(db, 'participants'));
      const active = await getCountFromServer(query(collection(db, 'participants'), where('status', '==', 'active')));
      const submitted = await getCountFromServer(query(collection(db, 'predictions'), where('status', '==', 'submitted')));
      const locked = await getCountFromServer(query(collection(db, 'predictions'), where('status', '==', 'locked')));
      const lastLog = await getDocs(query(collection(db, 'mailLogs'), orderBy('sentAt', 'desc'), limit(1)));
      const lastSnap = await getDocs(query(collection(db, 'rankingSnapshots'), orderBy('createdAt', 'desc'), limit(1)));
      setStats({
        total: total.data().count,
        active: active.data().count,
        submitted: submitted.data().count,
        locked: locked.data().count,
        lastEmail: lastLog.docs[0]?.data().sentAt,
        lastSnap: lastSnap.docs[0]?.data().createdAt,
      });
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {!stats ? <p>Cargando…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="Participantes" value={stats.total} />
          <Card label="Activos" value={stats.active} />
          <Card label="Porras enviadas" value={stats.submitted} />
          <Card label="Porras bloqueadas" value={stats.locked} />
          <Card label="Fecha límite" value={settings ? new Date(settings.predictionDeadline).toLocaleString('es-ES') : '—'} />
          <Card label="Último email" value={stats.lastEmail ? new Date(stats.lastEmail).toLocaleString('es-ES') : '—'} />
          <Card label="Último snapshot" value={stats.lastSnap ? new Date(stats.lastSnap).toLocaleString('es-ES') : '—'} />
        </div>
      )}
    </div>
  );
}
function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
