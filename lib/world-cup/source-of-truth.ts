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

  groups: {
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
  } as const,

  groupStageMatches: [
    { id: 'A-1', group: 'A', matchday: 1, dateLabel: '11 junio', dateIso: '2026-06-11', homeTeam: 'México', awayTeam: 'Sudáfrica' },
    { id: 'A-2', group: 'A', matchday: 1, dateLabel: '11 junio', dateIso: '2026-06-11', homeTeam: 'Corea Republic', awayTeam: 'Chequia' },
    { id: 'A-3', group: 'A', matchday: 2, dateLabel: '18 junio', dateIso: '2026-06-18', homeTeam: 'Sudáfrica', awayTeam: 'Chequia' },
    { id: 'A-4', group: 'A', matchday: 2, dateLabel: '18 junio', dateIso: '2026-06-18', homeTeam: 'México', awayTeam: 'Corea Republic' },
    { id: 'A-5', group: 'A', matchday: 3, dateLabel: '24 junio', dateIso: '2026-06-24', homeTeam: 'Chequia', awayTeam: 'México' },
    { id: 'A-6', group: 'A', matchday: 3, dateLabel: '24 junio', dateIso: '2026-06-24', homeTeam: 'Sudáfrica', awayTeam: 'Corea Republic' },

    { id: 'B-1', group: 'B', matchday: 1, dateLabel: '12 junio', dateIso: '2026-06-12', homeTeam: 'Canadá', awayTeam: 'Bosnia y Herzegovina' },
    { id: 'B-2', group: 'B', matchday: 1, dateLabel: '12 junio', dateIso: '2026-06-12', homeTeam: 'Qatar', awayTeam: 'Suiza' },
    { id: 'B-3', group: 'B', matchday: 2, dateLabel: '18 junio', dateIso: '2026-06-18', homeTeam: 'Suiza', awayTeam: 'Bosnia y Herzegovina' },
    { id: 'B-4', group: 'B', matchday: 2, dateLabel: '18 junio', dateIso: '2026-06-18', homeTeam: 'Canadá', awayTeam: 'Qatar' },
    { id: 'B-5', group: 'B', matchday: 3, dateLabel: '24 junio', dateIso: '2026-06-24', homeTeam: 'Suiza', awayTeam: 'Canadá' },
    { id: 'B-6', group: 'B', matchday: 3, dateLabel: '24 junio', dateIso: '2026-06-24', homeTeam: 'Bosnia y Herzegovina', awayTeam: 'Qatar' },

    { id: 'C-1', group: 'C', matchday: 1, dateLabel: '13 junio', dateIso: '2026-06-13', homeTeam: 'Haití', awayTeam: 'Escocia' },
    { id: 'C-2', group: 'C', matchday: 1, dateLabel: '13 junio', dateIso: '2026-06-13', homeTeam: 'Brasil', awayTeam: 'Marruecos' },
    { id: 'C-3', group: 'C', matchday: 2, dateLabel: '19 junio', dateIso: '2026-06-19', homeTeam: 'Brasil', awayTeam: 'Haití' },
    { id: 'C-4', group: 'C', matchday: 2, dateLabel: '19 junio', dateIso: '2026-06-19', homeTeam: 'Escocia', awayTeam: 'Marruecos' },
    { id: 'C-5', group: 'C', matchday: 3, dateLabel: '24 junio', dateIso: '2026-06-24', homeTeam: 'Escocia', awayTeam: 'Brasil' },
    { id: 'C-6', group: 'C', matchday: 3, dateLabel: '24 junio', dateIso: '2026-06-24', homeTeam: 'Marruecos', awayTeam: 'Haití' },

    { id: 'D-1', group: 'D', matchday: 1, dateLabel: '13 junio', dateIso: '2026-06-13', homeTeam: 'USA', awayTeam: 'Paraguay' },
    { id: 'D-2', group: 'D', matchday: 1, dateLabel: '13 junio', dateIso: '2026-06-13', homeTeam: 'Australia', awayTeam: 'Turquía' },
    { id: 'D-3', group: 'D', matchday: 2, dateLabel: '19 junio', dateIso: '2026-06-19', homeTeam: 'Turquía', awayTeam: 'Paraguay' },
    { id: 'D-4', group: 'D', matchday: 2, dateLabel: '19 junio', dateIso: '2026-06-19', homeTeam: 'USA', awayTeam: 'Australia' },
    { id: 'D-5', group: 'D', matchday: 3, dateLabel: '25 junio', dateIso: '2026-06-25', homeTeam: 'Turquía', awayTeam: 'USA' },
    { id: 'D-6', group: 'D', matchday: 3, dateLabel: '25 junio', dateIso: '2026-06-25', homeTeam: 'Paraguay', awayTeam: 'Australia' },

    { id: 'E-1', group: 'E', matchday: 1, dateLabel: '14 junio', dateIso: '2026-06-14', homeTeam: 'Costa de Marfil', awayTeam: 'Ecuador' },
    { id: 'E-2', group: 'E', matchday: 1, dateLabel: '14 junio', dateIso: '2026-06-14', homeTeam: 'Alemania', awayTeam: 'Curazao' },
    { id: 'E-3', group: 'E', matchday: 2, dateLabel: '20 junio', dateIso: '2026-06-20', homeTeam: 'Alemania', awayTeam: 'Costa de Marfil' },
    { id: 'E-4', group: 'E', matchday: 2, dateLabel: '20 junio', dateIso: '2026-06-20', homeTeam: 'Ecuador', awayTeam: 'Curazao' },
    { id: 'E-5', group: 'E', matchday: 3, dateLabel: '25 junio', dateIso: '2026-06-25', homeTeam: 'Curazao', awayTeam: 'Costa de Marfil' },
    { id: 'E-6', group: 'E', matchday: 3, dateLabel: '25 junio', dateIso: '2026-06-25', homeTeam: 'Ecuador', awayTeam: 'Alemania' },

    { id: 'F-1', group: 'F', matchday: 1, dateLabel: '14 junio', dateIso: '2026-06-14', homeTeam: 'Países Bajos', awayTeam: 'Japón' },
    { id: 'F-2', group: 'F', matchday: 1, dateLabel: '14 junio', dateIso: '2026-06-14', homeTeam: 'Suecia', awayTeam: 'Túnez' },
    { id: 'F-3', group: 'F', matchday: 2, dateLabel: '20 junio', dateIso: '2026-06-20', homeTeam: 'Países Bajos', awayTeam: 'Túnez' },
    { id: 'F-4', group: 'F', matchday: 2, dateLabel: '20 junio', dateIso: '2026-06-20', homeTeam: 'Suecia', awayTeam: 'Japón' },
    { id: 'F-5', group: 'F', matchday: 3, dateLabel: '25 junio', dateIso: '2026-06-25', homeTeam: 'Japón', awayTeam: 'Suecia' },
    { id: 'F-6', group: 'F', matchday: 3, dateLabel: '25 junio', dateIso: '2026-06-25', homeTeam: 'Túnez', awayTeam: 'Países Bajos' },

    { id: 'G-1', group: 'G', matchday: 1, dateLabel: '15 junio', dateIso: '2026-06-15', homeTeam: 'Irán', awayTeam: 'Nueva Zelanda' },
    { id: 'G-2', group: 'G', matchday: 1, dateLabel: '15 junio', dateIso: '2026-06-15', homeTeam: 'Bélgica', awayTeam: 'Egipto' },
    { id: 'G-3', group: 'G', matchday: 2, dateLabel: '21 junio', dateIso: '2026-06-21', homeTeam: 'Bélgica', awayTeam: 'Irán' },
    { id: 'G-4', group: 'G', matchday: 2, dateLabel: '21 junio', dateIso: '2026-06-21', homeTeam: 'Nueva Zelanda', awayTeam: 'Egipto' },
    { id: 'G-5', group: 'G', matchday: 3, dateLabel: '26 junio', dateIso: '2026-06-26', homeTeam: 'Egipto', awayTeam: 'Irán' },
    { id: 'G-6', group: 'G', matchday: 3, dateLabel: '26 junio', dateIso: '2026-06-26', homeTeam: 'Nueva Zelanda', awayTeam: 'Bélgica' },

    { id: 'H-1', group: 'H', matchday: 1, dateLabel: '15 junio', dateIso: '2026-06-15', homeTeam: 'Arabia Saudí', awayTeam: 'Uruguay' },
    { id: 'H-2', group: 'H', matchday: 1, dateLabel: '15 junio', dateIso: '2026-06-15', homeTeam: 'España', awayTeam: 'Cabo Verde' },
    { id: 'H-3', group: 'H', matchday: 2, dateLabel: '21 junio', dateIso: '2026-06-21', homeTeam: 'Uruguay', awayTeam: 'Cabo Verde' },
    { id: 'H-4', group: 'H', matchday: 2, dateLabel: '21 junio', dateIso: '2026-06-21', homeTeam: 'España', awayTeam: 'Arabia Saudí' },
    { id: 'H-5', group: 'H', matchday: 3, dateLabel: '26 junio', dateIso: '2026-06-26', homeTeam: 'Cabo Verde', awayTeam: 'Arabia Saudí' },
    { id: 'H-6', group: 'H', matchday: 3, dateLabel: '26 junio', dateIso: '2026-06-26', homeTeam: 'Uruguay', awayTeam: 'España' },

    { id: 'I-1', group: 'I', matchday: 1, dateLabel: '16 junio', dateIso: '2026-06-16', homeTeam: 'Francia', awayTeam: 'Senegal' },
    { id: 'I-2', group: 'I', matchday: 1, dateLabel: '16 junio', dateIso: '2026-06-16', homeTeam: 'Irak', awayTeam: 'Noruega' },
    { id: 'I-3', group: 'I', matchday: 2, dateLabel: '22 junio', dateIso: '2026-06-22', homeTeam: 'Noruega', awayTeam: 'Senegal' },
    { id: 'I-4', group: 'I', matchday: 2, dateLabel: '22 junio', dateIso: '2026-06-22', homeTeam: 'Francia', awayTeam: 'Irak' },
    { id: 'I-5', group: 'I', matchday: 3, dateLabel: '26 junio', dateIso: '2026-06-26', homeTeam: 'Noruega', awayTeam: 'Francia' },
    { id: 'I-6', group: 'I', matchday: 3, dateLabel: '26 junio', dateIso: '2026-06-26', homeTeam: 'Senegal', awayTeam: 'Irak' },

    { id: 'J-1', group: 'J', matchday: 1, dateLabel: '16 junio', dateIso: '2026-06-16', homeTeam: 'Argentina', awayTeam: 'Argelia' },
    { id: 'J-2', group: 'J', matchday: 1, dateLabel: '16 junio', dateIso: '2026-06-16', homeTeam: 'Austria', awayTeam: 'Jordania' },
    { id: 'J-3', group: 'J', matchday: 2, dateLabel: '22 junio', dateIso: '2026-06-22', homeTeam: 'Argentina', awayTeam: 'Austria' },
    { id: 'J-4', group: 'J', matchday: 2, dateLabel: '22 junio', dateIso: '2026-06-22', homeTeam: 'Jordania', awayTeam: 'Argelia' },
    { id: 'J-5', group: 'J', matchday: 3, dateLabel: '27 junio', dateIso: '2026-06-27', homeTeam: 'Argelia', awayTeam: 'Austria' },
    { id: 'J-6', group: 'J', matchday: 3, dateLabel: '27 junio', dateIso: '2026-06-27', homeTeam: 'Jordania', awayTeam: 'Argentina' },

    { id: 'K-1', group: 'K', matchday: 1, dateLabel: '17 junio', dateIso: '2026-06-17', homeTeam: 'Portugal', awayTeam: 'Congo DR' },
    { id: 'K-2', group: 'K', matchday: 1, dateLabel: '17 junio', dateIso: '2026-06-17', homeTeam: 'Uzbekistán', awayTeam: 'Colombia' },
    { id: 'K-3', group: 'K', matchday: 2, dateLabel: '23 junio', dateIso: '2026-06-23', homeTeam: 'Portugal', awayTeam: 'Uzbekistán' },
    { id: 'K-4', group: 'K', matchday: 2, dateLabel: '23 junio', dateIso: '2026-06-23', homeTeam: 'Colombia', awayTeam: 'Congo DR' },
    { id: 'K-5', group: 'K', matchday: 3, dateLabel: '27 junio', dateIso: '2026-06-27', homeTeam: 'Colombia', awayTeam: 'Portugal' },
    { id: 'K-6', group: 'K', matchday: 3, dateLabel: '27 junio', dateIso: '2026-06-27', homeTeam: 'Congo DR', awayTeam: 'Uzbekistán' },

    { id: 'L-1', group: 'L', matchday: 1, dateLabel: '17 junio', dateIso: '2026-06-17', homeTeam: 'Ghana', awayTeam: 'Panamá' },
    { id: 'L-2', group: 'L', matchday: 1, dateLabel: '17 junio', dateIso: '2026-06-17', homeTeam: 'Inglaterra', awayTeam: 'Croacia' },
    { id: 'L-3', group: 'L', matchday: 2, dateLabel: '23 junio', dateIso: '2026-06-23', homeTeam: 'Inglaterra', awayTeam: 'Ghana' },
    { id: 'L-4', group: 'L', matchday: 2, dateLabel: '23 junio', dateIso: '2026-06-23', homeTeam: 'Panamá', awayTeam: 'Croacia' },
    { id: 'L-5', group: 'L', matchday: 3, dateLabel: '27 junio', dateIso: '2026-06-27', homeTeam: 'Panamá', awayTeam: 'Inglaterra' },
    { id: 'L-6', group: 'L', matchday: 3, dateLabel: '27 junio', dateIso: '2026-06-27', homeTeam: 'Croacia', awayTeam: 'Ghana' },
  ] as TournamentGroupMatch[],

  roundOf32Slots: [
    { id: 'R32-1', home: '1E', away: '3ABCDF' },
    { id: 'R32-2', home: '1I', away: '3CDFGH' },
    { id: 'R32-3', home: '2A', away: '2B' },
    { id: 'R32-4', home: '1F', away: '2G' },
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