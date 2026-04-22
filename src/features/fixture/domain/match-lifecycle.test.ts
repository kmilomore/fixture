import { describe, expect, it } from "vitest";
import { normalizeMatchStatus } from "@/features/fixture/domain/match-lifecycle";

describe("normalizeMatchStatus", () => {
  it("preserves a valid persisted status", () => {
    expect(normalizeMatchStatus("WALKOVER", true)).toBe("WALKOVER");
  });

  it("derives FINISHED when persisted status is missing but match is finished", () => {
    expect(normalizeMatchStatus(undefined, true)).toBe("FINISHED");
  });

  it("falls back to SCHEDULED when persisted status is missing and match is pending", () => {
    expect(normalizeMatchStatus(undefined, false)).toBe("SCHEDULED");
  });
});