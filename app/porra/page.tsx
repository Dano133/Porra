"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamLabel from "@/components/TeamLabel";
import { MICROCOPY } from "@/lib/microcopy";
import {
  WORLD_CUP_2026_SOURCE_OF_TRUTH,
  type GroupKey,
  type TournamentGroupMatch,
} from "@/lib/world-cup/source-of-truth";
import {
  calculateAllGroupStandings,
  type GroupPredictionsMap,
} from "@/lib/world-cup/standings";
import { resolveRoundOf32 } from "@/lib/world-cup/bracket-resolver";
import {
  buildKnockoutBracket,
  flattenKnockoutBracket,
  getChampion,
  KNOCKOUT_ROUNDS,
  toScoringKnockoutPredictions,
  type KnockoutMatchView,
  type KnockoutPredictionsMap,
  type KnockoutRoundId,
} from "@/lib/world-cup/knockout";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  getUserPrediction,
  saveUserPredictionDraft,
  submitUserPrediction,
  type PredictionStatus,
} from "@/lib/firebase/predictions";

const GROUP_KEYS = Object.keys(
  WORLD_CUP_2026_SOURCE_OF_TRUTH.groups,
) as GroupKey[];

const STAGES = [
  { id: "groups", label: "Fase de grupos", shortLabel: "Grupos" },
  ...KNOCKOUT_ROUNDS.map((round) => ({
    id: round.id,
    label: round.label,
    shortLabel: round.shortLabel,
  })),
] as const;

type StageId = (typeof STAGES)[number]["id"];

function isGroupStageComplete(predictions: GroupPredictionsMap) {
  return WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.every((m) => {
    const p = predictions[m.id];
    return p && p.homeScore !== null && p.awayScore !== null;
  });
}

function scoreClass(position: number) {
  if (position === 0) return "bg-wc-gold/12";
  if (position === 1) return "bg-wc-secondary/15";
  return "";
}

function GroupMatchCard({
  match,
  prediction,
  onSetScore,
  closed,
}: {
  match: TournamentGroupMatch;
  prediction:
    | { homeScore: number | null; awayScore: number | null }
    | undefined;
  onSetScore: (
    matchId: string,
    side: "homeScore" | "awayScore",
    value: string,
  ) => void;
  closed: boolean;
}) {
  return (
    <article className="rounded-xl border border-wc-border bg-wc-background/85 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-wc-muted">
        <span>
          {match.dateLabel} · Jornada {match.matchday}
        </span>
        <span className="wc-badge">{match.id}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),56px,20px,56px,minmax(0,1fr)] sm:items-center">
        <div className="grid grid-cols-[minmax(0,1fr),64px] items-center gap-2 sm:contents">
          <TeamLabel team={match.homeTeam} size="sm" />
          <input
            type="number"
            min={0}
            value={prediction?.homeScore ?? ""}
            onChange={(e) => onSetScore(match.id, "homeScore", e.target.value)}
            className="wc-input px-2 py-1 text-center"
            disabled={closed}
          />
        </div>
        <div className="hidden text-center text-wc-muted sm:block">-</div>
        <div className="grid grid-cols-[minmax(0,1fr),64px] items-center gap-2 sm:contents">
          <input
            type="number"
            min={0}
            value={prediction?.awayScore ?? ""}
            onChange={(e) => onSetScore(match.id, "awayScore", e.target.value)}
            className="wc-input order-2 px-2 py-1 text-center sm:order-none"
            disabled={closed}
          />
          <TeamLabel
            team={match.awayTeam}
            align="left"
            size="sm"
            className="order-1 sm:order-none sm:justify-end sm:text-right"
          />
        </div>
      </div>
    </article>
  );
}

