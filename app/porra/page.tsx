'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WORLD_CUP_2026_SOURCE_OF_TRUTH, type GroupKey } from '@/lib/world-cup/source-of-truth';
import {
  calculateAllGroupStandings,
  type GroupPredictionsMap,
} from '@/lib/world-cup/standings';
import { resolveRoundOf32 } from '@/lib/world-cup/bracket-resolver';

const GROUP_KEYS = Object.keys(
  WORLD_CUP_2026_SOURCE_OF_TRUTH.groups
) as GroupKey[];

function isGroupStageComplete(predictions: GroupPredictionsMap) {
  return WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.every((match) => {
    const p = predictions[match.id];
    return p && p.homeScore !== null && p.awayScore !== null;
  });
}

export default function PorraPage() {
  const [email, setEmail] = useState('');
  const [groupPredictions, setGroupPredictions] = useState<GroupPredictionsMap>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const closed = false;

  const standings = useMemo(() => {
    return calculateAllGroupStandings(groupPredictions);
  }, [groupPredictions]);

  const roundOf32 = useMemo(() => {
    return resolveRoundOf32(standings);
  }, [standings]);

  const groupStageComplete = useMemo(() => {
    return isGroupStageComplete(groupPredictions);
  }, [groupPredictions]);

  function setScore(
    matchId: string,
    side: 'homeScore' | 'awayScore',
    rawValue: string
  ) {
    const value = rawValue === '' ? null : Number(rawValue);

    setGroupPredictions((prev) => ({
      ...prev,
      [matchId]: {
        homeScore: prev[matchId]?.homeScore ?? null,
        awayScore: prev[matchId]?.awayScore ?? null,
        [side]: value,
      },
    }));
  }

  async function handleSaveDraft() {
    setSubmitting(true);
    setMsg(null);

    try {
      const payload = {
        email,
        tournamentId: WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.id,
        status: 'draft',
        groupStagePredictions: groupPredictions,
        calculatedStandings: standings,
        resolvedRoundOf32: roundOf32,
        updatedAt: new Date().toISOString(),
      };

      console.log('Guardar borrador', payload);
      setMsg('Borrador guardado.');
    } catch (error: any) {
      setMsg(error.message || 'Error guardando borrador.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!groupStageComplete) {
      setMsg('Debes completar todos los partidos de la fase de grupos.');
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const payload = {
        email,
        tournamentId: WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.id,
        status: 'submitted',
        groupStagePredictions: groupPredictions,
        calculatedStandings: standings,
        resolvedRoundOf32: roundOf32,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Enviar porra', payload);
      setSubmitted(true);
      setMsg('Porra enviada correctamente.');
    } catch (error: any) {
      setMsg(error.message || 'Error enviando la porra.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">Mi porra</h1>

        <p className="mt-2 text-sm text-gray-600">
          Introduce los resultados de todos los partidos de la fase de grupos.
          La clasificación se calculará automáticamente y después verás el cruce
          inicial del cuadro.
        </p>

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">
            Tu correo (con el que te registraste)
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            type="email"
            placeholder="tuemail@empresa.com"
          />
        </div>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-6 text-2xl font-bold">Fase de grupos</h2>

          <div className="space-y-8">
            {GROUP_KEYS.map((groupKey) => {
              const matches = WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.filter(
                (match) => match.group === groupKey
              );
              const table = standings[groupKey];

              return (
                <div key={groupKey} className="rounded-xl border p-4">
                  <h3 className="mb-4 text-lg font-semibold">Grupo {groupKey}</h3>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="space-y-3">
                      {matches.map((match) => (
                        <div key={match.id} className="rounded-lg border p-3">
                          <div className="mb-2 text-xs text-gray-500">
                            {match.dateLabel} · Jornada {match.matchday}
                          </div>

                          <div className="grid grid-cols-[1fr,70px,20px,70px,1fr] items-center gap-2">
                            <div>{match.homeTeam}</div>

                            <input
                              type="number"
                              min={0}
                              value={groupPredictions[match.id]?.homeScore ?? ''}
                              onChange={(e) =>
                                setScore(match.id, 'homeScore', e.target.value)
                              }
                              className="rounded border px-2 py-1 text-center"
                              disabled={closed}
                            />

                            <div className="text-center">-</div>

                            <input
                              type="number"
                              min={0}
                              value={groupPredictions[match.id]?.awayScore ?? ''}
                              onChange={(e) =>
                                setScore(match.id, 'awayScore', e.target.value)
                              }
                              className="rounded border px-2 py-1 text-center"
                              disabled={closed}
                            />

                            <div className="text-right">{match.awayTeam}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto rounded-lg border p-3">
                      <h4 className="mb-3 font-semibold">Clasificación automática</h4>

                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="py-2">Equipo</th>
                            <th className="py-2">PJ</th>
                            <th className="py-2">PG</th>
                            <th className="py-2">PE</th>
                            <th className="py-2">PP</th>
                            <th className="py-2">GF</th>
                            <th className="py-2">GC</th>
                            <th className="py-2">DG</th>
                            <th className="py-2">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.map((row, index) => (
                            <tr key={row.team} className="border-b">
                              <td className="py-2 font-medium">
                                {index + 1}. {row.team}
                              </td>
                              <td>{row.played}</td>
                              <td>{row.won}</td>
                              <td>{row.drawn}</td>
                              <td>{row.lost}</td>
                              <td>{row.goalsFor}</td>
                              <td>{row.goalsAgainst}</td>
                              <td>{row.goalDifference}</td>
                              <td className="font-semibold">{row.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-2xl font-bold">Cruce inicial generado</h2>
          <p className="mb-4 text-sm text-gray-600">
            Este bloque se resuelve automáticamente a partir de la clasificación
            de grupos y los mejores terceros.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {roundOf32.map((match) => (
              <div key={match.id} className="rounded-lg border p-4">
                <div className="mb-2 text-sm font-semibold text-gray-500">
                  {match.id}
                </div>
                <div className="text-sm text-gray-500">
                  {match.homeRef} vs {match.awayRef}
                </div>
                <div className="mt-2 font-medium">
                  {match.homeTeam ?? 'Pendiente'} vs {match.awayTeam ?? 'Pendiente'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-2xl font-bold">Acciones</h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={submitting || closed}
              onClick={handleSaveDraft}
              className="rounded-lg border px-5 py-3 font-semibold"
            >
              Guardar borrador
            </button>

            <button
              type="button"
              disabled={submitting || closed || !groupStageComplete}
              onClick={handleSubmit}
              className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar porra
            </button>
          </div>

          {!groupStageComplete && (
            <p className="mt-3 text-sm text-red-600">
              Debes completar todos los partidos de la fase de grupos antes de enviar.
            </p>
          )}

          {submitted && (
            <p className="mt-3 text-sm font-medium text-green-700">
              Tu porra se ha enviado correctamente.
            </p>
          )}

          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-3 text-xl font-bold">Sistema de puntuación</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Acertar vencedor en grupos: 5 puntos</li>
            <li>• Acertar vencedor y resultado exacto en grupos: 15 puntos</li>
            <li>• Acertar empate: 10 puntos</li>
            <li>• Acertar empate exacto: 20 puntos</li>
            <li>• La ronda de 32 sigue pendiente de decisión en la fuente de verdad</li>
            <li>• El resultado cuenta hasta final de prórroga</li>
            <li>• No cuentan los penaltis</li>
          </ul>
        </section>
      </main>

      <Footer />
    </>
  );
}