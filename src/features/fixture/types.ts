import type { MatchIncidentType, MatchStatus } from "@/lib/matchLifecycle";
import type { FixtureSchedulingRules } from "@/lib/fixtureEngine";
import type { TournamentStatus } from "@/lib/tournamentLifecycle";

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