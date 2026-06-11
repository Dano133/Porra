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

type ThirdRefOccurrence = {
  key: string;
  ref: string;
};

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

function thirdAssignmentKey(slotId: string, side: 'home' | 'away'): string {
  return `${slotId}:${side}`;
}

function buildThirdRefAssignments(
  standings: GroupStandingsMap,
): ThirdRefAssignment {
  const thirdRefs: ThirdRefOccurrence[] = WORLD_CUP_2026_SOURCE_OF_TRUTH.roundOf32Slots.flatMap(
    (slot) => [
      { key: thirdAssignmentKey(slot.id, 'home'), ref: slot.home },
      { key: thirdAssignmentKey(slot.id, 'away'), ref: slot.away },
    ].filter((item) => /^3[A-L]+$/.test(item.ref)),
  );
  const bestThirds = getBestThirdPlacedTeams(standings);
  const usedTeams = new Set<string>();
  const assignments: ThirdRefAssignment = new Map();

  function assign(index: number): boolean {
    if (index >= thirdRefs.length) return true;

    const occurrence = thirdRefs[index];
    const eligibleGroups = new Set(occurrence.ref.slice(1).split(''));
    const candidates = bestThirds.filter(
      (team) => eligibleGroups.has(team.group) && !usedTeams.has(team.teamId),
    );

    for (const candidate of candidates) {
      assignments.set(occurrence.key, candidate.teamId);
      usedTeams.add(candidate.teamId);
      if (assign(index + 1)) return true;
      usedTeams.delete(candidate.teamId);
      assignments.delete(occurrence.key);
    }

    return false;
  }

  if (!assign(0)) {
    console.error('No se pudieron asignar terceros únicos a R32', {
      thirdRefs,
      bestThirds,
    });
  }

  return assignments;
}

function resolveRef(
  ref: string,
  standings: GroupStandingsMap,
  thirdAssignments: ThirdRefAssignment,
  assignmentKey: string,
): string | null {
  const rankedTeam = resolveRankedRef(ref, standings);
  if (rankedTeam) return rankedTeam;

  if (/^3[A-L]+$/.test(ref)) {
    return thirdAssignments.get(assignmentKey) ?? null;
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
    homeTeam: resolveRef(
      slot.home,
      standings,
      thirdAssignments,
      thirdAssignmentKey(slot.id, 'home'),
    ),
    awayTeam: resolveRef(
      slot.away,
      standings,
      thirdAssignments,
      thirdAssignmentKey(slot.id, 'away'),
    ),
  }));
}
