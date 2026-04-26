'use client';
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';
import type { Prediction } from '@/lib/types';

export default function AdminPredicciones() {
  const [list, setList] = useState<Prediction[]>([]);
  async function load() {
    const snap = await getDocs(collection(getDb(), 'predictions'));
    setList(snap.docs.map(d => d.data() as Prediction));
  }
  useEffect(() => { load(); }, []);

  async function invalidate(p: Prediction) {
    await updateDoc(doc(getDb(), 'predictions', p.id), { status: 'cancelled', updatedAt: Date.now() });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Predicciones</h1>
      <div className="bg-white rounded-md shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr><th className="p-2">Participante</th><th>Estado</th><th>Campeón</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2 font-mono text-xs">{p.participantId}</td>
                <td>{p.status}</td>
                <td>{p.championPrediction || '—'}</td>
                <td>
                  {p.status !== 'cancelled' &&
                    <button onClick={() => invalidate(p)} className="text-red-600">Invalidar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
