import type { GroupKey } from './source-of-truth';
import type { GroupStandingsMap, GroupTableRow } from './standings';

export interface ThirdPlacedTeam extends GroupTableRow {
  rankLabel: string;
}

export function getThirdPlacedTeams(
  standings: GroupStandingsMap
): ThirdPlacedTeam[] {
  const groups = Object.keys(standings) as GroupKey[];

  const thirds = groups
    .map((group) => standings[group][2])
    .filter(Boolean)
    .map((row) => ({
      ...row,
      rankLabel: `3${row.group}`,
    }));

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team, 'es');
  });

  return thirds;
}

export function getBestThirdPlacedTeams(
  standings: GroupStandingsMap,
  limit = 8
): ThirdPlacedTeam[] {
  return getThirdPlacedTeams(standings).slice(0, limit);
}

export function getBestThirdGroupsKey(
  standings: GroupStandingsMap,
  limit = 8
): string {
  return getBestThirdPlacedTeams(standings, limit)
    .map((team) => team.group)
    .sort()
    .join('');
}