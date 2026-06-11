import { WORLD_CUP_2026_PLAYERS } from '@/lib/worldCupPlayers';
import { buildQualifiedTeams, getBestThirdPlacedTeams, getThirdPlacedTeams } from './best-third';
import type { ResolvedRoundOf32Match } from './bracket-resolver';
import type { KnockoutBracketView, KnockoutMatchPrediction } from './knockout';
import type { GroupKey, TournamentGroupMatch } from './source-of-truth';
import { WORLD_CUP_2026_SOURCE_OF_TRUTH } from './source-of-truth';
import type { GroupStandingsMap } from './standings';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}

export function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function teamPairKey(homeTeam: string, awayTeam: string): string {
  return [homeTeam, awayTeam].sort((a, b) => a.localeCompare(b, 'es')).join('::');
}

export function validateUniqueTeamsInGroups(
  groups = WORLD_CUP_2026_SOURCE_OF_TRUTH.groups,
): ValidationResult {
  const errors: string[] = [];

  for (const [group, teams] of Object.entries(groups) as [GroupKey, readonly string[]][]) {
    const duplicates = duplicateValues([...teams]);
    if (duplicates.length > 0) {
      errors.push(`Grupo ${group} contiene equipos duplicados: ${duplicates.join(', ')}`);
    }

    if (teams.length !== WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.teamsPerGroup) {
      errors.push(
        `Grupo ${group} debe tener ${WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.teamsPerGroup} equipos y tiene ${teams.length}`,
      );
    }
  }

  return fail(errors);
}

export function validateUniqueGroupMatches(
  matches: readonly TournamentGroupMatch[] = WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches,
): ValidationResult {
  const errors: string[] = [];
  const matchIds = new Set<string>();
  const pairsByGroup = new Map<GroupKey, Set<string>>();

  for (const match of matches) {
    if (matchIds.has(match.id)) {
      errors.push(`Partido de grupos duplicado por id: ${match.id}`);
    }
    matchIds.add(match.id);

    if (match.homeTeam === match.awayTeam) {
      errors.push(`Partido ${match.id} enfrenta al mismo equipo: ${match.homeTeam}`);
    }

    const groupTeams = new Set<string>(WORLD_CUP_2026_SOURCE_OF_TRUTH.groups[match.group]);
    if (!groupTeams.has(match.homeTeam) || !groupTeams.has(match.awayTeam)) {
      errors.push(
        `Partido ${match.id} contiene equipos que no pertenecen al grupo ${match.group}`,
      );
    }

    const pairKey = teamPairKey(match.homeTeam, match.awayTeam);
    const groupPairs = pairsByGroup.get(match.group) ?? new Set<string>();
    if (groupPairs.has(pairKey)) {
      errors.push(
        `Pareja repetida en grupo ${match.group}: ${match.homeTeam} vs ${match.awayTeam}`,
      );
    }
    groupPairs.add(pairKey);
    pairsByGroup.set(match.group, groupPairs);
  }

  for (const group of Object.keys(WORLD_CUP_2026_SOURCE_OF_TRUTH.groups) as GroupKey[]) {
    const pairCount = pairsByGroup.get(group)?.size ?? 0;
    if (pairCount !== 6) {
      errors.push(`Grupo ${group} debe tener 6 cruces únicos y tiene ${pairCount}`);
    }
  }

  return fail(errors);
}

export function validateUniqueQualifiedTeams(
  qualified: Array<string | null | undefined>,
  expectedCount = 32,
): ValidationResult {
  const teams = qualified.filter((team): team is string => Boolean(team));
  const duplicates = duplicateValues(teams);
  const errors: string[] = [];

  if (teams.length !== expectedCount) {
    errors.push(`R32 debe tener ${expectedCount} clasificados resueltos y tiene ${teams.length}`);
  }

  if (duplicates.length > 0) {
    errors.push(`R32 contiene equipos duplicados: ${duplicates.join(', ')}`);
  }

  return fail(errors);
}


export function validateBestThirdPlacedTeams(standings: GroupStandingsMap): ValidationResult {
  const thirds = getThirdPlacedTeams(standings);
  const bestThirds = getBestThirdPlacedTeams(standings);
  const errors: string[] = [];
  const expectedThirds = WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.groupCount;
  const expectedBestThirds = WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.bestThirdsAdvance;
  const thirdTeamIds = thirds.map((team) => team.teamId);
  const bestThirdTeamIds = bestThirds.map((team) => team.teamId);

  if (thirds.length !== expectedThirds) {
    errors.push(`La tabla global de terceros debe tener ${expectedThirds} equipos y tiene ${thirds.length}`);
  }

  const thirdDuplicates = duplicateValues(thirdTeamIds);
  if (thirdDuplicates.length > 0) {
    errors.push(`La tabla global de terceros contiene equipos duplicados: ${thirdDuplicates.join(', ')}`);
  }

  if (bestThirds.length !== expectedBestThirds) {
    errors.push(`Deben clasificarse ${expectedBestThirds} mejores terceros y hay ${bestThirds.length}`);
  }

  const bestThirdDuplicates = duplicateValues(bestThirdTeamIds);
  if (bestThirdDuplicates.length > 0) {
    errors.push(`Mejores terceros duplicados: ${bestThirdDuplicates.join(', ')}`);
  }

  return fail(errors);
}