function GroupStandingsTable({
  rows,
}: {
  rows: ReturnType<typeof calculateAllGroupStandings>[GroupKey];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-wc-border bg-wc-background/40 p-3 [-webkit-overflow-scrolling:touch]">
      <h4 className="mb-3 font-semibold">Clasificación automática</h4>
      <table className="min-w-[620px] text-sm sm:min-w-full">
        <thead>
          <tr className="border-b border-wc-border text-left text-wc-muted">
            <th className="py-2">Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.team}
              className={`border-b border-wc-border/60 ${scoreClass(index)}`}
            >
              <td className="py-2 font-medium">
                <TeamLabel team={row.team} size="sm" />
              </td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td>
              <td>{row.goalDifference}</td>
              <td className="font-semibold text-wc-primary">{row.points}</td>
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
  onSetScore: (
    matchId: string,
    side: "homeScore" | "awayScore",
    value: string,
  ) => void;
  closed: boolean;
}) {
  return (
    <section className="rounded-2xl border border-wc-border bg-wc-background/30 p-3 sm:p-4">
      <h3 className="mb-4 text-lg font-semibold text-wc-primary">
        Grupo {props.groupKey}
      </h3>
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

function StageSelector({
  activeStage,
  onChange,
}: {
  activeStage: StageId;
  onChange: (stage: StageId) => void;
}) {
  return (
    <section className="wc-card mt-6 overflow-hidden p-3 sm:mt-8 sm:p-4">
      <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-wc-gold">
            Navegación por fases
          </p>
          <h2 className="mt-1 text-xl font-bold">
            Elige qué parte del Mundial quieres revisar
          </h2>
        </div>
        <span className="wc-badge">
          Fase activa: {STAGES.find((stage) => stage.id === activeStage)?.label}
        </span>
      </div>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        role="tablist"
        aria-label="Fases del Mundial"
      >
        {STAGES.map((stage) => {
          const isActive = stage.id === activeStage;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(stage.id)}
              className={`group min-h-20 rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-wc-primary/60 sm:px-4 ${
                isActive
                  ? "border-wc-gold bg-wc-gold/15 shadow-lg shadow-wc-gold/10"
                  : "border-wc-border bg-wc-background/75 hover:border-wc-primary/70 hover:bg-wc-primary/10"
              }`}
            >
              <span
                className={`block text-lg font-black ${isActive ? "text-wc-gold" : "text-wc-primary group-hover:text-wc-text"}`}
              >
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

const ROUND_COPY: Record<KnockoutRoundId, { title: string; badge: string }> = {
  round32: { title: "Dieciseisavos · 1/16", badge: "R32" },
  round16: { title: "Octavos · 1/8", badge: "R16" },
  quarterFinals: { title: "Cuartos · 1/4", badge: "Cuartos" },
  semiFinals: { title: "Semifinales · 1/2", badge: "Semifinales" },
  final: { title: "Final y campeón", badge: "Campeón" },
};

const VALIDATION_ROUND_LABELS: Record<KnockoutRoundId, string> = {
  round32: "dieciseisavos",
  round16: "octavos",
  quarterFinals: "cuartos",
  semiFinals: "semifinales",
  final: "final",
};

function KnockoutMatchCard({
  match,
  closed,
  onSetScore,
  onSetWinner,
}: {
  match: KnockoutMatchView;
  closed: boolean;
  onSetScore: (
    matchId: string,
    side: "homeScore" | "awayScore",
    value: string,
  ) => void;
  onSetWinner: (matchId: string, winnerTeamId: string) => void;
}) {
  const isReady = Boolean(match.homeTeam && match.awayTeam);
  const hasScores = match.homeScore !== null && match.awayScore !== null;
  const isDraw = hasScores && match.homeScore === match.awayScore;
  const winnerLabel = match.winnerTeamId
    ? "Clasifica"
    : isReady
      ? "Pendiente"
      : "Esperando clasificados";

  return (
    <article className="rounded-xl border border-wc-border bg-wc-background/85 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-wc-muted">
        <span className="wc-badge">{match.matchId}</span>
        <span>{winnerLabel}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),56px,20px,56px,minmax(0,1fr)] sm:items-center">
        <div className="grid grid-cols-[minmax(0,1fr),64px] items-center gap-2 sm:contents">
          <TeamLabel
            team={match.homeTeam}
            fallbackLabel={match.homeSlot}
            size="sm"
          />
          <input
            type="number"
            min={0}
            value={match.homeScore ?? ""}
            onChange={(e) =>
              onSetScore(match.matchId, "homeScore", e.target.value)
            }
            className="wc-input px-2 py-1 text-center"
            disabled={closed || !isReady}
          />
        </div>
        <div className="hidden text-center text-wc-muted sm:block">-</div>
        <div className="grid grid-cols-[minmax(0,1fr),64px] items-center gap-2 sm:contents">
          <input
            type="number"
            min={0}
            value={match.awayScore ?? ""}
            onChange={(e) =>
              onSetScore(match.matchId, "awayScore", e.target.value)
            }
            className="wc-input order-2 px-2 py-1 text-center sm:order-none"
            disabled={closed || !isReady}
          />
          <TeamLabel
            team={match.awayTeam}
            fallbackLabel={match.awaySlot}
            align="left"
            size="sm"
            className="order-1 sm:order-none sm:justify-end sm:text-right"
          />
        </div>
      </div>

      {isReady && (
        <div className="mt-3 rounded-lg border border-wc-border/70 bg-wc-background/55 p-3 text-sm">
          {isDraw ? (
            <label className="block">
              <span className="mb-1 block font-medium text-wc-gold">
                Empate: selecciona el clasificado por penaltis
              </span>
              <select
                className="wc-select"
                value={match.winnerTeamId ?? ""}
                onChange={(e) => onSetWinner(match.matchId, e.target.value)}
                disabled={closed}
              >
                <option value="">Clasifica / ganador por penaltis</option>
                <option value={match.homeTeam ?? ""}>{match.homeTeam}</option>
                <option value={match.awayTeam ?? ""}>{match.awayTeam}</option>
              </select>
            </label>
          ) : match.winnerTeamId ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-wc-muted">Clasificado</span>
              <TeamLabel team={match.winnerTeamId} size="sm" />
            </div>
          ) : (
            <span className="text-wc-muted">
              Introduce ambos resultados para calcular el clasificado.
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function KnockoutRoundSection({
  round,
  matches,
  groupStageComplete,
  champion,
  closed,
  onSetScore,
  onSetWinner,
}: {
  round: KnockoutRoundId;
  matches: KnockoutMatchView[];
  groupStageComplete: boolean;
  champion: string | null;
  closed: boolean;
  onSetScore: (
    matchId: string,
    side: "homeScore" | "awayScore",
    value: string,
  ) => void;
  onSetWinner: (matchId: string, winnerTeamId: string) => void;
}) {
  const copy = ROUND_COPY[round];
  const isFinal = round === "final";

  return (
    <section className="wc-card mt-8 p-4 sm:p-6" role="tabpanel">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{copy.title}</h2>
          <p className="mt-1 text-sm text-wc-muted">
            Rellena el marcador. Si hay empate, elige el clasificado por
            penaltis para que avance a la siguiente ronda.
          </p>
        </div>
        <span className="wc-badge">{copy.badge}</span>
      </div>

      {!groupStageComplete && (
        <p className="mb-4 rounded-xl border border-wc-gold/40 bg-wc-gold/10 px-4 py-3 text-sm text-wc-gold">
          Pendiente de completar fase anterior: rellena todos los resultados de
          grupos para consolidar estos cruces.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((match) => (
          <KnockoutMatchCard
            key={match.matchId}
            match={match}
            closed={closed}
            onSetScore={onSetScore}
            onSetWinner={onSetWinner}
          />
        ))}
      </div>

      {isFinal && (
        <div className="mt-5 rounded-2xl border border-wc-gold/60 bg-wc-gold/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-wc-gold">
            Campeón
          </p>
          <div className="mt-2 text-lg font-bold">
            <TeamLabel team={champion} fallbackLabel="Aún sin definir" />
          </div>
        </div>
      )}
    </section>
  );
}

export default function PorraPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [groupPredictions, setGroupPredictions] = useState<GroupPredictionsMap>(
    {},
  );
  const [knockoutPredictions, setKnockoutPredictions] =
    useState<KnockoutPredictionsMap>({});
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [predictionStatus, setPredictionStatus] =
    useState<PredictionStatus | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("groups");
  const closed =
    predictionStatus === "submitted" || predictionStatus === "locked";

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthResolved(true);

      if (!user) {
        setLoadingPrediction(false);
        setSubmitted(false);
        setPredictionStatus(null);
        setGroupPredictions({});
        setKnockoutPredictions({});
        setMsg("Inicia sesión para guardar y enviar tu porra.");
        return;
      }

      setLoadingPrediction(true);
      setMsg(null);
      try {
        const data = await getUserPrediction(user.uid);
        if (data?.groupPredictions) {
          setGroupPredictions(data.groupPredictions);
        } else {
          setGroupPredictions({});
        }
        if (
          data?.knockoutPredictions &&
          !Array.isArray(data.knockoutPredictions)
        ) {
          setKnockoutPredictions(
            data.knockoutPredictions as KnockoutPredictionsMap,
          );
        } else {
          setKnockoutPredictions({});
        }
        if (data?.status) {
          setPredictionStatus(data.status);
          setSubmitted(data.status === "submitted");
          if (data.status === "submitted" || data.status === "locked") {
            setMsg("Tu porra ya fue enviada y no se puede modificar.");
          }
        } else {
          setPredictionStatus(null);
          setSubmitted(false);
        }
      } catch (error) {
        console.error("Error loading prediction", error);
        setMsg(
          error instanceof Error
            ? error.message
            : "Error cargando la porra guardada.",
        );
      } finally {
        setLoadingPrediction(false);
      }
    });
  }, []);

  const standings = useMemo(
    () => calculateAllGroupStandings(groupPredictions),
    [groupPredictions],
  );
  const roundOf32 = useMemo(() => resolveRoundOf32(standings), [standings]);
  const groupStageComplete = useMemo(
    () => isGroupStageComplete(groupPredictions),
    [groupPredictions],
  );
  const knockoutBracket = useMemo(
    () => buildKnockoutBracket(roundOf32, knockoutPredictions),
    [roundOf32, knockoutPredictions],
  );
  const champion = useMemo(
    () => getChampion(knockoutBracket),
    [knockoutBracket],
  );
  const persistedKnockoutPredictions = useMemo(
    () => flattenKnockoutBracket(knockoutBracket),
    [knockoutBracket],
  );

  function setScore(
    matchId: string,
    side: "homeScore" | "awayScore",
    rawValue: string,
  ) {
    if (closed) {
      setMsg("Tu porra ya fue enviada y no se puede modificar.");
      return;
    }

    const value = rawValue === "" ? null : Number(rawValue);
    setGroupPredictions((prev) => ({
      ...prev,
      [matchId]: {
        homeScore: prev[matchId]?.homeScore ?? null,
        awayScore: prev[matchId]?.awayScore ?? null,
        [side]: value,
      },
    }));
  }


  function setKnockoutScore(
    matchId: string,
    side: "homeScore" | "awayScore",
    rawValue: string,
  ) {
    if (closed) {
      setMsg("Tu porra ya fue enviada y no se puede modificar.");
      return;
    }

    const currentMatch = persistedKnockoutPredictions[matchId];
    if (!currentMatch?.homeTeam || !currentMatch.awayTeam) return;

    const value = rawValue === "" ? null : Number(rawValue);
    const nextHomeScore = side === "homeScore" ? value : currentMatch.homeScore;
    const nextAwayScore = side === "awayScore" ? value : currentMatch.awayScore;
    let winnerTeamId: string | null = null;

    if (nextHomeScore !== null && nextAwayScore !== null) {
      if (nextHomeScore > nextAwayScore) winnerTeamId = currentMatch.homeTeam;
      else if (nextAwayScore > nextHomeScore) {
        winnerTeamId = currentMatch.awayTeam;
      }
      else if (
        currentMatch.winnerTeamId === currentMatch.homeTeam ||
        currentMatch.winnerTeamId === currentMatch.awayTeam
      ) {
        winnerTeamId = currentMatch.winnerTeamId;
      }
    }

    setKnockoutPredictions((prev) => ({
      ...prev,
      [matchId]: {
        matchId,
        round: currentMatch.round,
        homeTeam: currentMatch.homeTeam,
        awayTeam: currentMatch.awayTeam,
        homeScore: nextHomeScore,
        awayScore: nextAwayScore,
        winnerTeamId,
      },
    }));
  }

  function setKnockoutWinner(matchId: string, winnerTeamId: string) {
    if (closed) {
      setMsg("Tu porra ya fue enviada y no se puede modificar.");
      return;
    }

    const currentMatch = persistedKnockoutPredictions[matchId];
    if (!currentMatch?.homeTeam || !currentMatch.awayTeam) return;
    if (
      winnerTeamId !== currentMatch.homeTeam &&
      winnerTeamId !== currentMatch.awayTeam
    ) {
      winnerTeamId = "";
    }

    setKnockoutPredictions((prev) => ({
      ...prev,
      [matchId]: {
        matchId,
        round: currentMatch.round,
        homeTeam: currentMatch.homeTeam,
        awayTeam: currentMatch.awayTeam,
        homeScore: currentMatch.homeScore,
        awayScore: currentMatch.awayScore,
        winnerTeamId: winnerTeamId || null,
      },
    }));
  }

  function validateCompletePrediction(): string | null {
    if (!isGroupStageComplete(groupPredictions)) {
      return "Faltan resultados en fase de grupos";
    }

    for (const round of KNOCKOUT_ROUNDS) {
      for (const match of knockoutBracket[round.id]) {
        if (!match.homeTeam || !match.awayTeam) {
          return `Faltan clasificados en ${VALIDATION_ROUND_LABELS[round.id]}`;
        }
        if (match.homeScore === null || match.awayScore === null) {
          return `Faltan resultados en ${VALIDATION_ROUND_LABELS[round.id]}`;
        }
        if (
          match.homeScore === match.awayScore &&
          !match.winnerTeamId
        ) {
          return `Selecciona el clasificado del partido empatado en ${VALIDATION_ROUND_LABELS[round.id]}`;
        }
        if (!match.winnerTeamId) {
          return `Faltan clasificados en ${VALIDATION_ROUND_LABELS[round.id]}`;
        }
      }
    }

    if (!champion) {
      return "La final debe tener campeón";
    }

    return null;
  }

  async function handleSaveDraft() {
    if (!currentUser) {
      setMsg("Debes iniciar sesión para guardar tu porra.");
      return;
    }

    if (predictionStatus === "submitted" || predictionStatus === "locked") {
      setMsg("Tu porra ya fue enviada y no se puede modificar.");
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
          knockoutPredictions: persistedKnockoutPredictions,
          champion,
          calculatedSnapshot: {
            standings,
            roundOf32,
            knockoutBracket,
          },
        },
      });
      setPredictionStatus("draft");
      setSubmitted(false);
      setMsg("Porra guardada correctamente.");
    } catch (error) {
      console.error("Error saving prediction draft", error);
      setMsg(
        error instanceof Error ? error.message : "Error guardando la porra.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!currentUser) {
      setMsg("Debes iniciar sesión para enviar tu porra.");
      return;
    }

    if (predictionStatus === "submitted" || predictionStatus === "locked") {
      setMsg("Tu porra ya fue enviada y no se puede volver a enviar.");
      return;
    }

    const validationError = validateCompletePrediction();
    if (validationError) {
      setMsg(validationError);
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
          knockoutPredictions: persistedKnockoutPredictions,
          champion,
          calculatedSnapshot: {
            standings,
            roundOf32,
            knockoutBracket,
            scoringKnockoutPredictions:
              toScoringKnockoutPredictions(knockoutBracket),
          },
        },
      });
      setPredictionStatus("submitted");
      setSubmitted(true);
      setMsg("Porra enviada correctamente. Ya no se puede modificar.");
    } catch (error) {
      console.error("Error submitting prediction", error);
      setMsg(
        error instanceof Error ? error.message : "Error enviando la porra.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-10 lg:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Arrancan tus 90 minutos.
        </h1>
        <p className="mt-2 text-wc-muted">{MICROCOPY.predictionsStart}</p>

        <div className="wc-card mt-6 p-4">
          {!authResolved && (
            <p className="text-sm text-wc-muted">Comprobando sesión...</p>
          )}
          {authResolved && !currentUser && (
            <div className="space-y-3">
              <p className="text-wc-accentSoft">
                Debes iniciar sesión para guardar tu porra.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/login"
                  className="font-semibold text-wc-primary underline-offset-4 hover:underline"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="font-semibold text-wc-secondary underline-offset-4 hover:underline"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}
          {currentUser && (
            <p className="text-sm text-wc-muted">
              Usuario: {currentUser.email}
            </p>
          )}
          {predictionStatus && (
            <p className="text-sm text-wc-muted">
              Estado:{" "}
              {predictionStatus === "submitted"
                ? "enviada"
                : predictionStatus === "draft"
                  ? "borrador"
                  : "bloqueada"}
            </p>
          )}
          {closed && (
            <p className="text-sm font-medium text-wc-gold">
              Tu porra ya fue enviada y no se puede modificar.
            </p>
          )}
          {loadingPrediction && (
            <p className="text-sm text-wc-muted">Cargando porra guardada...</p>
          )}
        </div>

        <StageSelector activeStage={activeStage} onChange={setActiveStage} />

        {activeStage === "groups" && (
          <section className="wc-card mt-8 p-4 sm:p-6" role="tabpanel">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Fase de grupos
                </h2>
                <p className="mt-1 text-sm text-wc-muted">
                  Introduce resultados y revisa la clasificación automática
                  grupo a grupo.
                </p>
              </div>
              <span className="wc-badge">Clasificación automática</span>
            </div>
            <div className="space-y-8">
              {GROUP_KEYS.map((groupKey) => (
                <GroupSection
                  key={groupKey}
                  groupKey={groupKey}
                  matches={WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.filter(
                    (m) => m.group === groupKey,
                  )}
                  standings={standings[groupKey]}
                  predictions={groupPredictions}
                  onSetScore={setScore}
                  closed={closed}
                />
              ))}
            </div>
          </section>
        )}

        {KNOCKOUT_ROUNDS.map((round) =>
          activeStage === round.id ? (
            <KnockoutRoundSection
              key={round.id}
              round={round.id}
              matches={knockoutBracket[round.id]}
              groupStageComplete={groupStageComplete}
              champion={champion}
              closed={closed}
              onSetScore={setKnockoutScore}
              onSetWinner={setKnockoutWinner}
            />
          ) : null,
        )}

        <section className="wc-card mt-8 p-4 sm:p-6">
          <h2 className="mb-4 text-2xl font-bold">Acciones clave</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={
                !currentUser ||
                saving ||
                submitting ||
                closed ||
                loadingPrediction
              }
              onClick={handleSaveDraft}
              className="wc-btn-secondary w-full sm:w-auto"
            >
              {saving ? "Guardando..." : "Guardar mi porra"}
            </button>
            <button
              type="button"
              disabled={
                !currentUser ||
                saving ||
                submitting ||
                closed ||
                loadingPrediction
              }
              onClick={handleSubmit}
              className="wc-btn-primary w-full sm:w-auto"
            >
              {submitting ? "Enviando..." : "Enviar porra definitiva"}
            </button>
          </div>
          {!groupStageComplete && (
            <p className="mt-3 text-sm text-wc-accentSoft">
              {MICROCOPY.completeGroups}
            </p>
          )}
          {submitted && (
            <p className="mt-3 text-sm font-medium text-wc-gold">
              {MICROCOPY.champion}
            </p>
          )}
          {!currentUser && authResolved && (
            <p className="mt-3 text-sm text-wc-muted">
              Para guardar o enviar,{" "}
              <Link
                href="/login"
                className="font-semibold text-wc-primary underline-offset-4 hover:underline"
              >
                inicia sesión
              </Link>{" "}
              o{" "}
              <Link
                href="/registro"
                className="font-semibold text-wc-secondary underline-offset-4 hover:underline"
              >
                regístrate
              </Link>
              .
            </p>
          )}
          {msg && <p className="mt-3 text-sm text-wc-muted">{msg}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}
