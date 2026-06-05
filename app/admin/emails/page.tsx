"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase-client";
import type { MailLog } from "@/lib/types";

export default function AdminEmails() {
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [test, setTest] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const snap = await getDocs(
      query(collection(getDb(), "mailLogs"), orderBy("sentAt", "desc")),
    );
    setLogs(snap.docs.map((d) => d.data() as MailLog));
  }
  useEffect(() => {
    load();
  }, []);

  async function send(kind: "manual" | "biweekly" | "test") {
    const token = await getFirebaseAuth().currentUser!.getIdToken();
    const url =
      process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
      `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
    const res = await fetch(`${url}/sendEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kind,
        subject,
        body,
        testRecipient: test || undefined,
      }),
    });
    const d = await res.json();
    setMsg(res.ok ? `Enviado a ${d.recipientsCount}` : `Error: ${d.error}`);
    load();
  }

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold mb-4">Emails</h1>
      <div className="bg-white rounded-md shadow-sm p-4 space-y-3">
        <input
          className="min-h-11 w-full rounded-md border px-3 py-2 text-base md:text-sm"
          placeholder="Asunto"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="min-h-11 w-full rounded-md border px-3 py-2 text-base md:text-sm"
          rows={6}
          placeholder="Mensaje (HTML simple permitido)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          className="min-h-11 w-full rounded-md border px-3 py-2 text-base md:text-sm"
          placeholder="Email de prueba (opcional)"
          value={test}
          onChange={(e) => setTest(e.target.value)}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            onClick={() => send("test")}
            className="min-h-11 rounded-md border bg-white px-3 py-2"
          >
            Enviar prueba
          </button>
          <button
            onClick={() => send("manual")}
            className="min-h-11 rounded-md bg-wc-primary px-3 py-2 text-white"
          >
            Enviar a todos los activos
          </button>
          <button
            onClick={() => send("biweekly")}
            className="min-h-11 rounded-md bg-accent px-3 py-2 text-white"
          >
            Enviar actualización quincenal
          </button>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
      </div>

      <h2 className="mt-8 font-bold">Logs</h2>
      <div className="mt-2 overflow-x-auto rounded-md bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[720px] text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Fecha</th>
              <th>Tipo</th>
              <th>Asunto</th>
              <th>Destinatarios</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">
                  {new Date(l.sentAt).toLocaleString("es-ES")}
                </td>
                <td>{l.type}</td>
                <td>{l.subject}</td>
                <td>{l.recipientsCount}</td>
                <td>{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
