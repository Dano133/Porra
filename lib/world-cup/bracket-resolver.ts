import { WORLD_CUP_2026_SOURCE_OF_TRUTH } from './source-of-truth';
import type { GroupStandingsMap } from './standings';
import { getBestThirdPlacedTeams } from './best-third';

export interface ResolvedRoundOf32Match {
  id: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeRef: string;
  awayRef: string;
}

function resolveRef(
  ref: string,
  standings: GroupStandingsMap
): string | null {
  if (/^[123][A-L]$/.test(ref)) {
    const pos = ref[0];
    const group = ref[1] as keyof GroupStandingsMap;
    const rows = standings[group];
    if (!rows || rows.length < 4) return null;

    if (pos === '1') return rows[0]?.team ?? null;
    if (pos === '2') return rows[1]?.team ?? null;
    if (pos === '3') return rows[2]?.team ?? null;
  }

  if (/^3[A-L]+$/.test(ref)) {
    const eligibleGroups = ref.slice(1).split('');
    const bestThirds = getBestThirdPlacedTeams(standings, 8);
    const match = bestThirds.find((team) => eligibleGroups.includes(team.group));
    return match?.team ?? null;
  }

  return null;
}

export function resolveRoundOf32(
  standings: GroupStandingsMap
): ResolvedRoundOf32Match[] {
  return WORLD_CUP_2026_SOURCE_OF_TRUTH.roundOf32Slots.map((slot) => ({
    id: slot.id,
    homeRef: slot.home,
    awayRef: slot.away,
    homeTeam: resolveRef(slot.home, standings),
    awayTeam: resolveRef(slot.away, standings),
  }));
}