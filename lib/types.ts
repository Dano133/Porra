// Tipos compartidos del dominio

export type ParticipantStatus = "active" | "inactive" | "blocked";
export type PredictionStatus = "draft" | "submitted" | "locked" | "cancelled";
export type MatchStatus = "scheduled" | "live" | "finished" | "cancelled";
export type TournamentStatus = "upcoming" | "active" | "finished";
export type Stage =
  | "group"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export interface Participant {
  id: string;
  fullName: string;
  email: string; // único, en minúsculas
  consentEmails: boolean;
  status: ParticipantStatus;
  createdAt: number; // epoch ms
  updatedAt: number;
}

export interface GroupStagePrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface KnockoutPrediction {
  // Identificador del cruce (p.ej. "R16_1", "QF_2", "SF_1", "FINAL", "TP")
  bracketId: string;
  stage: Exclude<Stage, "group">;
  homeTeam: string; // equipo que el participante predice como local del cruce
  awayTeam: string; // equipo visitante predicho
  homeScore: number; // resultado tras prórroga (sin penaltis)
  awayScore: number;
  winnerTeamId?: string; // clasificado; obligatorio cuando el marcador queda empatado.
}

export interface Prediction {
  id: string; // = participantId + '_' + tournamentId
  participantId: string;
  tournamentId: string;
  status: PredictionStatus;
  groupStagePredictions: GroupStagePrediction[];
  knockoutPredictions: KnockoutPrediction[];
  championPrediction: string; // nombre del equipo
  champion?: string | null; // alias usado por el flujo web actual
  pichichiPrediction?: string | null; // nombre del jugador
  pichichi?: string | null; // alias usado por el flujo web actual
  userId?: string; // alias usado por el flujo web actual
  displayName?: string | null;
  email?: string | null;
  submittedAt?: number;
  updatedAt: number;
  lockedAt?: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  stage: Stage;
  group?: string; // solo fase de grupos: "A", "B", ...
  bracketId?: string; // solo eliminatorias
  homeTeam: string;
  awayTeam: string;
  kickoffAt: number; // epoch ms
  officialHomeScore: number | null;
  officialAwayScore: number | null;
  // Ganador tras 90' o prórroga (sin penaltis). 'draw' solo válido en grupos.
  winnerAfter90Or120: "home" | "away" | "draw" | null;
  status: MatchStatus;
  updatedAt: number;
}

export interface TournamentResult {
  tournamentId: string;
  pichichi?: string | null;
  updatedAt: number;
}

export interface ScoreBreakdown {
  group: number;
  round_of_16: number;
  quarter_final: number;
  semi_final: number;
  third_place: number;
  final: number;
  champion: number;
  pichichi: number;
}

export interface Score {
  id: string; // = participantId + '_' + tournamentId
  participantId: string;
  tournamentId: string;
  totalPoints: number;
  breakdown: ScoreBreakdown;
  updatedAt: number;
}

export interface RankingSnapshot {
  id: string;
  snapshotDate: string; // YYYY-MM-DD
  participantId: string;
  tournamentId: string;
  totalPoints: number;
  rank: number;
  delta: number; // variación respecto al snapshot anterior
  createdAt: number;
}

export interface MailLog {
  id: string;
  type: string; // welcome | confirmation | reminder | biweekly | manual | final
  subject: string;
  sentAt: number;
  recipientsCount: number;
  status: "sent" | "partial" | "error";
  errorSummary?: string;
}

export interface Settings {
  competitionName: string;
  predictionDeadline: number; // epoch ms
  publicLeaderboardEnabled: boolean;
  emailUpdatesEnabled: boolean;
  senderName: string;
  senderEmail: string;
  currentTournamentId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: "admin" | "superadmin";
  createdAt: number;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  year: number;
  status: TournamentStatus;
  createdAt: number;
  updatedAt: number;
}
