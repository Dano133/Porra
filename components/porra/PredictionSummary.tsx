'use client';

import type { GeneratedBracket, GroupStandingsMap } from '@/lib/world-cup/types';

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
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-2xl font-bold">Resumen final</h2>

      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">Campeón predicho</p>
        <p className="text-xl font-semibold">{bracket.champion ?? 'Aún sin definir'}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-lg border px-5 py-3 font-semibold"
        >
          Guardar borrador
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white"
        >
          Enviar porra
        </button>
      </div>

      {submitted && (
        <p className="mt-4 text-sm font-medium text-green-700">
          Tu porra se ha enviado correctamente.
        </p>
      )}
    </section>
  );
}