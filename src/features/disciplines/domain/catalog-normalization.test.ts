import { describe, expect, it } from "vitest";
import { normalizeCatalogName } from "@/features/disciplines/domain/catalog-normalization";

describe("normalizeCatalogName", () => {
  it("removes accents, casing differences and duplicated separators", () => {
    expect(normalizeCatalogName("  Fútbol   Escolar ")).toBe("futbol escolar");
  });
});