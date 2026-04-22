import type { FixtureFormat } from "@/features/fixture/domain/fixture-engine";

type MatchFormatCandidate = {
  groupName: string | null;
};

function isFixtureFormat(value: unknown): value is FixtureFormat {
  return value === "LIGA" || value === "ELIMINATORIA" || value === "GRUPOS_ELIMINATORIA";
}

function isGroupLabel(groupName: string | null) {
  return Boolean(groupName?.startsWith("Grupo "));
}

export function resolveFixtureFormat(
  persistedFormat: string | null | undefined,
  matches: MatchFormatCandidate[]
): FixtureFormat | null {
  if (isFixtureFormat(persistedFormat)) {
    return persistedFormat;
  }

  const hasGroupStage = matches.some((match) => isGroupLabel(match.groupName));
  const hasKnockoutStage = matches.some((match) => Boolean(match.groupName) && !isGroupLabel(match.groupName));

  if (hasGroupStage && hasKnockoutStage) {
    return "GRUPOS_ELIMINATORIA";
  }

  if (hasGroupStage) {
    return "LIGA";
  }

  if (hasKnockoutStage) {
    return "ELIMINATORIA";
  }

  return null;
}