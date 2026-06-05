"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase-client";
import type { Score } from "@/lib/types";

export default function AdminRanking() {
  const [list, setList] = useState<Score[]>([]);
  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(getDb(), "scores"), orderBy("totalPoints", "desc")),
      );
      setList(snap.docs.map((d) => d.data() as Score));
    })();
  }, []);
  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold mb-4">Ranking interno</h1>
      <div className="overflow-x-auto rounded-md bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[720px] text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">#</th>
              <th>Participante</th>
              <th>Total</th>
              <th>Grupos</th>
              <th>Octavos</th>
              <th>Cuartos</th>
              <th>Semis</th>
              <th>3º/4º</th>
              <th>Final</th>
              <th>Campeón</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s, i) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="font-mono text-xs">{s.participantId}</td>
                <td className="font-bold">{s.totalPoints}</td>
                <td>{s.breakdown.group}</td>
                <td>{s.breakdown.round_of_16}</td>
                <td>{s.breakdown.quarter_final}</td>
                <td>{s.breakdown.semi_final}</td>
                <td>{s.breakdown.third_place}</td>
                <td>{s.breakdown.final}</td>
                <td>{s.breakdown.champion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
