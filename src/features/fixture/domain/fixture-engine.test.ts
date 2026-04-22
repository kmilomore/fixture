import { describe, expect, it } from "vitest";
import { generateFixtureMatches } from "@/features/fixture/domain/fixture-engine";

describe("fixture-engine seeding", () => {
  it("keeps selected seeded teams in separate groups", () => {
    const teams = [
      { id: "t1", name: "Andes" },
      { id: "t2", name: "Bravo" },
      { id: "t3", name: "Cobreloa" },
      { id: "t4", name: "Deportes Sur" },
      { id: "t5", name: "Estrella" },
      { id: "t6", name: "Fenix" },
    ];

    const matches = generateFixtureMatches(teams, {
      format: "GRUPOS_ELIMINATORIA",
      groupCount: 2,
      seededTeamIds: ["t6", "t1"],
    });

    const groupMembership = matches
      .filter((match) => match.groupName?.startsWith("Grupo "))
      .reduce<Record<string, Set<string>>>((accumulator, match) => {
        const key = match.groupName!;
        if (!accumulator[key]) {
          accumulator[key] = new Set<string>();
        }

        if (match.homeTeamId) {
          accumulator[key].add(match.homeTeamId);
        }

        if (match.awayTeamId) {
          accumulator[key].add(match.awayTeamId);
        }

        return accumulator;
      }, {});

    expect(Array.from(groupMembership["Grupo A"])).toContain("t6");
    expect(Array.from(groupMembership["Grupo A"])).not.toContain("t1");
    expect(Array.from(groupMembership["Grupo B"])).toContain("t1");
    expect(Array.from(groupMembership["Grupo B"])).not.toContain("t6");
  });
});