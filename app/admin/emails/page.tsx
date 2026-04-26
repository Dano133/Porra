'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/lib/firebase-client';
import type { MailLog } from '@/lib/types';

export default function AdminEmails() {
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [test, setTest] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const snap = await getDocs(query(collection(getDb(), 'mailLogs'), orderBy('sentAt', 'desc')));
    setLogs(snap.docs.map(d => d.data() as MailLog));
  }
  useEffect(() => { load(); }, []);

  async function send(kind: 'manual' | 'biweekly' | 'test') {
    const token = await getFirebaseAuth().currentUser!.getIdToken();
    const url = process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
      `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
    const res = await fetch(`${url}/sendEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kind, subject, body, testRecipient: test || undefined }),
    });
    const d = await res.json();
    setMsg(res.ok ? `Enviado a ${d.recipientsCount}` : `Error: ${d.error}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Emails</h1>
      <div className="bg-white rounded-md shadow-sm p-4 space-y-3">
        <input className="w-full border rounded-md px-3 py-2" placeholder="Asunto"
          value={subject} onChange={e => setSubject(e.target.value)} />
        <textarea className="w-full border rounded-md px-3 py-2" rows={6} placeholder="Mensaje (HTML simple permitido)"
          value={body} onChange={e => setBody(e.target.value)} />
        <input className="w-full border rounded-md px-3 py-2" placeholder="Email de prueba (opcional)"
          value={test} onChange={e => setTest(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={() => send('test')} className="bg-white border px-3 py-2 rounded-md">Enviar prueba</button>
          <button onClick={() => send('manual')} className="bg-wc-primary text-white px-3 py-2 rounded-md">Enviar a todos los activos</button>
          <button onClick={() => send('biweekly')} className="bg-accent text-white px-3 py-2 rounded-md">Enviar actualización quincenal</button>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
      </div>

      <h2 className="mt-8 font-bold">Logs</h2>
      <div className="bg-white rounded-md shadow-sm overflow-x-auto mt-2">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr><th className="p-2">Fecha</th><th>Tipo</th><th>Asunto</th><th>Destinatarios</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{new Date(l.sentAt).toLocaleString('es-ES')}</td>
                <td>{l.type}</td><td>{l.subject}</td>
                <td>{l.recipientsCount}</td><td>{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
