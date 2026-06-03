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
  const closed = false;

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
      setSubmitted(true);
      setPredictionStatus('submitted');
      setMsg('Porra enviada correctamente.');
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
          {loadingPrediction && <p className="text-sm text-wc-muted">Cargando porra guardada...</p>}
        </div>

        <section className="wc-card mt-8 p-6">
          <h2 className="mb-6 text-2xl font-bold">Fase de grupos</h2>
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

        <section className="wc-card mt-8 p-6">
          <h2 className="mb-1 text-2xl font-bold">Cuadro de eliminatorias</h2>
          <p className="mb-4 text-sm text-wc-muted">Empieza la fase de eliminación directa.</p>
          <KnockoutBracket leftPath={leftPath} rightPath={rightPath} />
        </section>

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
