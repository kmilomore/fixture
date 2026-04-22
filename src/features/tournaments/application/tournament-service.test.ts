import { beforeEach, describe, expect, it, vi } from "vitest";
import { listTournaments } from "@/features/tournaments/application/tournament-service";

const fromMock = vi.fn();

vi.mock("@/infrastructure/supabase/client", () => ({
  getSupabase: () => ({
    from: fromMock,
  }),
}));

describe("tournament-service", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("falls back to the legacy select when scheduling columns are missing", async () => {
    const legacyRow = {
      id: "t1",
      name: "Apertura",
      format: "LIGA",
      status: "DRAFT",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
      Discipline: { id: "d1", name: "Futbol" },
      Category: { id: "c1", name: "Sub-14", gender: "Mixto" },
      TournamentTeam: [{ id: "tt1" }, { id: "tt2" }],
      Match: [],
    };

    fromMock
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'column "scheduleStartDate" does not exist' },
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [legacyRow],
            error: null,
          }),
        }),
      });

    await expect(listTournaments()).resolves.toMatchObject([
      {
        id: "t1",
        name: "Apertura",
        format: "LIGA",
        status: "READY",
        discipline: { id: "d1", name: "Futbol" },
        category: { id: "c1", name: "Sub-14", gender: "Mixto" },
        teamsCount: 2,
        matchesCount: 0,
      },
    ]);
  });
});