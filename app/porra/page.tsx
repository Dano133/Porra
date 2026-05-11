'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  WORLD_CUP_2026_SOURCE_OF_TRUTH,
  type GroupKey,
} from '@/lib/world-cup/source-of-truth';
import {
  calculateAllGroupStandings,
  type GroupPredictionsMap,
} from '@/lib/world-cup/standings';
import { resolveRoundOf32 } from '@/lib/world-cup/bracket-resolver';

const GROUP_KEYS = Object.keys(
  WORLD_CUP_2026_SOURCE_OF_TRUTH.groups,
) as GroupKey[];

const TEAM_FLAGS: Record<string, string> = {
  México: '🇲🇽', Sudáfrica: '🇿🇦', 'Corea Republic': '🇰🇷', Chequia: '🇨🇿', Canadá: '🇨🇦',
  'Bosnia y Herzegovina': '🇧🇦', Qatar: '🇶🇦', Suiza: '🇨🇭', Brasil: '🇧🇷', Marruecos: '🇲🇦', Haití: '🇭🇹', Escocia: '🏴',
  USA: '🇺🇸', Paraguay: '🇵🇾', Australia: '🇦🇺', Turquía: '🇹🇷', Alemania: '🇩🇪', Curazao: '🇨🇼', 'Costa de Marfil': '🇨🇮', Ecuador: '🇪🇨',
  'Países Bajos': '🇳🇱', Japón: '🇯🇵', Suecia: '🇸🇪', Túnez: '🇹🇳', Bélgica: '🇧🇪', Egipto: '🇪🇬', Irán: '🇮🇷', 'Nueva Zelanda': '🇳🇿',
  España: '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arabia Saudí': '🇸🇦', Uruguay: '🇺🇾', Francia: '🇫🇷', Senegal: '🇸🇳', Irak: '🇮🇶', Noruega: '🇳🇴',
  Argentina: '🇦🇷', Argelia: '🇩🇿', Austria: '🇦🇹', Jordania: '🇯🇴', Portugal: '🇵🇹', 'Congo DR': '🇨🇩', Uzbekistán: '🇺🇿', Colombia: '🇨🇴',
  Inglaterra: '🏴', Croacia: '🇭🇷', Ghana: '🇬🇭', Panamá: '🇵🇦',
};

function Flag({ team }: { team?: string | null }) {
  const icon = (team && TEAM_FLAGS[team]) || '🏳️';
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-wc-border bg-wc-background text-sm">
      {icon}
    </span>
  );
}

function TeamLabel({ team }: { team?: string | null }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Flag team={team} />
      <span>{team ?? 'Pendiente'}</span>
    </span>
  );
}

function isGroupStageComplete(predictions: GroupPredictionsMap) {
  return WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.every((match) => {
    const p = predictions[match.id];
    return p && p.homeScore !== null && p.awayScore !== null;
  });
}

