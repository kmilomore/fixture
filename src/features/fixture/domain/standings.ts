import type { FixtureTournamentView, MatchWithTeams, StandingGroup, StandingRow } from "@/features/fixture/types";
import { resolveFixtureFormat } from "@/features/fixture/domain/fixture-format";

export function buildStandings(tournament: FixtureTournamentView): StandingGroup[] {
  if (tournament.matches.length === 0) {
    return [];
  }

  const effectiveFormat = resolveFixtureFormat(tournament.format, tournament.matches);

  const teamDirectory = new Map(
    tournament.teams.map(({ team }) => [
      team.id,
      {
        teamId: team.id,
        teamName: team.name,
        establishmentName: team.establishment.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        qualification: null,
      } satisfies StandingRow,
    ])
  );

  const relevantGroups = new Map<string, MatchWithTeams[]>();

  if (effectiveFormat === "LIGA") {
    const groupedLeagueMatches = tournament.matches.filter((match) => match.groupName?.startsWith("Grupo "));

    if (groupedLeagueMatches.length > 0) {
      groupedLeagueMatches.forEach((match) => {
        const key = match.groupName!;
        const matches = relevantGroups.get(key) ?? [];
        matches.push(match);
        relevantGroups.set(key, matches);
      });
    } else {
      relevantGroups.set(
        "Tabla general",
        tournament.matches.filter((match) => Boolean(match.homeTeam && match.awayTeam))
      );
    }
  }

  if (effectiveFormat === "GRUPOS_ELIMINATORIA") {
    tournament.matches
      .filter((match) => match.groupName?.startsWith("Grupo "))
      .forEach((match) => {
        const key = match.groupName!;
        const matches = relevantGroups.get(key) ?? [];
        matches.push(match);
        relevantGroups.set(key, matches);
      });
  }

  const standingGroups = Array.from(relevantGroups.entries())
    .map(([key, groupMatches]) => {
      const rows = new Map<string, StandingRow>();

      groupMatches.forEach((match) => {
        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;

        if (!homeTeam || !awayTeam) {
          return;
        }

        if (!rows.has(homeTeam.id)) {
          rows.set(homeTeam.id, { ...(teamDirectory.get(homeTeam.id) as StandingRow) });
        }

        if (!rows.has(awayTeam.id)) {
          rows.set(awayTeam.id, { ...(teamDirectory.get(awayTeam.id) as StandingRow) });
        }

        if (!match.isFinished) {
          return;
        }

        const homeRow = rows.get(homeTeam.id)!;
        const awayRow = rows.get(awayTeam.id)!;
        const homeScore = match.homeScore ?? 0;
        const awayScore = match.awayScore ?? 0;

        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.goalsFor += homeScore;
        homeRow.goalsAgainst += awayScore;
        awayRow.goalsFor += awayScore;
        awayRow.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
          homeRow.wins += 1;
          awayRow.losses += 1;
          homeRow.points += 3;
        } else if (awayScore > homeScore) {
          awayRow.wins += 1;
          homeRow.losses += 1;
          awayRow.points += 3;
        } else {
          homeRow.draws += 1;
          awayRow.draws += 1;
          homeRow.points += 1;
          awayRow.points += 1;
        }
      });

      const sortedRows = Array.from(rows.values())
        .map((row) => ({
          ...row,
          goalDifference: row.goalsFor - row.goalsAgainst,
        }))
        .sort((left, right) => {
          if (right.points !== left.points) return right.points - left.points;
          if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
          if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
          return left.teamName.localeCompare(right.teamName, "es");
        });

      return {
        key,
        label: key,
        rows: sortedRows,
        playedMatches: groupMatches.filter((match) => match.isFinished).length,
        pendingMatches: groupMatches.filter((match) => !match.isFinished).length,
      } satisfies StandingGroup;
    })
    .filter((group) => group.rows.length > 0);

  if (effectiveFormat === "GRUPOS_ELIMINATORIA" && standingGroups.length === 3) {
    const secondPlaceRows = standingGroups
      .map((group) => group.rows[1] ?? null)
      .filter((row): row is StandingRow => Boolean(row))
      .sort((left, right) => {
        if (right.points !== left.points) return right.points - left.points;
        if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
        if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
        return left.teamName.localeCompare(right.teamName, "es");
      });

    const wildcardTeamId = secondPlaceRows[0]?.teamId ?? null;

    standingGroups.forEach((group) => {
      group.rows.forEach((row, index) => {
        row.qualification = index === 0 ? "DIRECT" : row.teamId === wildcardTeamId ? "WILDCARD" : null;
      });
    });

    return standingGroups;
  }

  standingGroups.forEach((group) => {
    group.rows.forEach((row, index) => {
      row.qualification = effectiveFormat === "GRUPOS_ELIMINATORIA" || effectiveFormat === "LIGA"
        ? index < 2 ? "DIRECT" : null
        : null;
    });
  });

  return standingGroups;
}

export function groupMatchesByStage(matches: MatchWithTeams[]) {
  return matches.reduce<Record<string, MatchWithTeams[]>>((accumulator, match) => {
    const key = match.groupName || match.matchLogicIdentifier || `Ronda ${match.round}`;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(match);
    return accumulator;
  }, {});
}

export function getPlaceholderTeams(match: MatchWithTeams) {
  if (match.homeTeam || match.awayTeam || !match.matchLogicIdentifier || !match.matchLogicIdentifier.includes(" vs ")) {
    return null;
  }

  const [homeLabel, awayLabel] = match.matchLogicIdentifier.split(" vs ");
  return {
    home: homeLabel,
    away: awayLabel,
  };
}