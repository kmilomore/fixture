import { describe, expect, it } from "vitest";
import { buildStandings, getPlaceholderTeams, groupMatchesByStage } from "@/features/fixture/domain/standings";
import type { FixtureTournamentView, MatchWithTeams } from "@/features/fixture/types";

function buildLeagueTournament(matches: MatchWithTeams[]): FixtureTournamentView {
  return {
    id: "t1",
    format: "LIGA",
    status: "SCHEDULED",
    schedulingRules: undefined,
    teams: [
      { team: { id: "a", name: "Alpha", establishment: { name: "Colegio A" } } },
      { team: { id: "b", name: "Beta", establishment: { name: "Colegio B" } } },
      { team: { id: "c", name: "Gamma", establishment: { name: "Colegio C" } } },
    ],
    matches,
  };
}

describe("standings domain", () => {
  it("builds and sorts a general league table from finished matches", () => {
    const tournament = buildLeagueTournament([
      {
        id: "m1",
        round: 1,
        groupName: null,
        matchLogicIdentifier: "Fecha 1",
        date: null,
        location: null,
        homeScore: 2,
        awayScore: 0,
        isFinished: true,
        status: "FINISHED",
        incidentType: null,
        incidentNotes: null,
        homeTeam: { id: "a", name: "Alpha", establishment: { name: "Colegio A" } },
        awayTeam: { id: "b", name: "Beta", establishment: { name: "Colegio B" } },
      },
      {
        id: "m2",
        round: 2,
        groupName: null,
        matchLogicIdentifier: "Fecha 2",
        date: null,
        location: null,
        homeScore: 1,
        awayScore: 1,
        isFinished: true,
        status: "FINISHED",
        incidentType: null,
        incidentNotes: null,
        homeTeam: { id: "c", name: "Gamma", establishment: { name: "Colegio C" } },
        awayTeam: { id: "a", name: "Alpha", establishment: { name: "Colegio A" } },
      },
    ]);

    const [table] = buildStandings(tournament);

    expect(table.label).toBe("Tabla general");
    expect(table.rows.map((row) => ({ team: row.teamName, points: row.points }))).toEqual([
      { team: "Alpha", points: 4 },
      { team: "Gamma", points: 1 },
      { team: "Beta", points: 0 },
    ]);
  });

  it("groups matches by stage key and resolves placeholders from logic labels", () => {
    const matches: MatchWithTeams[] = [
      {
        id: "m1",
        round: 1,
        groupName: "Grupo A",
        matchLogicIdentifier: "Fecha 1",
        date: null,
        location: null,
        homeScore: null,
        awayScore: null,
        isFinished: false,
        status: "SCHEDULED",
        incidentType: null,
        incidentNotes: null,
        homeTeam: null,
        awayTeam: null,
      },
      {
        id: "m2",
        round: 3,
        groupName: null,
        matchLogicIdentifier: "Ganador SF1 vs Ganador SF2",
        date: null,
        location: null,
        homeScore: null,
        awayScore: null,
        isFinished: false,
        status: "SCHEDULED",
        incidentType: null,
        incidentNotes: null,
        homeTeam: null,
        awayTeam: null,
      },
    ];

    expect(groupMatchesByStage(matches)).toMatchObject({
      "Grupo A": [matches[0]],
      "Ganador SF1 vs Ganador SF2": [matches[1]],
    });
    expect(getPlaceholderTeams(matches[1])).toEqual({
      home: "Ganador SF1",
      away: "Ganador SF2",
    });
  });
});