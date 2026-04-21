"use client";

import { useState, useTransition } from "react";
import { setTournamentFormat, generateFixture, resetFixture } from "../../actions/fixture";
import {
  estimateFixtureMatchCount,
  estimateRequiredMatchdays,
  type FixtureFormat,
  type FixtureGenerationOptions,
} from "@/lib/fixtureEngine";
import { DEFAULT_SCHEDULING_RULES } from "@/lib/tournamentLifecycle";
import { buildStandings, groupMatchesByStage } from "@/features/fixture/domain/standings";
import { FixtureConfigurator } from "@/features/fixture/presentation/FixtureConfigurator";
import { GeneratedFixtureView } from "@/features/fixture/presentation/GeneratedFixtureView";
import type { FixtureTournamentView } from "@/features/fixture/types";

type Props = {
  tournament: FixtureTournamentView;
};

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

export function FixtureEngine({ tournament }: Props) {
  const schedulingRules = tournament.schedulingRules ?? DEFAULT_SCHEDULING_RULES;
  const [selectedFormat, setSelectedFormat] = useState<FixtureFormat | null>((tournament.format as FixtureFormat) || null);
  const [groupCount, setGroupCount] = useState(1);
  const [startDate, setStartDate] = useState(schedulingRules.startDate);
  const [endDate, setEndDate] = useState(schedulingRules.endDate);
  const [matchesPerMatchday, setMatchesPerMatchday] = useState(schedulingRules.matchesPerMatchday);
  const [dailyStartTime, setDailyStartTime] = useState(schedulingRules.dailyStartTime);
  const [dailyEndTime, setDailyEndTime] = useState(schedulingRules.dailyEndTime);
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(schedulingRules.matchDurationMinutes);
  const [allowedWeekdays, setAllowedWeekdays] = useState<number[]>(schedulingRules.allowedWeekdays);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);

  const isGenerated = ["SCHEDULED", "PLAYING", "PAUSED", "FINISHED"].includes(tournament.status);
  const estimatedMatchCount = selectedFormat
    ? estimateFixtureMatchCount(
        tournament.teams.map(({ team }) => ({ id: team.id, name: team.name })),
        {
          format: selectedFormat,
          groupCount: selectedFormat === "ELIMINATORIA" ? 1 : groupCount,
        }
      )
    : 0;
  const estimatedMatchdays = estimateRequiredMatchdays(estimatedMatchCount, matchesPerMatchday);

  function handleFormatSelection(format: FixtureFormat) {
    setSelectedFormat(format);
    if (format === "GRUPOS_ELIMINATORIA" && groupCount < 2) {
      setGroupCount(2);
      return;
    }

    if (format === "ELIMINATORIA") {
      setGroupCount(1);
    }
  }

  function toggleWeekday(day: number) {
    setAllowedWeekdays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((left, right) => left - right)
    );
  }

  function getGenerationOptions(): FixtureGenerationOptions | null {
    if (!selectedFormat) {
      return null;
    }

    return {
      format: selectedFormat,
      groupCount: selectedFormat === "ELIMINATORIA" ? 1 : groupCount,
      schedulingRules: {
        startDate,
        endDate,
        matchesPerMatchday,
        allowedWeekdays,
        dailyStartTime,
        dailyEndTime,
        matchDurationMinutes,
      },
    };
  }

  function handleGenerate() {
    const options = getGenerationOptions();
    if (!options) {
      return;
    }

    startTransition(async () => {
      setMessage(null);
      await setTournamentFormat(tournament.id, options.format, options.schedulingRules);
      const result = await generateFixture(tournament.id, options);
      if (result.error) {
        setMessage(`❌ ${result.error}`);
      } else {
        setMessage(`✅ Fixture generado: ${result.count} partidos creados.`);
      }
    });
  }

  function handleReset() {
    if (!confirm("¿Estás seguro de eliminar todos los partidos y reiniciar?")) {
      return;
    }

    startTransition(async () => {
      setSelectedFormat(null);
      setMessage(null);
      await resetFixture(tournament.id);
    });
  }

  const matchesByGroup = groupMatchesByStage(tournament.matches);
  const standingsByGroup = buildStandings(tournament);

  return (
    <div className="flex flex-col gap-6">
      {!isGenerated && (
        <FixtureConfigurator
          selectedFormat={selectedFormat}
          groupCount={groupCount}
          teamCount={tournament.teams.length}
          startDate={startDate}
          endDate={endDate}
          matchesPerMatchday={matchesPerMatchday}
          dailyStartTime={dailyStartTime}
          dailyEndTime={dailyEndTime}
          matchDurationMinutes={matchDurationMinutes}
          allowedWeekdays={allowedWeekdays}
          weekdays={WEEKDAYS}
          estimatedMatchCount={estimatedMatchCount}
          estimatedMatchdays={estimatedMatchdays}
          isPending={isPending}
          message={message}
          onSelectFormat={handleFormatSelection}
          onSetGroupCount={setGroupCount}
          onSetStartDate={setStartDate}
          onSetEndDate={setEndDate}
          onSetMatchesPerMatchday={setMatchesPerMatchday}
          onSetDailyStartTime={setDailyStartTime}
          onSetDailyEndTime={setDailyEndTime}
          onSetMatchDurationMinutes={setMatchDurationMinutes}
          onToggleWeekday={toggleWeekday}
          onGenerate={handleGenerate}
        />
      )}

      {isGenerated && (
        <GeneratedFixtureView
          tournamentId={tournament.id}
          tournamentFormat={tournament.format}
          matchesCount={tournament.matches.length}
          standingsByGroup={standingsByGroup}
          matchesByGroup={matchesByGroup}
          editingMatch={editingMatch}
          setEditingMatch={setEditingMatch}
          isPending={isPending}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
