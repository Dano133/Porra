"use client";

import type {
  GeneratedBracket,
  GroupStandingsMap,
} from "@/lib/world-cup/types";
import TeamLabel from "@/components/TeamLabel";

interface Props {
  standings: GroupStandingsMap;
  bracket: GeneratedBracket;
  submitted: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export default function PredictionSummary({
  bracket,
  submitted,
  onSaveDraft,
  onSubmit,
}: Props) {
  return (
    <section className="wc-card p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-bold">Resumen final</h2>

      <div className="mb-6 rounded-lg bg-wc-background/60 p-4">
        <p className="text-sm text-wc-muted">Campeón predicho</p>
        <div className="text-xl font-semibold">
          <TeamLabel
            team={bracket.final[0]?.winnerTeamId}
            fallbackLabel="Aún sin definir"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onSaveDraft}
          className="wc-btn-secondary w-full sm:w-auto"
        >
          Guardar borrador
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="wc-btn-primary w-full sm:w-auto"
        >
          Enviar porra
        </button>
      </div>

      {submitted && (
        <p className="mt-4 text-sm font-medium text-wc-primary">
          Tu porra se ha enviado correctamente.
        </p>
      )}
    </section>
  );
}
