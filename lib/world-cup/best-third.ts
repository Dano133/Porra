import { WORLD_CUP_2026_SOURCE_OF_TRUTH, type GroupKey } from './source-of-truth';
import type { GroupStandingsMap, GroupTableRow } from './standings';

export interface ThirdPlacedTeam extends GroupTableRow {
  rankLabel: string;
  teamId: string;
}

export interface QualifiedTeam extends GroupTableRow {
  teamId: string;
  source: 'group-winner' | 'group-runner-up' | 'best-third';
}

const ORDERED_GROUP_KEYS = Object.keys(
  WORLD_CUP_2026_SOURCE_OF_TRUTH.groups,
) as GroupKey[];

function getTeamId(row: Pick<GroupTableRow, 'team'>): string {
  return row.team;
}

function compareThirdPlacedTeams(a: ThirdPlacedTeam, b: ThirdPlacedTeam): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  if (a.group !== b.group) return a.group.localeCompare(b.group, 'es');
  return a.teamId.localeCompare(b.teamId, 'es');
}

export function getThirdPlacedTeams(
  standings: GroupStandingsMap,
): ThirdPlacedTeam[] {
  const thirds = ORDERED_GROUP_KEYS
    .map((group) => standings[group]?.[2])
    .filter((row): row is GroupTableRow => Boolean(row))
    .map((row) => ({
      ...row,
      teamId: getTeamId(row),
      rankLabel: `3${row.group}`,
    }));

  thirds.sort(compareThirdPlacedTeams);

  return thirds;
}

export function getBestThirdPlacedTeams(
  standings: GroupStandingsMap,
  limit: number = WORLD_CUP_2026_SOURCE_OF_TRUTH.tournament.bestThirdsAdvance,
): ThirdPlacedTeam[] {
  const seen = new Set<string>();

  return getThirdPlacedTeams(standings)
    .filter((team) => {
      if (seen.has(team.teamId)) return false;
      seen.add(team.teamId);
      return true;
    })
    .slice(0, limit);
}

export function buildQualifiedTeams(standings: GroupStandingsMap): QualifiedTeam[] {
  const directQualified: QualifiedTeam[] = ORDERED_GROUP_KEYS.flatMap((group) => {
    const rows = standings[group] ?? [];
    return rows.slice(0, 2).map((row, index): QualifiedTeam => ({
      ...row,
      teamId: getTeamId(row),
      source: index === 0 ? 'group-winner' : 'group-runner-up',
    }));
  });

  const bestThirds: QualifiedTeam[] = getBestThirdPlacedTeams(standings).map(
    (row): QualifiedTeam => ({
      ...row,
      source: 'best-third',
    }),
  );

  return [...directQualified, ...bestThirds];
}

export function getBestThirdGroupsKey(
  standings: GroupStandingsMap,
  limit: number = 8,
): string {
  return getBestThirdPlacedTeams(standings, limit)
    .map((team) => team.group)
    .sort()
    .join('');
}