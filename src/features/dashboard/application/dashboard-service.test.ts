import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardStats } from "@/features/dashboard/application/dashboard-service";

const fromMock = vi.fn();

vi.mock("@/infrastructure/supabase/client", () => ({
  getSupabase: () => ({
    from: fromMock,
  }),
}));

describe("getDashboardStats", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("returns aggregated counts from Supabase head queries", async () => {
    fromMock
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: 12 }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: 34 }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: 5 }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: 21 }) });

    await expect(getDashboardStats()).resolves.toEqual({
      establishments: 12,
      teams: 34,
      tournaments: 5,
      matches: 21,
    });
  });

  it("normalizes null counts to zero", async () => {
    fromMock
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: null }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: undefined }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: 0 }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ count: null }) });

    await expect(getDashboardStats()).resolves.toEqual({
      establishments: 0,
      teams: 0,
      tournaments: 0,
      matches: 0,
    });
  });
});