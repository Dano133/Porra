'use client';
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';
import type { Participant } from '@/lib/types';

export default function AdminParticipantes() {
  const [list, setList] = useState<Participant[]>([]);
  const [filter, setFilter] = useState('');

  async function load() {
    const snap = await getDocs(collection(getDb(), 'participants'));
    setList(snap.docs.map(d => d.data() as Participant));
  }
  useEffect(() => { load(); }, []);

  async function changeStatus(p: Participant, status: Participant['status']) {
    await updateDoc(doc(getDb(), 'participants', p.id), { status, updatedAt: Date.now() });
    load();
  }

  function exportCsv() {
    const rows = [['fullName', 'email', 'status', 'consentEmails', 'createdAt']];
    list.forEach(p => rows.push([p.fullName, p.email, p.status, String(p.consentEmails), new Date(p.createdAt).toISOString()]));
    const csv = rows.map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'participantes.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = list.filter(p =>
    p.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    p.email.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Participantes</h1>
      <div className="flex gap-2 mb-4">
        <input className="flex-1 border rounded-md px-3 py-2" placeholder="Buscar…"
          value={filter} onChange={e => setFilter(e.target.value)} />
        <button onClick={exportCsv} className="bg-white border px-3 py-2 rounded-md">Exportar CSV</button>
      </div>
      <div className="bg-white rounded-md shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left bg-gray-100">
            <tr><th className="p-2">Nombre</th><th>Email</th><th>Estado</th><th>Consent.</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.fullName}</td>
                <td>{p.email}</td>
                <td>{p.status}</td>
                <td>{p.consentEmails ? 'sí' : 'no'}</td>
                <td className="space-x-2">
                  {p.status !== 'active' && <button className="text-blue-600" onClick={() => changeStatus(p, 'active')}>Activar</button>}
                  {p.status !== 'inactive' && <button className="text-gray-600" onClick={() => changeStatus(p, 'inactive')}>Desactivar</button>}
                  {p.status !== 'blocked' && <button className="text-red-600" onClick={() => changeStatus(p, 'blocked')}>Bloquear</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
