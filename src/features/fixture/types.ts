import type { MatchIncidentType, MatchStatus } from "@/features/fixture/domain/match-lifecycle";
import type { FixtureFormat, FixtureSchedulingRules } from "@/features/fixture/domain/fixture-engine";
import type { TournamentStatus } from "@/features/tournaments/domain/tournament-lifecycle";

export type FixtureFormatConfig = {
  selected: FixtureFormat | null;
  groupCount: number;
  seededTeamIds: string[];
};

export type FixtureSchedulingConfig = {
  startDate: string;
  endDate: string;
  matchesPerMatchday: number;
  dailyStartTime: string;
  dailyEndTime: string;
  matchDurationMinutes: number;
  allowedWeekdays: number[];
};

export type FixtureConfigHandlers = {
  onSelectFormat: (format: FixtureFormat) => void;
  onSetGroupCount: (value: number) => void;
  onSetSeededTeamId: (groupIndex: number, teamId: string) => void;
  onSetStartDate: (value: string) => void;
  onSetEndDate: (value: string) => void;
  onSetMatchesPerMatchday: (value: number) => void;
  onSetDailyStartTime: (value: string) => void;
  onSetDailyEndTime: (value: string) => void;
  onSetMatchDurationMinutes: (value: number) => void;
  onToggleWeekday: (day: number) => void;
  onGenerate: () => void;
};

export type FixtureTeamView = {
  id: string;
  name: string;
  establishment: { name: string };
};

export type MatchWithTeams = {
  id: string;
  round: number | null;
  groupName: string | null;
  matchLogicIdentifier: string | null;
  date: string | null;
  location: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  status: MatchStatus;
  incidentType: MatchIncidentType | null;
  incidentNotes: string | null;
  homeTeam: FixtureTeamView | null;
  awayTeam: FixtureTeamView | null;
};

export type StandingRow = {
  teamId: string;
  teamName: string;
  establishmentName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualification: "DIRECT" | "WILDCARD" | null;
};

export type StandingGroup = {
  key: string;
  label: string;
  rows: StandingRow[];
  playedMatches: number;
  pendingMatches: number;
};

export type FixtureTournamentView = {
  id: string;
  format: string | null;
  status: TournamentStatus;
  schedulingRules?: FixtureSchedulingRules;
  teams: Array<{ team: FixtureTeamView }>;
  matches: MatchWithTeams[];
};