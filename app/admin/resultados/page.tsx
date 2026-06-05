"use client";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase-client";
import type { Match } from "@/lib/types";
import TeamLabel from "@/components/TeamLabel";

export default function AdminResultados() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const snap = await getDocs(
      query(collection(getDb(), "matches"), orderBy("kickoffAt", "asc")),
    );
    setMatches(snap.docs.map((d) => d.data() as Match));
  }
  useEffect(() => {
    load();
  }, []);

  async function save(m: Match, h: string, a: string) {
    const home = h === "" ? null : Number(h);
    const away = a === "" ? null : Number(a);
    let winner: Match["winnerAfter90Or120"] = null;
    if (home != null && away != null) {
      winner = home === away ? "draw" : home > away ? "home" : "away";
    }
    await updateDoc(doc(getDb(), "matches", m.id), {
      officialHomeScore: home,
      officialAwayScore: away,
      winnerAfter90Or120: winner,
      status: home != null && away != null ? "finished" : m.status,
      updatedAt: Date.now(),
    });
    load();
  }

  async function recalc() {
    setMsg("Recalculando…");
    const user = getFirebaseAuth().currentUser!;
    const token = await user.getIdToken();
    const url =
      process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
      `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
    const res = await fetch(`${url}/recalculateScores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setMsg(
      res.ok
        ? `Recalculado: ${data.processed} participantes`
        : `Error: ${data.error}`,
    );
  }

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold mb-4">Resultados oficiales</h1>
      <button
        onClick={recalc}
        className="mb-4 min-h-11 rounded-md bg-wc-primary px-4 py-2 text-white"
      >
        Recalcular puntuaciones
      </button>
      {msg && <p className="text-sm mb-3">{msg}</p>}
      <div className="overflow-x-auto rounded-md bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[720px] text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Fecha</th>
              <th>Fase</th>
              <th>Local</th>
              <th></th>
              <th>Visitante</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <Row key={m.id} m={m} onSave={save} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  m,
  onSave,
}: {
  m: Match;
  onSave: (m: Match, h: string, a: string) => void;
}) {
  const [h, setH] = useState(m.officialHomeScore?.toString() ?? "");
  const [a, setA] = useState(m.officialAwayScore?.toString() ?? "");
  return (
    <tr className="border-t">
      <td className="p-2">{new Date(m.kickoffAt).toLocaleString("es-ES")}</td>
      <td>
        {m.stage}
        {m.group ? ` ${m.group}` : ""}
      </td>
      <td>
        <TeamLabel team={m.homeTeam} size="sm" />
      </td>
      <td className="space-x-1">
        <input
          value={h}
          onChange={(e) => setH(e.target.value)}
          className="min-h-10 w-14 rounded border text-center"
        />
        -
        <input
          value={a}
          onChange={(e) => setA(e.target.value)}
          className="min-h-10 w-14 rounded border text-center"
        />
        <button
          onClick={() => onSave(m, h, a)}
          className="ml-2 inline-flex min-h-10 items-center text-xs text-blue-600"
        >
          Guardar
        </button>
      </td>
      <td>
        <TeamLabel team={m.awayTeam} size="sm" />
      </td>
      <td>{m.status}</td>
    </tr>
  );
}
