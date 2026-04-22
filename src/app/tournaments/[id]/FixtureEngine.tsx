"use client";

import { useState } from "react";
import { buildStandings, groupMatchesByStage } from "@/features/fixture/domain/standings";
import { FixtureConfigurator } from "@/features/fixture/presentation/FixtureConfigurator";
import { GeneratedFixtureView } from "@/features/fixture/presentation/GeneratedFixtureView";
import type { FixtureTournamentView } from "@/features/fixture/types";
import { useFixtureConfiguration } from "./useFixtureConfiguration";

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

type Props = {
  tournament: FixtureTournamentView;
};

export function FixtureEngine({ tournament }: Props) {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const config = useFixtureConfiguration(tournament);

  const isGenerated = ["SCHEDULED", "PLAYING", "PAUSED", "FINISHED"].includes(tournament.status);
  const standingsByGroup = buildStandings(tournament);
  const matchesByGroup = groupMatchesByStage(tournament.matches);
  const hasGroupStandings = standingsByGroup.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {!isGenerated && (
        <FixtureConfigurator
          format={config.format}
          scheduling={config.scheduling}
          estimates={config.estimates}
          teams={tournament.teams.map(({ team }) => team)}
          weekdays={WEEKDAYS}
          handlers={config.handlers}
          isPending={config.isPending}
          message={config.message}
        />
      )}

      {isGenerated && (
        <GeneratedFixtureView
          tournamentId={tournament.id}
          tournamentFormat={tournament.format}
          matchesCount={tournament.matches.length}
          standingsByGroup={standingsByGroup}
          matchesByGroup={matchesByGroup}
          defaultViewMode={hasGroupStandings ? "groups" : "all"}
          editingMatch={editingMatch}
          setEditingMatch={setEditingMatch}
          isPending={config.isPending}
          onReset={config.handleReset}
        />
      )}
    </div>
  );
}
