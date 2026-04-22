import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDiscipline, listCatalogs } from "@/features/disciplines/application/catalog-service";
import { ServiceError } from "@/shared/lib/service-error";

const fromMock = vi.fn();

vi.mock("@/infrastructure/supabase/client", () => ({
  getSupabase: () => ({
    from: fromMock,
  }),
}));

describe("catalog-service", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("lists disciplines and categories ordered from the repository", async () => {
    const disciplineOrderMock = vi.fn().mockResolvedValue({
      data: [{ id: "d1", name: "Futbol", createdAt: "a", updatedAt: "b" }],
      error: null,
    });
    const categoryOrderMock = vi.fn().mockResolvedValue({
      data: [{ id: "c1", name: "Sub-14", gender: "Mixto", createdAt: "a", updatedAt: "b" }],
      error: null,
    });

    fromMock
      .mockReturnValueOnce({ select: vi.fn().mockReturnValue({ order: disciplineOrderMock }) })
      .mockReturnValueOnce({ select: vi.fn().mockReturnValue({ order: categoryOrderMock }) });

    await expect(listCatalogs()).resolves.toEqual({
      disciplines: [{ id: "d1", name: "Futbol", createdAt: "a", updatedAt: "b" }],
      categories: [{ id: "c1", name: "Sub-14", gender: "Mixto", createdAt: "a", updatedAt: "b" }],
    });
  });

  it("rejects duplicate disciplines using normalized names", async () => {
    const selectMock = vi.fn().mockResolvedValue({
      data: [{ name: "Futbol" }],
    });

    fromMock.mockReturnValueOnce({ select: selectMock });

    await expect(createDiscipline({ name: "  Fútbol  " })).rejects.toEqual(
      new ServiceError(409, "La disciplina ya existe")
    );
  });
});