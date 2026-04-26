/**
 * Motor de puntuación de la porra del Mundial.
 *
 * Reglas (resumen):
 *  - Fase de grupos:
 *      * Acertar vencedor: 5
 *      * Acertar vencedor + resultado exacto: 15
 *      * Acertar empate: 10
 *      * Acertar empate + resultado exacto: 20
 *  - Eliminatorias (por cruce):
 *      Octavos:    10 por clasificado, 20 si además aciertas posición exacta
 *                  del cruce, +20 si aciertas también el resultado exacto.
 *      Cuartos:    40 por clasificado, +40 si cruce + resultado exacto.
 *      Semis:      60 por clasificado, +60 si cruce + resultado exacto.
 *      3º/4º:      80 por clasificado, +80 si cruce + resultado exacto.
 *      Final:     100 por clasificado, +100 si cruce + resultado exacto.
 *  - Campeón: 300.
 *
 * Notas:
 *  - El "resultado" es el del partido tras 90' o prórroga (sin penaltis).
 *  - El cálculo es idempotente: dadas las mismas entradas devuelve lo mismo.
 *  - Se ejecuta SIEMPRE en backend.
 */

import type {
  Match,
  Prediction,
  Score,
  ScoreBreakdown,
  Stage,
  KnockoutPrediction,
} from './types';

const ZERO_BREAKDOWN: ScoreBreakdown = {
  group: 0,
  round_of_16: 0,
  quarter_final: 0,
  semi_final: 0,
  third_place: 0,
  final: 0,
  champion: 0,
};

const KO_POINTS: Record<Exclude<Stage, 'group'>, { qualified: number; bracketBonus: number; exactScoreBonus: number }> = {
  round_of_16:   { qualified: 10,  bracketBonus: 10,  exactScoreBonus: 20 },
  quarter_final: { qualified: 40,  bracketBonus: 0,   exactScoreBonus: 40 },
  semi_final:    { qualified: 60,  bracketBonus: 0,   exactScoreBonus: 60 },
  third_place:   { qualified: 80,  bracketBonus: 0,   exactScoreBonus: 80 },
  final:         { qualified: 100, bracketBonus: 0,   exactScoreBonus: 100 },
};

function groupMatchPoints(p: { homeScore: number; awayScore: number }, m: Match): number {
  if (m.officialHomeScore == null || m.officialAwayScore == null) return 0;
  const realDraw = m.officialHomeScore === m.officialAwayScore;
  const predDraw = p.homeScore === p.awayScore;
  const exact = p.homeScore === m.officialHomeScore && p.awayScore === m.officialAwayScore;

  if (realDraw && predDraw) return exact ? 20 : 10;
  if (!realDraw && !predDraw) {
    const realWinner: 'home' | 'away' = m.officialHomeScore > m.officialAwayScore ? 'home' : 'away';
    const predWinner: 'home' | 'away' = p.homeScore > p.awayScore ? 'home' : 'away';
    if (realWinner === predWinner) return exact ? 15 : 5;
  }
  return 0;
}

function knockoutMatchPoints(pred: KnockoutPrediction, m: Match): number {
  const cfg = KO_POINTS[pred.stage];
  if (!cfg) return 0;
  if (m.officialHomeScore == null || m.officialAwayScore == null) return 0;

  const teams = new Set([m.homeTeam, m.awayTeam]);
  let points = 0;

  // 1) Clasificados acertados (los equipos que figuran en el cruce real)
  if (teams.has(pred.homeTeam)) points += cfg.qualified;
  if (teams.has(pred.awayTeam) && pred.awayTeam !== pred.homeTeam) points += cfg.qualified;

  // 2) Bonus por posición exacta (aplica explícitamente solo en R16 según reglas)
  const exactBracket =
    pred.homeTeam === m.homeTeam && pred.awayTeam === m.awayTeam;
  if (exactBracket && cfg.bracketBonus > 0) {
    points += cfg.bracketBonus;
  }

  // 3) Bonus por cruce + resultado exacto
  const exactScore =
    pred.homeScore === m.officialHomeScore && pred.awayScore === m.officialAwayScore;
  if (exactBracket && exactScore) {
    points += cfg.exactScoreBonus;
  }

  return points;
}

export interface ScoringResult {
  totalPoints: number;
  breakdown: ScoreBreakdown;
}

export function computeScore(prediction: Prediction, matches: Match[], realChampion: string | null): ScoringResult {
  const matchById = new Map(matches.map(m => [m.id, m]));
  const matchByBracket = new Map(
    matches.filter(m => m.bracketId).map(m => [m.bracketId as string, m])
  );

  const breakdown: ScoreBreakdown = { ...ZERO_BREAKDOWN };

  // Fase de grupos
  for (const gp of prediction.groupStagePredictions) {
    const m = matchById.get(gp.matchId);
    if (!m || m.stage !== 'group' || m.status !== 'finished') continue;
    breakdown.group += groupMatchPoints(gp, m);
  }

  // Eliminatorias
  for (const kp of prediction.knockoutPredictions) {
    const m = matchByBracket.get(kp.bracketId);
    if (!m || m.status !== 'finished') continue;
    const pts = knockoutMatchPoints(kp, m);
    breakdown[kp.stage] += pts;
  }

  // Campeón
  if (realChampion && prediction.championPrediction &&
      realChampion.toLowerCase() === prediction.championPrediction.toLowerCase()) {
    breakdown.champion = 300;
  }

  const totalPoints =
    breakdown.group +
    breakdown.round_of_16 +
    breakdown.quarter_final +
    breakdown.semi_final +
    breakdown.third_place +
    breakdown.final +
    breakdown.champion;

  return { totalPoints, breakdown };
}

export function buildScore(participantId: string, tournamentId: string, result: ScoringResult): Score {
  return {
    id: `${participantId}_${tournamentId}`,
    participantId,
    tournamentId,
    totalPoints: result.totalPoints,
    breakdown: result.breakdown,
    updatedAt: Date.now(),
  };
}
