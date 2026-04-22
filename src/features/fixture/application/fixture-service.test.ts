import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateMatchResult } from "@/features/fixture/application/fixture-service";

const fromMock = vi.fn();

vi.mock("@/infrastructure/supabase/client", () => ({
  getSupabase: () => ({
    from: fromMock,
  }),
}));

describe("fixture-service validations", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("rejects scores when the match status is not finished or walkover", async () => {
    await expect(
      updateMatchResult({
        matchId: "m1",
        status: "SCHEDULED",
        homeScore: 1,
        awayScore: 0,
      })
    ).rejects.toMatchObject({
      status: 400,
      message: "Solo puedes registrar marcador cuando el partido esta en FINISHED o WALKOVER",
    });
  });

  it("requires incident notes when an incident type is provided", async () => {
    await expect(
      updateMatchResult({
        matchId: "m2",
        status: "SUSPENDED",
        incidentType: "SUSPENSION",
        incidentNotes: "   ",
      })
    ).rejects.toMatchObject({
      status: 400,
      message: "Las incidencias deben incluir una nota descriptiva",
    });
  });
});