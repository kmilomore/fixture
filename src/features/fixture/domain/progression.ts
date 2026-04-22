import type { FixtureFormat } from "@/features/fixture/domain/fixture-engine";

type ProgressionTeam = {
  id: string;
  name: string;
};

type ProgressionMatch = {
  id: string;
  round: number | null;
  groupName: string | null;
  matchLogicIdentifier: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  createdAt?: string;
};

type RankingRow = {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type SlotResolution = {
  isReference: boolean;
  teamId: string | null;
};

export type AutomaticAssignment = {
  matchId: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
};

const GROUP_PREFIX = "Grupo ";
const BEST_SECOND_LABELS = new Set(["Mejor 2°", "Mejor 2º", "Mejor 2o"]);

function isGroupStageLabel(label: string | null) {
  return Boolean(label?.startsWith(GROUP_PREFIX));
}

function compareRankingRows(left: RankingRow, right: RankingRow) {
  if (right.points !== left.points) return right.points - left.points;
  if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
  if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
  return left.teamName.localeCompare(right.teamName, "es");
}

function getWinnerTeamId(match: ProgressionMatch) {
  if (match.homeTeamId && !match.awayTeamId) {
    return match.homeTeamId;
  }

  if (match.awayTeamId && !match.homeTeamId) {
    return match.awayTeamId;
  }

  if (!match.isFinished || !match.homeTeamId || !match.awayTeamId) {
    return null;
  }

  if (typeof match.homeScore !== "number" || typeof match.awayScore !== "number" || match.homeScore === match.awayScore) {
    return null;
  }

  return match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
}

function buildGroupRankings(teams: ProgressionTeam[], matches: ProgressionMatch[]) {
  const teamNames = new Map(teams.map((team) => [team.id, team.name]));
  const groupedMatches = matches.filter((match) => isGroupStageLabel(match.groupName));
  const rankings = new Map<string, RankingRow[]>();

  groupedMatches.forEach((match) => {
    const groupKey = match.groupName!;
    const currentRows = rankings.get(groupKey) ?? [];
    const rowsMap = new Map(currentRows.map((row) => [row.teamId, row]));

    [match.homeTeamId, match.awayTeamId].forEach((teamId) => {
      if (!teamId || rowsMap.has(teamId)) {
        return;
      }

      rowsMap.set(teamId, {
        teamId,
        teamName: teamNames.get(teamId) ?? "",
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    if (
      !match.isFinished ||
      !match.homeTeamId ||
      !match.awayTeamId ||
      typeof match.homeScore !== "number" ||
      typeof match.awayScore !== "number"
    ) {
      rankings.set(groupKey, Array.from(rowsMap.values()).sort(compareRankingRows));
      return;
    }

    const homeRow = rowsMap.get(match.homeTeamId);
    const awayRow = rowsMap.get(match.awayTeamId);

    if (!homeRow || !awayRow) {
      rankings.set(groupKey, Array.from(rowsMap.values()).sort(compareRankingRows));
      return;
    }

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += match.homeScore;
    homeRow.goalsAgainst += match.awayScore;
    awayRow.goalsFor += match.awayScore;
    awayRow.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeRow.wins += 1;
      awayRow.losses += 1;
      homeRow.points += 3;
    } else if (match.awayScore > match.homeScore) {
      awayRow.wins += 1;
      homeRow.losses += 1;
      awayRow.points += 3;
    } else {
      homeRow.draws += 1;
      awayRow.draws += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }

    homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
    awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;
    rankings.set(groupKey, Array.from(rowsMap.values()).sort(compareRankingRows));
  });

  return rankings;
}

function buildQualifierLookup(format: FixtureFormat, rankings: Map<string, RankingRow[]>) {
  const qualifiers = new Map<string, string>();
  const orderedGroups = Array.from(rankings.entries()).sort(([left], [right]) => left.localeCompare(right, "es"));

  orderedGroups.forEach(([groupLabel, rows]) => {
    const suffix = groupLabel.replace(GROUP_PREFIX, "").trim();
    if (rows[0]) {
      qualifiers.set(`1${suffix}`, rows[0].teamId);
    }

    if (format === "GRUPOS_ELIMINATORIA" && orderedGroups.length === 3) {
      return;
    }

    if (rows[1]) {
      qualifiers.set(`2${suffix}`, rows[1].teamId);
    }
  });

  if (format === "GRUPOS_ELIMINATORIA" && orderedGroups.length === 3) {
    const secondRows = orderedGroups
      .map(([, rows]) => rows[1] ?? null)
      .filter((row): row is RankingRow => Boolean(row))
      .sort(compareRankingRows);

    if (secondRows[0]) {
      BEST_SECOND_LABELS.forEach((label) => qualifiers.set(label, secondRows[0].teamId));
    }
  }

  return qualifiers;
}

function buildStageMatchesMap(matches: ProgressionMatch[]) {
  const stageMap = new Map<string, ProgressionMatch[]>();

  matches
    .filter((match) => !isGroupStageLabel(match.groupName) && Boolean(match.groupName))
    .forEach((match) => {
      const stageMatches = stageMap.get(match.groupName!) ?? [];
      stageMatches.push(match);
      stageMap.set(match.groupName!, stageMatches);
    });

  stageMap.forEach((stageMatches, stageName) => {
    stageMap.set(
      stageName,
      [...stageMatches].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        if (leftTime !== rightTime) {
          return leftTime - rightTime;
        }

        return left.id.localeCompare(right.id, "es");
      })
    );
  });

  return stageMap;
}

function resolveSlot(label: string, qualifierLookup: Map<string, string>, stageMatches: Map<string, ProgressionMatch[]>) {
  const trimmedLabel = label.trim();

  if (qualifierLookup.has(trimmedLabel)) {
    return { isReference: true, teamId: qualifierLookup.get(trimmedLabel) ?? null } satisfies SlotResolution;
  }

  const winnerMatch = /^Ganador\s+(.+)\s+(\d+)$/.exec(trimmedLabel);
  if (winnerMatch) {
    const [, stageName, rawIndex] = winnerMatch;
    const sourceMatch = stageMatches.get(stageName)?.[Number(rawIndex) - 1] ?? null;
    return { isReference: true, teamId: sourceMatch ? getWinnerTeamId(sourceMatch) : null } satisfies SlotResolution;
  }

  return { isReference: false, teamId: null } satisfies SlotResolution;
}

export function buildAutomaticFixtureAssignments(input: {
  format: FixtureFormat;
  teams: ProgressionTeam[];
  matches: ProgressionMatch[];
}) {
  const qualifierLookup = buildQualifierLookup(input.format, buildGroupRankings(input.teams, input.matches));
  const stageMatches = buildStageMatchesMap(input.matches);

  return input.matches.reduce<AutomaticAssignment[]>((assignments, match) => {
    if (!match.matchLogicIdentifier || !match.matchLogicIdentifier.includes(" vs ")) {
      return assignments;
    }

    const [homeLabel, awayLabel] = match.matchLogicIdentifier.split(" vs ");
    const homeResolution = resolveSlot(homeLabel, qualifierLookup, stageMatches);
    const awayResolution = resolveSlot(awayLabel, qualifierLookup, stageMatches);

    if (!homeResolution.isReference && !awayResolution.isReference) {
      return assignments;
    }

    const nextHomeTeamId = homeResolution.isReference ? homeResolution.teamId : match.homeTeamId;
    const nextAwayTeamId = awayResolution.isReference ? awayResolution.teamId : match.awayTeamId;

    if (nextHomeTeamId === match.homeTeamId && nextAwayTeamId === match.awayTeamId) {
      return assignments;
    }

    assignments.push({
      matchId: match.id,
      homeTeamId: nextHomeTeamId,
      awayTeamId: nextAwayTeamId,
    });
    return assignments;
  }, []);
}