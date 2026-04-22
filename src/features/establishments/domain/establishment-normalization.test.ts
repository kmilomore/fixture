import { describe, expect, it } from "vitest";
import {
  normalizeComuna,
  normalizeEstablishmentName,
} from "@/features/establishments/domain/establishment-normalization";

describe("establishment normalization", () => {
  it("normalizes establishment names for deduplication", () => {
    expect(normalizeEstablishmentName("  Liceo Técnico Ñuñoa ")).toBe("liceo tecnico nunoa");
  });

  it("normalizes comuna empty values to null", () => {
    expect(normalizeComuna("   ")).toBeNull();
    expect(normalizeComuna(" Santiago ")).toBe("Santiago");
  });
});