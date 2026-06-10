export type GroupKey =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface TournamentGroupMatch {
  id: string;
  group: GroupKey;
  matchday: 1 | 2 | 3;
  dateLabel: string;
  dateIso: string;
  homeTeam: string;
  awayTeam: string;
}

export interface KnockoutSlot {
  id: string;
  home: string;
  away: string;
}

type GroupTeams = readonly [string, string, string, string];
type MatchdayDate = { dateLabel: string; dateIso: string };
type GroupMatchdayDates = readonly [MatchdayDate, MatchdayDate, MatchdayDate];
type Pairing = readonly [number, number];

export const WORLD_CUP_GROUPS: Record<GroupKey, GroupTeams> = {
  A: ['México', 'Sudáfrica', 'Corea Republic', 'Chequia'],
  B: ['Canadá', 'Bosnia y Herzegovina', 'Qatar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['USA', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Irak', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'Congo DR', 'Uzbekistán', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
};

const GROUP_MATCHDAY_DATES: Record<GroupKey, GroupMatchdayDates> = {
  A: [
    { dateLabel: '11 junio', dateIso: '2026-06-11' },
    { dateLabel: '18 junio', dateIso: '2026-06-18' },
    { dateLabel: '24 junio', dateIso: '2026-06-24' },
  ],
  B: [
    { dateLabel: '12 junio', dateIso: '2026-06-12' },
    { dateLabel: '18 junio', dateIso: '2026-06-18' },
    { dateLabel: '24 junio', dateIso: '2026-06-24' },
  ],
  C: [
    { dateLabel: '13 junio', dateIso: '2026-06-13' },
    { dateLabel: '19 junio', dateIso: '2026-06-19' },
    { dateLabel: '24 junio', dateIso: '2026-06-24' },
  ],
  D: [
    { dateLabel: '13 junio', dateIso: '2026-06-13' },
    { dateLabel: '19 junio', dateIso: '2026-06-19' },
    { dateLabel: '25 junio', dateIso: '2026-06-25' },
  ],
  E: [
    { dateLabel: '14 junio', dateIso: '2026-06-14' },
    { dateLabel: '20 junio', dateIso: '2026-06-20' },
    { dateLabel: '25 junio', dateIso: '2026-06-25' },
  ],
  F: [
    { dateLabel: '14 junio', dateIso: '2026-06-14' },
    { dateLabel: '20 junio', dateIso: '2026-06-20' },
    { dateLabel: '25 junio', dateIso: '2026-06-25' },
  ],
  G: [
    { dateLabel: '15 junio', dateIso: '2026-06-15' },
    { dateLabel: '21 junio', dateIso: '2026-06-21' },
    { dateLabel: '26 junio', dateIso: '2026-06-26' },
  ],
  H: [
    { dateLabel: '15 junio', dateIso: '2026-06-15' },
    { dateLabel: '21 junio', dateIso: '2026-06-21' },
    { dateLabel: '26 junio', dateIso: '2026-06-26' },
  ],
  I: [
    { dateLabel: '16 junio', dateIso: '2026-06-16' },
    { dateLabel: '22 junio', dateIso: '2026-06-22' },
    { dateLabel: '26 junio', dateIso: '2026-06-26' },
  ],
  J: [
    { dateLabel: '16 junio', dateIso: '2026-06-16' },
    { dateLabel: '22 junio', dateIso: '2026-06-22' },
    { dateLabel: '27 junio', dateIso: '2026-06-27' },
  ],
  K: [
    { dateLabel: '17 junio', dateIso: '2026-06-17' },
    { dateLabel: '23 junio', dateIso: '2026-06-23' },
    { dateLabel: '27 junio', dateIso: '2026-06-27' },
  ],
  L: [
    { dateLabel: '17 junio', dateIso: '2026-06-17' },
    { dateLabel: '23 junio', dateIso: '2026-06-23' },
    { dateLabel: '27 junio', dateIso: '2026-06-27' },
  ],
};

const GROUP_STAGE_ROUND_ROBIN_PAIRINGS: readonly Pairing[] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [3, 1],
  [3, 0],
  [1, 2],
];

function generateGroupStageMatches(
  groups: Record<GroupKey, GroupTeams>,
  dates: Record<GroupKey, GroupMatchdayDates>,
): TournamentGroupMatch[] {
  return (Object.keys(groups) as GroupKey[]).flatMap((group) => {
    const teams = groups[group];
    return GROUP_STAGE_ROUND_ROBIN_PAIRINGS.map(([homeIndex, awayIndex], index) => {
      const matchday = (Math.floor(index / 2) + 1) as 1 | 2 | 3;
      const date = dates[group][matchday - 1];

      return {
        id: `${group}-${index + 1}`,
        group,
        matchday,
        dateLabel: date.dateLabel,
        dateIso: date.dateIso,
        homeTeam: teams[homeIndex],
        awayTeam: teams[awayIndex],
      };
    });
  });
}

export const WORLD_CUP_2026_SOURCE_OF_TRUTH = {
  tournament: {
    id: 'world-cup-2026',
    name: 'FIFA World Cup 2026',
    year: 2026,
    groupCount: 12,
    teamsPerGroup: 4,
    groupsAdvanceDirectly: 2,
    bestThirdsAdvance: 8,
    knockoutStartsAt: 'roundOf32',
  },

  groups: WORLD_CUP_GROUPS,

  groupStageMatches: generateGroupStageMatches(
    WORLD_CUP_GROUPS,
    GROUP_MATCHDAY_DATES,
  ),

  roundOf32Slots: [
    { id: 'R32-1', home: '1E', away: '3ABCDF' },
    { id: 'R32-2', home: '1I', away: '3CDFGH' },
    { id: 'R32-3', home: '2A', away: '2B' },
    { id: 'R32-4', home: '1F', away: '2C' },
    { id: 'R32-5', home: '2K', away: '2L' },
    { id: 'R32-6', home: '1H', away: '2J' },
    { id: 'R32-7', home: '1D', away: '3BEFIJ' },
    { id: 'R32-8', home: '1G', away: '3AEHIJ' },

    { id: 'R32-9', home: '1C', away: '2F' },
    { id: 'R32-10', home: '2E', away: '2I' },
    { id: 'R32-11', home: '1A', away: '3CEFHI' },
    { id: 'R32-12', home: '1L', away: '3EHIJK' },
    { id: 'R32-13', home: '1J', away: '2H' },
    { id: 'R32-14', home: '2D', away: '2G' },
    { id: 'R32-15', home: '1B', away: '3EFGIJ' },
    { id: 'R32-16', home: '1K', away: '3DEIJL' },
  ] as KnockoutSlot[],

  scoring: {
    groupStage: {
      correctWinner: 5,
      correctWinnerAndExactScore: 15,
      correctDraw: 10,
      correctDrawAndExactScore: 20,
    },
    knockout: {
      roundOf32: null,
      roundOf16: {
        correctQualified: 10,
        correctQualifiedAndBracketPosition: 20,
        exactBracketAndExactResultBonus: 20,
      },
      quarterFinals: {
        correctQualified: 40,
        exactBracketAndExactResultBonus: 40,
      },
      semiFinals: {
        correctQualified: 60,
        exactBracketAndExactResultBonus: 60,
      },
      thirdPlace: {
        correctQualified: 80,
        exactBracketAndExactResultBonus: 80,
      },
      final: {
        correctQualified: 100,
        exactBracketAndExactResultBonus: 100,
      },
      champion: 300,
      pichichi: 300,
      matchResultCountsUntilExtraTime: true,
      penaltyShootoutIgnored: true,
      bracketOrderMatters: true,
    },
  },
} as const;
