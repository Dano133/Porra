'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeamLabel from '@/components/TeamLabel';
import { MICROCOPY } from '@/lib/microcopy';
import {
  WORLD_CUP_2026_SOURCE_OF_TRUTH,
  type GroupKey,
  type TournamentGroupMatch,
} from '@/lib/world-cup/source-of-truth';
import {
  calculateAllGroupStandings,
  type GroupPredictionsMap,
} from '@/lib/world-cup/standings';
import { resolveRoundOf32 } from '@/lib/world-cup/bracket-resolver';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import {
  getUserPrediction,
  saveUserPredictionDraft,
  submitUserPrediction,
  type PredictionStatus,
} from '@/lib/firebase/predictions';

const GROUP_KEYS = Object.keys(WORLD_CUP_2026_SOURCE_OF_TRUTH.groups) as GroupKey[];

const STAGES = [
  { id: 'groups', label: 'Fase de grupos', shortLabel: 'Grupos' },
  { id: 'round32', label: 'Dieciseisavos', shortLabel: '1/16' },
  { id: 'round16', label: 'Octavos', shortLabel: '1/8' },
  { id: 'quarterFinals', label: 'Cuartos', shortLabel: '1/4' },
  { id: 'semiFinals', label: 'Semifinales', shortLabel: '1/2' },
  { id: 'final', label: 'Final', shortLabel: 'Final' },
] as const;

type StageId = (typeof STAGES)[number]['id'];

function isGroupStageComplete(predictions: GroupPredictionsMap) {
  return WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.every((m) => {
    const p = predictions[m.id];
    return p && p.homeScore !== null && p.awayScore !== null;
  });
}

function scoreClass(position: number) {
  if (position === 0) return 'bg-wc-gold/12';
  if (position === 1) return 'bg-wc-secondary/15';
  return '';
}

function GroupMatchCard({ match, prediction, onSetScore, closed }: {
  match: TournamentGroupMatch;
  prediction: { homeScore: number | null; awayScore: number | null } | undefined;
  onSetScore: (matchId: string, side: 'homeScore' | 'awayScore', value: string) => void;
  closed: boolean;
}) {
  return (
    <article className="rounded-xl border border-wc-border bg-wc-background/85 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-wc-muted">
        <span>{match.dateLabel} · Jornada {match.matchday}</span>
        <span className="wc-badge">{match.id}</span>
      </div>
      <div className="grid grid-cols-[1fr,56px,20px,56px,1fr] items-center gap-2">
        <TeamLabel team={match.homeTeam} size="sm" />
        <input type="number" min={0} value={prediction?.homeScore ?? ''} onChange={(e) => onSetScore(match.id, 'homeScore', e.target.value)} className="wc-input px-2 py-1 text-center" disabled={closed} />
        <div className="text-center text-wc-muted">-</div>
        <input type="number" min={0} value={prediction?.awayScore ?? ''} onChange={(e) => onSetScore(match.id, 'awayScore', e.target.value)} className="wc-input px-2 py-1 text-center" disabled={closed} />
        <TeamLabel team={match.awayTeam} align="right" size="sm" />
      </div>
    </article>
  );
}

function GroupStandingsTable({ rows }: { rows: ReturnType<typeof calculateAllGroupStandings>[GroupKey] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-wc-border bg-wc-background/40 p-3">
      <h4 className="mb-3 font-semibold">Clasificación automática</h4>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-wc-border text-left text-wc-muted">
            <th className="py-2">Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.team} className={`border-b border-wc-border/60 ${scoreClass(index)}`}>
              <td className="py-2 font-medium"><TeamLabel team={row.team} size="sm" /></td>
              <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.goalsFor}</td><td>{row.goalsAgainst}</td><td>{row.goalDifference}</td><td className="font-semibold text-wc-primary">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupSection(props: {
  groupKey: GroupKey;
  matches: TournamentGroupMatch[];
  standings: ReturnType<typeof calculateAllGroupStandings>[GroupKey];
  predictions: GroupPredictionsMap;
  onSetScore: (matchId: string, side: 'homeScore' | 'awayScore', value: string) => void;
  closed: boolean;
}) {
  return (
    <section className="rounded-2xl border border-wc-border bg-wc-background/30 p-4">
      <h3 className="mb-4 text-lg font-semibold text-wc-primary">Grupo {props.groupKey}</h3>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          {props.matches.map((match) => (
            <GroupMatchCard
              key={match.id}
              match={match}
              prediction={props.predictions[match.id]}
              onSetScore={props.onSetScore}
              closed={props.closed}
            />
          ))}
        </div>
        <GroupStandingsTable rows={props.standings} />
      </div>
    </section>
  );
}


