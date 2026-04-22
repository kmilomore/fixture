import { describe, expect, it } from "vitest";
import { buildAutomaticFixtureAssignments } from "@/features/fixture/domain/progression";

const teams = [
  { id: "a", name: "Andes" },
  { id: "b", name: "Bravo" },
  { id: "c", name: "Cobreloa" },
  { id: "d", name: "Deportes Sur" },
  { id: "e", name: "Estrella" },
  { id: "f", name: "Fenix" },
];

describe("fixture progression", () => {
  it("assigns group winners and best second into semifinals for three groups", () => {
    const assignments = buildAutomaticFixtureAssignments({
      format: "GRUPOS_ELIMINATORIA",
      teams,
      matches: [
        { id: "ga1", round: 1, groupName: "Grupo A", matchLogicIdentifier: "Fecha 1", homeTeamId: "a", awayTeamId: "b", homeScore: 2, awayScore: 0, isFinished: true },
        { id: "gb1", round: 1, groupName: "Grupo B", matchLogicIdentifier: "Fecha 1", homeTeamId: "c", awayTeamId: "d", homeScore: 3, awayScore: 0, isFinished: true },
        { id: "gc1", round: 1, groupName: "Grupo C", matchLogicIdentifier: "Fecha 1", homeTeamId: "e", awayTeamId: "f", homeScore: 1, awayScore: 0, isFinished: true },
        { id: "sf1", round: 2, groupName: "Semifinal", matchLogicIdentifier: "1A vs Mejor 2°", homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, isFinished: false },
        { id: "sf2", round: 2, groupName: "Semifinal", matchLogicIdentifier: "1B vs 1C", homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, isFinished: false },
      ],
    });

    expect(assignments).toEqual([
      { matchId: "sf1", homeTeamId: "a", awayTeamId: "f" },
      { matchId: "sf2", homeTeamId: "c", awayTeamId: "e" },
    ]);
  });

  it("propagates winners from previous knockout matches into the next round", () => {
    const assignments = buildAutomaticFixtureAssignments({
      format: "ELIMINATORIA",
      teams,
      matches: [
        { id: "s1", round: 1, groupName: "Semifinal", matchLogicIdentifier: "Andes vs Bravo", homeTeamId: "a", awayTeamId: "b", homeScore: 2, awayScore: 1, isFinished: true, createdAt: "2026-01-01T10:00:00.000Z" },
        { id: "s2", round: 1, groupName: "Semifinal", matchLogicIdentifier: "Cobreloa vs BYE", homeTeamId: "c", awayTeamId: null, homeScore: null, awayScore: null, isFinished: false, createdAt: "2026-01-01T10:05:00.000Z" },
        { id: "f1", round: 2, groupName: "Final", matchLogicIdentifier: "Ganador Semifinal 1 vs Ganador Semifinal 2", homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, isFinished: false, createdAt: "2026-01-01T10:10:00.000Z" },
      ],
    });

    expect(assignments).toEqual([{ matchId: "f1", homeTeamId: "a", awayTeamId: "c" }]);
  });
});