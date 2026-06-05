"use client";

import { GeneratedBracket, MatchPrediction } from "@/lib/world-cup/types";
import TeamLabel from "@/components/TeamLabel";
import { formatTeamWithFlag } from "@/lib/world-cup/team-identity";

interface Props {
  bracket: GeneratedBracket;
  onMatchUpdate: (
    stage: keyof GeneratedBracket,
    matchId: string,
    payload: { homeScore: number; awayScore: number; winner: string },
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
    <div className="rounded-lg border border-wc-border bg-wc-background/60 p-4">
      <div className="mb-2 text-sm font-semibold text-wc-muted">{match.id}</div>
      <div className="space-y-2">
        <div className="rounded border border-wc-border bg-wc-background px-3 py-2">
          <TeamLabel
            team={match.homeTeam}
            fallbackLabel="Pendiente"
            size="sm"
          />
        </div>
        <div className="rounded border border-wc-border bg-wc-background px-3 py-2">
          <TeamLabel
            team={match.awayTeam}
            fallbackLabel="Pendiente"
            size="sm"
          />
        </div>
      </div>

      {match.homeTeam && match.awayTeam && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="number"
              defaultValue={homeScore}
              placeholder="Goles local"
              className="wc-input"
              id={`${match.id}-home`}
            />
            <input
              type="number"
              defaultValue={awayScore}
              placeholder="Goles visitante"
              className="wc-input"
              id={`${match.id}-away`}
            />
          </div>

          <select
            defaultValue={match.winner ?? ""}
            className="w-full wc-input"
            id={`${match.id}-winner`}
          >
            <option value="">Selecciona ganador</option>
            <option value={match.homeTeam}>
              {formatTeamWithFlag(match.homeTeam)}
            </option>
            <option value={match.awayTeam}>
              {formatTeamWithFlag(match.awayTeam)}
            </option>
          </select>

          <button
            type="button"
            className="wc-btn-gold w-full sm:w-auto"
            onClick={() => {
              const homeInput = document.getElementById(
                `${match.id}-home`,
              ) as HTMLInputElement | null;
              const awayInput = document.getElementById(
                `${match.id}-away`,
              ) as HTMLInputElement | null;
              const winnerInput = document.getElementById(
                `${match.id}-winner`,
              ) as HTMLSelectElement | null;

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
    <section className="wc-card p-4 sm:p-6">
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
