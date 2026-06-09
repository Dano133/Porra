import type { ResolvedRoundOf32Match } from './bracket-resolver';

export type KnockoutRoundId =
  | 'round32'
  | 'round16'
  | 'quarterFinals'
  | 'semiFinals'
  | 'final';

export type KnockoutStageForScoring =
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'final';

export interface KnockoutMatchPrediction {
  matchId: string;
  round: KnockoutRoundId;
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
}

export type KnockoutPredictionsMap = Record<string, KnockoutMatchPrediction>;

export interface KnockoutMatchView extends KnockoutMatchPrediction {
  homeSlot: string;
  awaySlot: string;
}

export type KnockoutBracketView = Record<KnockoutRoundId, KnockoutMatchView[]>;

export const KNOCKOUT_ROUNDS: Array<{
  id: KnockoutRoundId;
  label: string;
  shortLabel: string;
}> = [
  { id: 'round32', label: 'Dieciseisavos', shortLabel: 'R32' },
  { id: 'round16', label: 'Octavos', shortLabel: 'R16' },
  { id: 'quarterFinals', label: 'Cuartos', shortLabel: 'QF' },
  { id: 'semiFinals', label: 'Semifinales', shortLabel: 'SF' },
  { id: 'final', label: 'Final', shortLabel: 'Final' },
];

export const ROUND_TO_SCORING_STAGE: Partial<
  Record<KnockoutRoundId, KnockoutStageForScoring>
> = {
  round16: 'round_of_16',
  quarterFinals: 'quarter_final',
  semiFinals: 'semi_final',
  final: 'final',
};

function getWinner(match: KnockoutMatchPrediction | undefined) {
  if (!match?.homeTeam || !match.awayTeam) return null;
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore > match.awayScore) return match.homeTeam;
  if (match.awayScore > match.homeScore) return match.awayTeam;
  return match.winnerTeamId === match.homeTeam ||
    match.winnerTeamId === match.awayTeam
    ? match.winnerTeamId
    : null;
}

function normalizePrediction(
  matchId: string,
  round: KnockoutRoundId,
  homeTeam: string | null,
  awayTeam: string | null,
  homeSlot: string,
  awaySlot: string,
  saved?: Partial<KnockoutMatchPrediction> | null,
): KnockoutMatchView {
  const teamsStillMatch =
    saved?.homeTeam === homeTeam && saved?.awayTeam === awayTeam;
  const homeScore =
    teamsStillMatch && typeof saved?.homeScore === 'number'
      ? saved.homeScore
      : null;
  const awayScore =
    teamsStillMatch && typeof saved?.awayScore === 'number'
      ? saved.awayScore
      : null;
  let winnerTeamId: string | null = null;

  if (homeTeam && awayTeam && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winnerTeamId = homeTeam;
    else if (awayScore > homeScore) winnerTeamId = awayTeam;
    else if (
      saved?.winnerTeamId === homeTeam ||
      saved?.winnerTeamId === awayTeam
    ) {
      winnerTeamId = saved.winnerTeamId;
    }
  }

  return {
    matchId,
    round,
    homeTeam,
    awayTeam,
    homeSlot,
    awaySlot,
    homeScore,
    awayScore,
    winnerTeamId,
  };
}

function buildNextRound(
  previous: KnockoutMatchView[],
  round: KnockoutRoundId,
  prefix: string,
  saved: KnockoutPredictionsMap,
): KnockoutMatchView[] {
  const next: KnockoutMatchView[] = [];
  for (let index = 0; index < previous.length; index += 2) {
    const matchNumber = index / 2 + 1;
    const matchId = `${prefix}-${matchNumber}`;
    const homeSource = previous[index];
    const awaySource = previous[index + 1];
    next.push(
      normalizePrediction(
        matchId,
        round,
        getWinner(homeSource),
        getWinner(awaySource),
        `Ganador ${homeSource.matchId}`,
        `Ganador ${awaySource.matchId}`,
        saved[matchId],
      ),
    );
  }
  return next;
}

export function buildKnockoutBracket(
  roundOf32: ResolvedRoundOf32Match[],
  saved: KnockoutPredictionsMap = {},
): KnockoutBracketView {
  const round32 = roundOf32.map((slot) =>
    normalizePrediction(
      slot.id,
      'round32',
      slot.homeTeam,
      slot.awayTeam,
      slot.homeRef,
      slot.awayRef,
      saved[slot.id],
    ),
  );
  const round16 = buildNextRound(round32, 'round16', 'R16', saved);
  const quarterFinals = buildNextRound(
    round16,
    'quarterFinals',
    'QF',
    saved,
  );
  const semiFinals = buildNextRound(
    quarterFinals,
    'semiFinals',
    'SF',
    saved,
  );
  const final = buildNextRound(semiFinals, 'final', 'FINAL', saved);

  return { round32, round16, quarterFinals, semiFinals, final };
}

export function flattenKnockoutBracket(
  bracket: KnockoutBracketView,
): KnockoutPredictionsMap {
  return Object.fromEntries(
    KNOCKOUT_ROUNDS.flatMap((round) => bracket[round.id]).map((match) => [
      match.matchId,
      {
        matchId: match.matchId,
        round: match.round,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winnerTeamId: match.winnerTeamId,
      },
    ]),
  );
}

export function getChampion(bracket: KnockoutBracketView): string | null {
  return getWinner(bracket.final[0]);
}

export function toScoringKnockoutPredictions(bracket: KnockoutBracketView) {
  return KNOCKOUT_ROUNDS.flatMap((round) =>
    bracket[round.id]
      .filter(
        (match) =>
          ROUND_TO_SCORING_STAGE[match.round] &&
          match.homeTeam &&
          match.awayTeam &&
          match.homeScore !== null &&
          match.awayScore !== null &&
          match.winnerTeamId,
      )
      .map((match) => ({
        bracketId: match.matchId,
        stage: ROUND_TO_SCORING_STAGE[match.round]!,
        homeTeam: match.homeTeam!,
        awayTeam: match.awayTeam!,
        homeScore: match.homeScore!,
        awayScore: match.awayScore!,
        winnerTeamId: match.winnerTeamId!,
      })),
  );
}