function StageSelector({ activeStage, onChange }: { activeStage: StageId; onChange: (stage: StageId) => void }) {
  return (
    <section className="wc-card mt-8 overflow-hidden p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-wc-gold">Navegación por fases</p>
          <h2 className="mt-1 text-xl font-bold">Elige qué parte del Mundial quieres revisar</h2>
        </div>
        <span className="wc-badge">Fase activa: {STAGES.find((stage) => stage.id === activeStage)?.label}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6" role="tablist" aria-label="Fases del Mundial">
        {STAGES.map((stage) => {
          const isActive = stage.id === activeStage;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(stage.id)}
              className={`group rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-wc-primary/60 ${
                isActive
                  ? 'border-wc-gold bg-wc-gold/15 shadow-lg shadow-wc-gold/10'
                  : 'border-wc-border bg-wc-background/75 hover:border-wc-primary/70 hover:bg-wc-primary/10'
              }`}
            >
              <span className={`block text-lg font-black ${isActive ? 'text-wc-gold' : 'text-wc-primary group-hover:text-wc-text'}`}>
                {stage.shortLabel}
              </span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.14em] text-wc-muted">
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StagePlaceholder({ title, badge, completePreviousStage }: { title: string; badge: string; completePreviousStage: boolean }) {
  return (
    <section className="wc-card mt-8 p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-wc-muted">
            Estructura visual preparada para extender la predicción de eliminatorias sin alterar la fase de grupos.
          </p>
        </div>
        <span className="wc-badge">{badge}</span>
      </div>
      <div className="rounded-2xl border border-dashed border-wc-border bg-wc-background/55 p-6 text-center">
        <p className="text-lg font-semibold text-wc-gold">
          {completePreviousStage ? 'Disponible próximamente' : 'Pendiente de completar fase anterior'}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-wc-muted">
          Por ahora no se inventa lógica de ganadores para esta ronda. Cuando exista la predicción completa de eliminatorias,
          este bloque mostrará sus cruces y selecciones manteniendo el bloqueo de edición si la porra está enviada o bloqueada.
        </p>
      </div>
    </section>
  );
}

function BracketRoundColumn({ title, matches }: { title: string; matches: Array<{ id: string; homeTeam: string | null; awayTeam: string | null; homeSlot: string; awaySlot: string; }> }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-wc-secondary">{title}</h4>
      {matches.map((m) => (
        <article key={m.id} className="rounded-lg border border-wc-border bg-wc-background/85 p-3">
          <div className="mb-2 flex items-center justify-between"><span className="wc-badge">{m.id}</span><span className="text-xs text-wc-muted">{m.homeTeam && m.awayTeam ? 'Clasificado' : 'Pendiente'}</span></div>
          <TeamLabel team={m.homeTeam} fallbackLabel={m.homeSlot} size="sm" />
          <TeamLabel team={m.awayTeam} fallbackLabel={m.awaySlot} size="sm" />
        </article>
      ))}
    </div>
  );
}

function KnockoutBracket({ leftPath, rightPath }: { leftPath: Array<{ id: string; homeTeam: string | null; awayTeam: string | null; homeSlot: string; awaySlot: string; }>; rightPath: Array<{ id: string; homeTeam: string | null; awayTeam: string | null; homeSlot: string; awaySlot: string; }>; }) {
  return (
    <div className="rounded-2xl border border-wc-border bg-wc-background/45 p-4">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">Knockout Stage</h3><span className="wc-badge">Dos caminos hacia la final</span></div>
      <div className="grid gap-4 lg:grid-cols-[1fr,260px,1fr]">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-wc-primary">Camino 1 · R32</h4>
          <BracketRoundColumn title="Dieciseisavos" matches={leftPath} />
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-wc-gold/60 bg-wc-gold/10 p-5 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-wc-gold">Final</p>
            <p className="mt-2 text-lg font-bold">{MICROCOPY.champion}</p>
            <p className="mt-2 text-xs text-wc-muted">R32 → Octavos → Cuartos → Semifinales</p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-wc-primary">Camino 2 · R32</h4>
          <BracketRoundColumn title="Dieciseisavos" matches={rightPath} />
        </div>
      </div>
    </div>
  );
}

export default function PorraPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [groupPredictions, setGroupPredictions] = useState<GroupPredictionsMap>({});
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [predictionStatus, setPredictionStatus] = useState<PredictionStatus | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>('groups');
  const closed = predictionStatus === 'submitted' || predictionStatus === 'locked';

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthResolved(true);

      if (!user) {
        setLoadingPrediction(false);
        setSubmitted(false);
        setPredictionStatus(null);
        setMsg('Inicia sesión para guardar y enviar tu porra.');
        return;
      }

      setLoadingPrediction(true);
      setMsg(null);
      try {
        const data = await getUserPrediction(user.uid);
        if (data?.groupPredictions) {
          setGroupPredictions(data.groupPredictions);
        }
        if (data?.status) {
          setPredictionStatus(data.status);
          setSubmitted(data.status === 'submitted');
          if (data.status === 'submitted' || data.status === 'locked') {
            setMsg('Tu porra ya fue enviada y no se puede modificar.');
          }
        } else {
          setPredictionStatus(null);
          setSubmitted(false);
        }
      } catch (error) {
        console.error('Error loading prediction', error);
        setMsg(error instanceof Error ? error.message : 'Error cargando la porra guardada.');
      } finally {
        setLoadingPrediction(false);
      }
    });
  }, []);


  const standings = useMemo(() => calculateAllGroupStandings(groupPredictions), [groupPredictions]);
  const roundOf32 = useMemo(() => resolveRoundOf32(standings), [standings]);
  const groupStageComplete = useMemo(() => isGroupStageComplete(groupPredictions), [groupPredictions]);
  const leftPath = roundOf32.slice(0, 8);
  const rightPath = roundOf32.slice(8);

  function setScore(matchId: string, side: 'homeScore' | 'awayScore', rawValue: string) {
    if (closed) {
      setMsg('Tu porra ya fue enviada y no se puede modificar.');
      return;
    }

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
    if (!currentUser) {
      setMsg('Debes iniciar sesión para guardar tu porra.');
      return;
    }

    if (predictionStatus === 'submitted' || predictionStatus === 'locked') {
      setMsg('Tu porra ya fue enviada y no se puede modificar.');
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      await saveUserPredictionDraft({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        payload: {
          groupPredictions,
          knockoutPredictions: null,
          champion: null,
          calculatedSnapshot: {
            standings,
            roundOf32,
          },
        },
      });
      setPredictionStatus('draft');
      setSubmitted(false);
      setMsg('Porra guardada correctamente.');
    } catch (error) {
      console.error('Error saving prediction draft', error);
      setMsg(error instanceof Error ? error.message : 'Error guardando la porra.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!currentUser) {
      setMsg('Debes iniciar sesión para enviar tu porra.');
      return;
    }

    if (predictionStatus === 'submitted' || predictionStatus === 'locked') {
      setMsg('Tu porra ya fue enviada y no se puede volver a enviar.');
      return;
    }

    if (!isGroupStageComplete(groupPredictions)) {
      setMsg('Completa todos los resultados antes de enviar tu porra.');
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await submitUserPrediction({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        payload: {
          groupPredictions,
          knockoutPredictions: null,
          champion: null,
          calculatedSnapshot: {
            standings,
            roundOf32,
          },
        },
      });
      setPredictionStatus('submitted');
      setSubmitted(true);
      setMsg('Porra enviada correctamente. Ya no se puede modificar.');
    } catch (error) {
      console.error('Error submitting prediction', error);
      setMsg(error instanceof Error ? error.message : 'Error enviando la porra.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">Arrancan tus 90 minutos.</h1>
        <p className="mt-2 text-wc-muted">{MICROCOPY.predictionsStart}</p>

        <div className="wc-card mt-6 p-4">
          {!authResolved && <p className="text-sm text-wc-muted">Comprobando sesión...</p>}
          {authResolved && !currentUser && (
            <div className="space-y-3">
              <p className="text-wc-accentSoft">Debes iniciar sesión para guardar tu porra.</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/login" className="font-semibold text-wc-primary underline-offset-4 hover:underline">
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="font-semibold text-wc-secondary underline-offset-4 hover:underline">
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}
          {currentUser && <p className="text-sm text-wc-muted">Usuario: {currentUser.email}</p>}
          {predictionStatus && <p className="text-sm text-wc-muted">Estado: {predictionStatus === 'submitted' ? 'enviada' : predictionStatus === 'draft' ? 'borrador' : 'bloqueada'}</p>}
          {closed && <p className="text-sm font-medium text-wc-gold">Tu porra ya fue enviada y no se puede modificar.</p>}
          {loadingPrediction && <p className="text-sm text-wc-muted">Cargando porra guardada...</p>}
        </div>

        <StageSelector activeStage={activeStage} onChange={setActiveStage} />

        {activeStage === 'groups' && (
          <section className="wc-card mt-8 p-6" role="tabpanel">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Fase de grupos</h2>
                <p className="mt-1 text-sm text-wc-muted">Introduce resultados y revisa la clasificación automática grupo a grupo.</p>
              </div>
              <span className="wc-badge">Clasificación automática</span>
            </div>
            <div className="space-y-8">
              {GROUP_KEYS.map((groupKey) => (
                <GroupSection
                  key={groupKey}
                  groupKey={groupKey}
                  matches={WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.filter((m) => m.group === groupKey)}
                  standings={standings[groupKey]}
                  predictions={groupPredictions}
                  onSetScore={setScore}
                  closed={closed}
                />
              ))}
            </div>
          </section>
        )}

        {activeStage === 'round32' && (
          <section className="wc-card mt-8 p-6" role="tabpanel">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Dieciseisavos · 1/16</h2>
                <p className="mt-1 text-sm text-wc-muted">
                  Primer cuadro generado desde la clasificación de grupos actual. La edición de cruces avanzados queda preparada para una siguiente iteración.
                </p>
              </div>
              <span className="wc-badge">R32</span>
            </div>
            {!groupStageComplete && (
              <p className="mb-4 rounded-xl border border-wc-gold/40 bg-wc-gold/10 px-4 py-3 text-sm text-wc-gold">
                Pendiente de completar fase anterior: rellena todos los resultados de grupos para consolidar estos cruces.
              </p>
            )}
            <KnockoutBracket leftPath={leftPath} rightPath={rightPath} />
          </section>
        )}

        {activeStage === 'round16' && <StagePlaceholder title="Octavos · 1/8" badge="R16" completePreviousStage={groupStageComplete} />}
        {activeStage === 'quarterFinals' && <StagePlaceholder title="Cuartos · 1/4" badge="Cuartos" completePreviousStage={groupStageComplete} />}
        {activeStage === 'semiFinals' && <StagePlaceholder title="Semifinales · 1/2" badge="Semifinales" completePreviousStage={groupStageComplete} />}
        {activeStage === 'final' && <StagePlaceholder title="Final y campeón" badge="Campeón" completePreviousStage={groupStageComplete} />}

        <section className="wc-card mt-8 p-6">
          <h2 className="mb-4 text-2xl font-bold">Acciones clave</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!currentUser || saving || submitting || closed || loadingPrediction} onClick={handleSaveDraft} className="wc-btn-secondary">
              {saving ? 'Guardando...' : 'Guardar mi porra'}
            </button>
            <button type="button" disabled={!currentUser || saving || submitting || closed || loadingPrediction} onClick={handleSubmit} className="wc-btn-primary">
              {submitting ? 'Enviando...' : 'Enviar porra definitiva'}
            </button>
          </div>
          {!groupStageComplete && <p className="mt-3 text-sm text-wc-accentSoft">{MICROCOPY.completeGroups}</p>}
          {submitted && <p className="mt-3 text-sm font-medium text-wc-gold">{MICROCOPY.champion}</p>}
          {!currentUser && authResolved && (
            <p className="mt-3 text-sm text-wc-muted">
              Para guardar o enviar, <Link href="/login" className="font-semibold text-wc-primary underline-offset-4 hover:underline">inicia sesión</Link> o{' '}
              <Link href="/registro" className="font-semibold text-wc-secondary underline-offset-4 hover:underline">regístrate</Link>.
            </p>
          )}
          {msg && <p className="mt-3 text-sm text-wc-muted">{msg}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}
