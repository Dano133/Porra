"use client";

import { GeneratedBracket, MatchPrediction } from "@/lib/world-cup/types";

interface Props {
  bracket: GeneratedBracket;
  onMatchUpdate: (
    stage: keyof GeneratedBracket,
    matchId: string,
    payload: { homeScore: number; awayScore: number; winner: string }
  ) => void;
}

function MatchCard({
  match,
  stage,
  onSave,
}: {
  match: MatchPrediction;
  stage: keyof GeneratedBracket;
  onSave: Props["onMatchUpdate"];
}) {
  const homeScore = match.homeScore ?? "";
  const awayScore = match.awayScore ?? "";

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 text-sm font-semibold text-gray-500">{match.id}</div>
      <div className="space-y-2">
        <div className="rounded bg-gray-50 px-3 py-2">{match.homeTeam ?? "Pendiente"}</div>
        <div className="rounded bg-gray-50 px-3 py-2">{match.awayTeam ?? "Pendiente"}</div>
      </div>

      {match.homeTeam && match.awayTeam && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              defaultValue={homeScore}
              placeholder="Goles local"
              className="rounded border px-3 py-2"
              id={`${match.id}-home`}
            />
            <input
              type="number"
              defaultValue={awayScore}
              placeholder="Goles visitante"
              className="rounded border px-3 py-2"
              id={`${match.id}-away`}
            />
          </div>

          <select
            defaultValue={match.winner ?? ""}
            className="w-full rounded border px-3 py-2"
            id={`${match.id}-winner`}
          >
            <option value="">Selecciona ganador</option>
            <option value={match.homeTeam}>{match.homeTeam}</option>
            <option value={match.awayTeam}>{match.awayTeam}</option>
          </select>

          <button
            type="button"
            className="rounded bg-amber-500 px-4 py-2 font-medium text-white"
            onClick={() => {
              const homeInput = document.getElementById(`${match.id}-home`) as HTMLInputElement | null;
              const awayInput = document.getElementById(`${match.id}-away`) as HTMLInputElement | null;
              const winnerInput = document.getElementById(`${match.id}-winner`) as HTMLSelectElement | null;

              const home = Number(homeInput?.value ?? 0);
              const away = Number(awayInput?.value ?? 0);
              const winner = winnerInput?.value ?? "";

              if (!winner) {
                alert("Selecciona un ganador.");
                return;
              }

              onSave(stage, match.id, {
                homeScore: home,
                awayScore: away,
                winner,
              });
            }}
          >
            Guardar partido
          </button>
        </div>
      )}
    </div>
  );
}

export default function KnockoutBracket({ bracket, onMatchUpdate }: Props) {
  const sections: Array<{ title: string; key: keyof GeneratedBracket }> = [
    { title: "Ronda inicial", key: "round32" },
    { title: "Octavos", key: "round16" },
    { title: "Cuartos", key: "quarterfinals" },
    { title: "Semifinales", key: "semifinals" },
    { title: "3º y 4º puesto", key: "thirdPlace" },
    { title: "Final", key: "final" },
  ];

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-2xl font-bold">Cuadro eliminatorio</h2>

      <div className="space-y-8">
        {sections.map((section) => {
          const matches = bracket[section.key];
          if (!Array.isArray(matches)) return null;

          return (
            <div key={section.key}>
              <h3 className="mb-4 text-xl font-semibold">{section.title}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    stage={section.key}
                    onSave={onMatchUpdate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}