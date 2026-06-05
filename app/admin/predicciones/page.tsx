"use client";
import { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase-client";
import type { Prediction } from "@/lib/types";
import TeamLabel from "@/components/TeamLabel";

export default function AdminPredicciones() {
  const [list, setList] = useState<Prediction[]>([]);
  async function load() {
    const snap = await getDocs(collection(getDb(), "predictions"));
    setList(snap.docs.map((d) => d.data() as Prediction));
  }
  useEffect(() => {
    load();
  }, []);

  async function invalidate(p: Prediction) {
    await updateDoc(doc(getDb(), "predictions", p.id), {
      status: "cancelled",
      updatedAt: Date.now(),
    });
    load();
  }

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold mb-4">Predicciones</h1>
      <div className="overflow-x-auto rounded-md bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[720px] text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Participante</th>
              <th>Estado</th>
              <th>Campeón</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 font-mono text-xs">{p.participantId}</td>
                <td>{p.status}</td>
                <td>
                  <TeamLabel
                    team={p.championPrediction}
                    fallbackLabel="—"
                    size="sm"
                  />
                </td>
                <td>
                  {p.status !== "cancelled" && (
                    <button
                      onClick={() => invalidate(p)}
                      className="text-red-600"
                    >
                      Invalidar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
