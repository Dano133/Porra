"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamLabel from "@/components/TeamLabel";
import { MICROCOPY } from "@/lib/microcopy";
import { loginWithGoogle } from "@/lib/firebase/auth";
import { WORLD_CUP_2026_PLAYER_GROUPS } from "@/lib/worldCupPlayers";
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
  buildQualifiedTeams,
  getBestThirdPlacedTeams,
  getThirdPlacedTeams,
} from "@/lib/world-cup/best-third";
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
import {
  validateBestThirdPlacedTeams,
  validateKnockoutBracket,
  validatePredictionIntegrity,
  validateQualifiedTeamsFromStandings,
  validateRoundOf32,
  validateScoringKnockoutPredictions,
  validateTournamentStaticData,
} from "@/lib/world-cup/validation";
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

const STAGE_ORDER = STAGES.map((stage) => stage.id) as StageId[];
const NEXT_STAGE_LABELS: Partial<Record<StageId, string>> = {
  groups: "Continuar a dieciseisavos",
  round32: "Continuar a octavos",
  round16: "Continuar a cuartos",
  quarterFinals: "Continuar a semifinales",
  semiFinals: "Continuar a la final",
  final: "Finalizar predicción",
};

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
  canAccessStage,
}: {
  activeStage: StageId;
  onChange: (stage: StageId) => void;
  canAccessStage: (stage: StageId) => boolean;
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
          const isDisabled = !canAccessStage(stage.id);
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(stage.id)}
              disabled={isDisabled}
              className={`group min-h-20 rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-wc-primary/60 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 ${
                isActive
                  ? "border-wc-gold bg-wc-gold/15 shadow-lg shadow-wc-gold/10"
                  : "border-wc-border bg-wc-background/75 hover:border-wc-primary/70 hover:bg-wc-primary/10"
              }`}
              title={isDisabled ? "Completa la fase anterior para desbloquear" : undefined}
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
  pichichi,
  closed,
  onSetScore,
  onSetWinner,
  onSetPichichi,
}: {
  round: KnockoutRoundId;
  matches: KnockoutMatchView[];
  groupStageComplete: boolean;
  champion: string | null;
  pichichi: string;
  closed: boolean;
  onSetScore: (
    matchId: string,
    side: "homeScore" | "awayScore",
    value: string,
  ) => void;
  onSetWinner: (matchId: string, winnerTeamId: string) => void;
  onSetPichichi: (pichichi: string) => void;
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
        <div className="mt-5 space-y-4 rounded-2xl border border-wc-gold/60 bg-wc-gold/10 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-wc-gold">
              Campeón
            </p>
            <div className="mt-2 text-lg font-bold">
              <TeamLabel team={champion} fallbackLabel="Aún sin definir" />
            </div>
          </div>

          <label className="block border-t border-wc-gold/30 pt-4">
            <span className="text-xs uppercase tracking-[0.2em] text-wc-gold">
              Pichichi del Mundial
            </span>
            <span className="mt-1 block text-sm text-wc-muted">
              Elige quién crees que será el máximo goleador del torneo
            </span>
            <select
              className="wc-select mt-3"
              value={pichichi}
              onChange={(event) => onSetPichichi(event.target.value)}
              disabled={closed}
            >
              <option value="">Selecciona un jugador</option>
              {WORLD_CUP_2026_PLAYER_GROUPS.map((group) => (
                <optgroup key={group.country} label={group.country}>
                  {group.players.map((player) => (
                    <option key={player.id} value={player.name}>
                      {player.name} · {player.country}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="mt-2 block text-xs text-wc-muted">
              Lista provisional editable hasta que se publiquen las
              convocatorias oficiales.
            </span>
          </label>
        </div>
      )}
    </section>
  );
}

function ContinuePhaseButton({
  activeStage,
  disabled,
  message,
  onContinue,
}: {
  activeStage: StageId;
  disabled: boolean;
  message: string | null;
  onContinue: () => void;
}) {
  const label = NEXT_STAGE_LABELS[activeStage];
  if (!label) return null;

  return (
    <div className="mt-6 rounded-2xl border border-wc-border bg-wc-background/80 p-4 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-wc-text">Avance de fase</p>
          <p className="mt-1 text-sm text-wc-muted">
            {message ?? "La fase está completa y validada. Puedes continuar."}
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className="wc-btn-primary w-full shrink-0 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {label}
        </button>
      </div>
    </div>
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
  const [pichichi, setPichichi] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
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
        setPichichi("");
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
        setPichichi(data?.pichichi ?? "");
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

  const staticDataValidation = useMemo(() => validateTournamentStaticData(), []);
  const standings = useMemo(
    () => calculateAllGroupStandings(groupPredictions),
    [groupPredictions],
  );
  const groupStageComplete = useMemo(
    () => isGroupStageComplete(groupPredictions),
    [groupPredictions],
  );
  const thirdPlacedTeams = useMemo(() => getThirdPlacedTeams(standings), [standings]);
  const bestThirdPlacedTeams = useMemo(
    () => getBestThirdPlacedTeams(standings),
    [standings],
  );
  const qualifiedTeams = useMemo(() => buildQualifiedTeams(standings), [standings]);
  const bestThirdValidation = useMemo(
    () => validateBestThirdPlacedTeams(standings),
    [standings],
  );
  const qualifiedTeamsValidation = useMemo(
    () => validateQualifiedTeamsFromStandings(standings),
    [standings],
  );
  const roundOf32 = useMemo(
    () => (groupStageComplete ? resolveRoundOf32(standings) : []),
    [groupStageComplete, standings],
  );
  const roundOf32Validation = useMemo(
    () => (groupStageComplete ? validateRoundOf32(roundOf32) : { valid: false, errors: [] }),
    [groupStageComplete, roundOf32],
  );
  const blockingDataErrors = useMemo(
    () => [
      ...staticDataValidation.errors,
      ...(groupStageComplete ? bestThirdValidation.errors : []),
      ...(groupStageComplete ? qualifiedTeamsValidation.errors : []),
      ...(groupStageComplete ? roundOf32Validation.errors : []),
    ],
    [
      staticDataValidation.errors,
      groupStageComplete,
      bestThirdValidation.errors,
      qualifiedTeamsValidation.errors,
      roundOf32Validation.errors,
    ],
  );
  const hasBlockingDataError = blockingDataErrors.length > 0;
  const knockoutBracket = useMemo(
    () =>
      !groupStageComplete || hasBlockingDataError
        ? buildKnockoutBracket([], {})
        : buildKnockoutBracket(roundOf32, knockoutPredictions),
    [groupStageComplete, hasBlockingDataError, roundOf32, knockoutPredictions],
  );
  const bracketValidation = useMemo(
    () => validateKnockoutBracket(knockoutBracket),
    [knockoutBracket],
  );
  const champion = useMemo(
    () => getChampion(knockoutBracket),
    [knockoutBracket],
  );
  const persistedKnockoutPredictions = useMemo(
    () => flattenKnockoutBracket(knockoutBracket),
    [knockoutBracket],
  );

  useEffect(() => {
    if (!groupStageComplete) return;

    console.info("Tabla global de terceros", thirdPlacedTeams);
    console.info("Mejores 8 terceros seleccionados", bestThirdPlacedTeams);
    console.info("Lista final de 32 clasificados", qualifiedTeams);

    const duplicateQualified = qualifiedTeams
      .map((team) => team.teamId)
      .filter((teamId, index, teamIds) => teamIds.indexOf(teamId) !== index);

    if (duplicateQualified.length > 0 || hasBlockingDataError) {
      console.error("Duplicados o errores detectados en clasificados", {
        duplicateQualified: [...new Set(duplicateQualified)],
        blockingDataErrors,
      });
    }
  }, [
    bestThirdPlacedTeams,
    blockingDataErrors,
    groupStageComplete,
    hasBlockingDataError,
    qualifiedTeams,
    thirdPlacedTeams,
  ]);

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
      } else if (
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

  function validateKnockoutRoundComplete(round: KnockoutRoundId): string | null {
    if (!groupStageComplete) {
      return "Completa la fase de grupos antes de jugar eliminatorias.";
    }

    if (hasBlockingDataError) {
      return blockingDataErrors[0] ?? "Hay duplicados o errores en los clasificados.";
    }

    if (round === "round32" && !bracketValidation.valid) {
      return bracketValidation.errors[0] ?? "R32 contiene duplicados.";
    }

    for (const match of knockoutBracket[round]) {
      if (!match.homeTeam || !match.awayTeam) {
        return `Faltan clasificados en ${VALIDATION_ROUND_LABELS[round]}.`;
      }
      if (match.homeScore === null || match.awayScore === null) {
        return `Faltan marcadores en ${VALIDATION_ROUND_LABELS[round]}.`;
      }
      if (match.homeScore === match.awayScore && !match.winnerTeamId) {
        return `Selecciona el clasificado por penaltis en todos los empates de ${VALIDATION_ROUND_LABELS[round]}.`;
      }
      if (!match.winnerTeamId) {
        return `Faltan clasificados en ${VALIDATION_ROUND_LABELS[round]}.`;
      }
    }

    if (round === "final") {
      if (!champion) return "La final debe tener campeón definido.";
      if (!pichichi) return "Selecciona el Pichichi antes de finalizar.";
    }

    return null;
  }

  function validateStage(stage: StageId): string | null {
    if (stage === "groups") {
      if (!groupStageComplete) return "Faltan marcadores en fase de grupos.";
      if (hasBlockingDataError) {
        return blockingDataErrors[0] ?? "La clasificación contiene duplicados o errores.";
      }
      if (!bestThirdValidation.valid) return bestThirdValidation.errors[0] ?? "Mejores terceros inválidos.";
      if (!qualifiedTeamsValidation.valid) {
        return qualifiedTeamsValidation.errors[0] ?? "La lista de 32 clasificados no es válida.";
      }
      if (!roundOf32Validation.valid) return roundOf32Validation.errors[0] ?? "R32 no es válida.";
      return null;
    }

    return validateKnockoutRoundComplete(stage);
  }

  function canAccessStage(stage: StageId): boolean {
    const stageIndex = STAGE_ORDER.indexOf(stage);
    if (stageIndex <= 0) return true;

    return STAGE_ORDER.slice(0, stageIndex).every(
      (previousStage) => validateStage(previousStage) === null,
    );
  }

  function handleStageChange(stage: StageId) {
    if (!canAccessStage(stage)) {
      const stageIndex = STAGE_ORDER.indexOf(stage);
      const blockingStage = STAGE_ORDER.slice(0, stageIndex).find(
        (previousStage) => validateStage(previousStage) !== null,
      );
      setMsg(
        blockingStage
          ? validateStage(blockingStage)
          : "Completa la fase anterior para continuar.",
      );
      return;
    }

    setActiveStage(stage);
    setMsg(null);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function handleContinueStage() {
    const validationError = validateStage(activeStage);
    if (validationError) {
      setMsg(validationError);
      return;
    }

    const currentIndex = STAGE_ORDER.indexOf(activeStage);
    const nextStage = STAGE_ORDER[currentIndex + 1];

    if (!nextStage) {
      setMsg("La predicción está completa. Puedes guardar o enviar tu porra.");
      return;
    }

    setActiveStage(nextStage);
    setMsg(null);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function getIntegrityValidationError(): string | null {
    if (!groupStageComplete) {
      if (staticDataValidation.valid) return null;
      console.error(
        "Predicción bloqueada por datos estáticos inválidos",
        staticDataValidation.errors,
      );
      return staticDataValidation.errors[0] ?? "La porra contiene datos duplicados o inválidos.";
    }

    const validation = validatePredictionIntegrity({
      standings,
      roundOf32,
      bracket: knockoutBracket,
      pichichi: pichichi || null,
    });

    if (validation.valid) return null;
    console.error("Predicción bloqueada por integridad inválida", validation.errors);
    return validation.errors[0] ?? "La porra contiene datos duplicados o inválidos.";
  }

  function validateCompletePrediction(): string | null {
    const integrityError = getIntegrityValidationError();
    if (integrityError) return integrityError;

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
        if (match.homeScore === match.awayScore && !match.winnerTeamId) {
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

    if (!pichichi) {
      return "Selecciona el Pichichi del Mundial";
    }

    return null;
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setMsg(null);
    try {
      await loginWithGoogle();
      setMsg("Sesión iniciada con Google. Ya puedes guardar tu porra.");
    } catch (error) {
      console.error("Error signing in with Google", error);
      setMsg(
        error instanceof Error
          ? error.message
          : "Error iniciando sesión con Google.",
      );
    } finally {
      setGoogleLoading(false);
    }
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

    const integrityError = getIntegrityValidationError();
    if (integrityError) {
      setMsg(integrityError);
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
          pichichi: pichichi || null,
          calculatedSnapshot: {
            standings,
            roundOf32,
            knockoutBracket,
            pichichi: pichichi || null,
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
    const scoringKnockoutPredictions = toScoringKnockoutPredictions(knockoutBracket);
    const scoringValidation = validateScoringKnockoutPredictions(
      Object.values(persistedKnockoutPredictions),
    );
    if (!scoringValidation.valid) {
      console.error("Predicciones knockout inválidas para scoring", scoringValidation.errors);
      setMsg(scoringValidation.errors[0] ?? "Hay duplicados en eliminatorias.");
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
          pichichi: pichichi || null,
          calculatedSnapshot: {
            standings,
            roundOf32,
            knockoutBracket,
            scoringKnockoutPredictions,
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
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-wc-accentSoft">
                  Debes iniciar sesión para guardar tu porra.
                </p>
                <p className="mt-1 text-sm text-wc-muted">
                  La opción más rápida es continuar con Google en un clic.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="wc-btn-primary w-full sm:w-auto"
              >
                {googleLoading
                  ? "Conectando con Google..."
                  : "Continuar con Google"}
              </button>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/login"
                  className="font-semibold text-wc-primary underline-offset-4 hover:underline"
                >
                  Iniciar sesión con email
                </Link>
                <Link
                  href="/registro"
                  className="font-semibold text-wc-secondary underline-offset-4 hover:underline"
                >
                  Crear cuenta con email
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

        {hasBlockingDataError && (
          <div className="mt-6 rounded-2xl border border-wc-accent/60 bg-wc-accent/10 p-4 text-sm text-wc-accentSoft">
            <p className="font-semibold">
              No se puede construir la porra: hay datos duplicados o inválidos.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {blockingDataErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <StageSelector
          activeStage={activeStage}
          onChange={handleStageChange}
          canAccessStage={canAccessStage}
        />

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
            <ContinuePhaseButton
              activeStage="groups"
              disabled={validateStage("groups") !== null}
              message={validateStage("groups")}
              onContinue={handleContinueStage}
            />
          </section>
        )}

        {KNOCKOUT_ROUNDS.map((round) =>
          activeStage === round.id ? (
            <div key={round.id}>
              <KnockoutRoundSection
                round={round.id}
                matches={knockoutBracket[round.id]}
                groupStageComplete={groupStageComplete}
                champion={champion}
                closed={closed}
                onSetScore={setKnockoutScore}
                onSetWinner={setKnockoutWinner}
                pichichi={pichichi}
                onSetPichichi={setPichichi}
              />
              <ContinuePhaseButton
                activeStage={round.id}
                disabled={validateStage(round.id) !== null}
                message={validateStage(round.id)}
                onContinue={handleContinueStage}
              />
            </div>
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