export function validateQualifiedTeamsFromStandings(standings: GroupStandingsMap): ValidationResult {
  const qualified = buildQualifiedTeams(standings);
  return validateUniqueQualifiedTeams(
    qualified.map((team) => team.teamId),
    32,
  );
}

export function validateRoundOf32(roundOf32: readonly ResolvedRoundOf32Match[]): ValidationResult {
  return validateUniqueQualifiedTeams(
    roundOf32.flatMap((match) => [match.homeTeam, match.awayTeam]),
    32,
  );
}

export function validateKnockoutBracket(bracket: KnockoutBracketView): ValidationResult {
  const round32Validation = validateUniqueQualifiedTeams(
    bracket.round32.flatMap((match) => [match.homeTeam, match.awayTeam]),
    32,
  );

  if (!round32Validation.valid) return round32Validation;

  const errors: string[] = [];
  for (const [round, matches] of Object.entries(bracket)) {
    const teamAppearances = matches.flatMap((match) => [match.homeTeam, match.awayTeam])
      .filter((team): team is string => Boolean(team));
    const duplicates = duplicateValues(teamAppearances);
    if (duplicates.length > 0) {
      errors.push(`${round} contiene equipos duplicados: ${duplicates.join(', ')}`);
    }
  }

  return fail(errors);
}

export function validatePichichiPlayers(
  selectedPlayerName?: string | null,
): ValidationResult {
  const errors: string[] = [];
  const validTeams = new Set(Object.values(WORLD_CUP_2026_SOURCE_OF_TRUTH.groups).flat());
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const player of WORLD_CUP_2026_PLAYERS) {
    if (!player.id || !player.name || !player.country) {
      errors.push(`Jugador Pichichi incompleto: ${JSON.stringify(player)}`);
    }

    if (ids.has(player.id)) errors.push(`Jugador Pichichi duplicado por id: ${player.id}`);
    ids.add(player.id);

    const playerKey = `${player.name}::${player.country}`;
    if (names.has(playerKey)) {
      errors.push(`Jugador Pichichi duplicado: ${player.name} (${player.country})`);
    }
    names.add(playerKey);

    if (!validTeams.has(player.country)) {
      errors.push(`Jugador Pichichi con selección no válida: ${player.name} (${player.country})`);
    }

    if (!player.countryCode) {
      errors.push(`Jugador Pichichi sin código de país: ${player.name} (${player.country})`);
    }
  }

  if (selectedPlayerName) {
    const isValidSelection = WORLD_CUP_2026_PLAYERS.some(
      (player) => player.name === selectedPlayerName,
    );
    if (!isValidSelection) {
      errors.push(`Pichichi seleccionado no válido: ${selectedPlayerName}`);
    }
  }

  return fail(errors);
}

export function validateTournamentStaticData(): ValidationResult {
  const validations = [
    validateUniqueTeamsInGroups(),
    validateUniqueGroupMatches(),
    validatePichichiPlayers(),
  ];

  return fail(validations.flatMap((validation) => validation.errors));
}

export function validatePredictionIntegrity({
  standings,
  roundOf32,
  bracket,
  pichichi,
}: {
  standings: GroupStandingsMap;
  roundOf32: readonly ResolvedRoundOf32Match[];
  bracket: KnockoutBracketView;
  pichichi?: string | null;
}): ValidationResult {
  const standingsTeams = Object.values(standings).flatMap((rows) => rows.map((row) => row.team));

  const validations = [
    validateTournamentStaticData(),
    validateUniqueQualifiedTeams(standingsTeams, 48),
    validateBestThirdPlacedTeams(standings),
    validateQualifiedTeamsFromStandings(standings),
    validateRoundOf32(roundOf32),
    validateKnockoutBracket(bracket),
    validatePichichiPlayers(pichichi),
  ];

  return fail(validations.flatMap((validation) => validation.errors));
}

export function validateScoringKnockoutPredictions(
  predictions: readonly KnockoutMatchPrediction[],
): ValidationResult {
  const errors: string[] = [];
  const byRound = new Map<string, string[]>();

  for (const prediction of predictions) {
    if (!prediction.homeTeam || !prediction.awayTeam) continue;
    const teams = byRound.get(prediction.round) ?? [];
    teams.push(prediction.homeTeam, prediction.awayTeam);
    byRound.set(prediction.round, teams);
  }

  for (const [round, teams] of byRound.entries()) {
    const duplicates = duplicateValues(teams);
    if (duplicates.length > 0) {
      errors.push(`Predicciones de scoring con duplicados en ${round}: ${duplicates.join(', ')}`);
    }
  }

  return fail(errors);
}
