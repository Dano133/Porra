import type { GroupKey } from './source-of-truth';
import { WORLD_CUP_2026_SOURCE_OF_TRUTH } from './source-of-truth';

export interface GroupPredictionScore {
  homeScore: number | null;
  awayScore: number | null;
}

export type GroupPredictionsMap = Record<string, GroupPredictionScore>;

export interface GroupTableRow {
  team: string;
  group: GroupKey;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type GroupStandingsMap = Record<GroupKey, GroupTableRow[]>;

export function calculateGroupTable(
  group: GroupKey,
  predictions: GroupPredictionsMap
): GroupTableRow[] {
  const matches = WORLD_CUP_2026_SOURCE_OF_TRUTH.groupStageMatches.filter(
    (m) => m.group === group
  );

  const teams = WORLD_CUP_2026_SOURCE_OF_TRUTH.groups[group];

  const table: Record<string, GroupTableRow> = {};

  for (const team of teams) {
    table[team] = {
      team,
      group,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  }

  for (const match of matches) {
    const prediction = predictions[match.id];
    if (!prediction) continue;
    if (prediction.homeScore === null || prediction.awayScore === null) continue;

    const hs = prediction.homeScore;
    const as = prediction.awayScore;

    const home = table[match.homeTeam];
    const away = table[match.awayTeam];

    home.played += 1;
    away.played += 1;

    home.goalsFor += hs;
    home.goalsAgainst += as;
    away.goalsFor += as;
    away.goalsAgainst += hs;

    if (hs > as) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (as > hs) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const rows = Object.values(table).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team, 'es');
  });

  return rows;
}

export function calculateAllGroupStandings(
  predictions: GroupPredictionsMap
): GroupStandingsMap {
  const groups = Object.keys(
    WORLD_CUP_2026_SOURCE_OF_TRUTH.groups
  ) as GroupKey[];

  return groups.reduce((acc, group) => {
    acc[group] = calculateGroupTable(group, predictions);
    return acc;
  }, {} as GroupStandingsMap);
}