export default function PorraPage() {
  const [email, setEmail] = useState('');
  const [groupPredictions, setGroupPredictions] = useState<GroupPredictionsMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const closed = false;

  const standings = useMemo(() => calculateAllGroupStandings(groupPredictions), [groupPredictions]);
  const roundOf32 = useMemo(() => resolveRoundOf32(standings), [standings]);
  const groupStageComplete = useMemo(() => isGroupStageComplete(groupPredictions), [groupPredictions]);
  const leftPath = roundOf32.filter((_, idx) => idx < 8);
  const rightPath = roundOf32.filter((_, idx) => idx >= 8);

  function setScore(matchId: string, side: 'homeScore' | 'awayScore', rawValue: string) {
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
      console.log('Guardar borrador', { email, groupPredictions, standings, roundOf32 });
      setMsg('Partido en pausa. Tu porra queda guardada.');
    } catch (error: any) {
      setMsg(error.message || 'Error guardando borrador.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!groupStageComplete) {
      setMsg('Completa todos los partidos antes del pitido final.');
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      setSubmitted(true);
      setMsg('Final del partido. Tu porra ya está en juego.');
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
        <h1 className="text-3xl font-bold">Arrancan tus 90 minutos.</h1>
        <p className="mt-2 text-wc-muted">Marca cada resultado y deja que la tabla haga el resto.</p>

        <div className="wc-card mt-6 p-4">
          <label className="mb-1 block text-sm">Correo de registro</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="wc-input"
            type="email"
            placeholder="tuemail@empresa.com"
          />
        </div>

        <section className="wc-card mt-8 p-6">
          <h2 className="mb-6 text-2xl font-bold">Fase de grupos</h2>
          <div className="space-y-8">
            {GROUP_KEYS.map((groupKey) => {
              const matches = WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.filter((m) => m.group === groupKey);
              const table = standings[groupKey];

              return (
                <div key={groupKey} className="rounded-xl border border-wc-border p-4">
                  <h3 className="mb-4 text-lg font-semibold text-wc-primary">Grupo {groupKey}</h3>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="space-y-3">
                      {matches.map((match) => (
                        <div key={match.id} className="rounded-lg border border-wc-border bg-wc-background p-3">
                          <div className="mb-2 text-xs text-wc-muted">{match.dateLabel} · Jornada {match.matchday}</div>
                          <div className="grid grid-cols-[1fr,56px,20px,56px,1fr] items-center gap-2">
                            <div><TeamLabel team={match.homeTeam} /></div>
                            <input type="number" min={0} value={groupPredictions[match.id]?.homeScore ?? ''} onChange={(e) => setScore(match.id, 'homeScore', e.target.value)} className="wc-input px-2 py-1 text-center" disabled={closed} />
                            <div className="text-center text-wc-muted">-</div>
                            <input type="number" min={0} value={groupPredictions[match.id]?.awayScore ?? ''} onChange={(e) => setScore(match.id, 'awayScore', e.target.value)} className="wc-input px-2 py-1 text-center" disabled={closed} />
                            <div className="flex justify-end"><TeamLabel team={match.awayTeam} /></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-wc-border p-3">
                      <h4 className="mb-3 font-semibold">Clasificación automática</h4>
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-wc-border text-left text-wc-muted">
                            <th className="py-2">Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.map((row, index) => (
                            <tr key={row.team} className="border-b border-wc-border/60">
                              <td className="py-2 font-medium"><span className="mr-2">{index < 2 ? '⭐' : '•'}</span><TeamLabel team={row.team} /></td>
                              <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.goalsFor}</td><td>{row.goalsAgainst}</td><td>{row.goalDifference}</td><td className="font-semibold text-wc-primary">{row.points}</td>
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

        <section className="wc-card mt-8 p-6">
          <h2 className="mb-1 text-2xl font-bold">Cuadro de eliminatorias</h2>
          <p className="mb-4 text-sm text-wc-muted">Cruce grande a doble lado: de la fase de grupos al camino hacia la copa.</p>
          <div className="grid gap-4 lg:grid-cols-[1fr,220px,1fr]">
            <div className="space-y-3">
              {leftPath.map((m) => (
                <div key={m.id} className="rounded-lg border border-wc-border bg-wc-background p-3">
                  <p className="text-xs font-semibold text-wc-secondary">{m.id}</p>
                  <p className="mt-1 text-sm"><TeamLabel team={m.homeTeam} /></p>
                  <p className="text-sm"><TeamLabel team={m.awayTeam} /></p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center rounded-xl border border-wc-gold/50 bg-wc-gold/10 p-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-wc-gold">Final</p>
                <p className="mt-2 text-lg font-bold">Aquí se define la historia.</p>
              </div>
            </div>
            <div className="space-y-3">
              {rightPath.map((m) => (
                <div key={m.id} className="rounded-lg border border-wc-border bg-wc-background p-3">
                  <p className="text-xs font-semibold text-wc-secondary">{m.id}</p>
                  <p className="mt-1 text-sm"><TeamLabel team={m.homeTeam} /></p>
                  <p className="text-sm"><TeamLabel team={m.awayTeam} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wc-card mt-8 p-6">
          <h2 className="mb-4 text-2xl font-bold">Acciones clave</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={submitting || closed} onClick={handleSaveDraft} className="wc-btn-secondary">Guardar borrador</button>
            <button type="button" disabled={submitting || closed || !groupStageComplete} onClick={handleSubmit} className="wc-btn-primary">Enviar porra</button>
          </div>
          {!groupStageComplete && <p className="mt-3 text-sm text-wc-accentSoft">Cierra la fase de grupos para pasar a eliminatorias.</p>}
          {submitted && <p className="mt-3 text-sm font-medium text-wc-gold">Aquí se empieza a levantar la copa.</p>}
          {msg && <p className="mt-3 text-sm text-wc-muted">{msg}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}
