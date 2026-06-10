import { getBestThirdPlacedTeams } from './best-third';
import { WORLD_CUP_2026_SOURCE_OF_TRUTH } from './source-of-truth';
import type { GroupStandingsMap } from './standings';

export interface ResolvedRoundOf32Match {
  id: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeRef: string;
  awayRef: string;
}

type ThirdRefAssignment = Map<string, string>;

function resolveRankedRef(
  ref: string,
  standings: GroupStandingsMap,
): string | null {
  if (!/^[12][A-L]$/.test(ref)) return null;

  const pos = ref[0];
  const group = ref[1] as keyof GroupStandingsMap;
  const rows = standings[group];
  if (!rows || rows.length < 4) return null;

  if (pos === '1') return rows[0]?.team ?? null;
  if (pos === '2') return rows[1]?.team ?? null;
  return null;
}

function buildThirdRefAssignments(
  standings: GroupStandingsMap,
): ThirdRefAssignment {
  const thirdRefs = WORLD_CUP_2026_SOURCE_OF_TRUTH.roundOf32Slots.flatMap((slot) =>
    [slot.home, slot.away].filter((ref) => /^3[A-L]+$/.test(ref)),
  );
  const bestThirds = getBestThirdPlacedTeams(standings, 8);
  const usedTeams = new Set<string>();
  const assignments: ThirdRefAssignment = new Map();

  function assign(index: number): boolean {
    if (index >= thirdRefs.length) return true;

    const ref = thirdRefs[index];
    const eligibleGroups = new Set(ref.slice(1).split(''));
    const candidates = bestThirds.filter(
      (team) => eligibleGroups.has(team.group) && !usedTeams.has(team.team),
    );

    for (const candidate of candidates) {
      assignments.set(ref, candidate.team);
      usedTeams.add(candidate.team);
      if (assign(index + 1)) return true;
      usedTeams.delete(candidate.team);
      assignments.delete(ref);
    }

    return false;
  }

  assign(0);
  return assignments;
}

function resolveRef(
  ref: string,
  standings: GroupStandingsMap,
  thirdAssignments: ThirdRefAssignment,
): string | null {
  const rankedTeam = resolveRankedRef(ref, standings);
  if (rankedTeam) return rankedTeam;

  if (/^3[A-L]+$/.test(ref)) {
    return thirdAssignments.get(ref) ?? null;
  }

  return null;
}

export function resolveRoundOf32(
  standings: GroupStandingsMap,
): ResolvedRoundOf32Match[] {
  const thirdAssignments = buildThirdRefAssignments(standings);

  return WORLD_CUP_2026_SOURCE_OF_TRUTH.roundOf32Slots.map((slot) => ({
    id: slot.id,
    homeRef: slot.home,
    awayRef: slot.away,
    homeTeam: resolveRef(slot.home, standings, thirdAssignments),
    awayTeam: resolveRef(slot.away, standings, thirdAssignments),
  }));
}
