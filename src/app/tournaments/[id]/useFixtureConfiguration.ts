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
import type {
  FixtureTournamentView,
  FixtureFormatConfig,
  FixtureSchedulingConfig,
  FixtureConfigHandlers,
} from "@/features/fixture/types";

export function useFixtureConfiguration(tournament: FixtureTournamentView) {
  const schedulingRules = tournament.schedulingRules ?? DEFAULT_SCHEDULING_RULES;

  const [selectedFormat, setSelectedFormat] = useState<FixtureFormat | null>(
    (tournament.format as FixtureFormat) || null
  );
  const [groupCount, setGroupCount] = useState(1);
  const [seededTeamIds, setSeededTeamIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(schedulingRules.startDate);
  const [endDate, setEndDate] = useState(schedulingRules.endDate);
  const [matchesPerMatchday, setMatchesPerMatchday] = useState(schedulingRules.matchesPerMatchday);
  const [dailyStartTime, setDailyStartTime] = useState(schedulingRules.dailyStartTime);
  const [dailyEndTime, setDailyEndTime] = useState(schedulingRules.dailyEndTime);
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(schedulingRules.matchDurationMinutes);
  const [allowedWeekdays, setAllowedWeekdays] = useState<number[]>(schedulingRules.allowedWeekdays);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const estimatedMatchCount = selectedFormat
    ? estimateFixtureMatchCount(
        tournament.teams.map(({ team }) => ({ id: team.id, name: team.name })),
        { format: selectedFormat, groupCount: selectedFormat === "ELIMINATORIA" ? 1 : groupCount }
      )
    : 0;
  const estimatedMatchdays = estimateRequiredMatchdays(estimatedMatchCount, matchesPerMatchday);

  function updateGroupCount(nextValue: number) {
    const normalized = Math.max(1, nextValue);
    setGroupCount(normalized);
    setSeededTeamIds((current) => current.slice(0, normalized));
  }

  function handleFormatSelection(format: FixtureFormat) {
    setSelectedFormat(format);
    if (format === "GRUPOS_ELIMINATORIA" && groupCount < 2) {
      updateGroupCount(2);
      return;
    }
    if (format === "ELIMINATORIA") {
      updateGroupCount(1);
    }
  }

  function toggleWeekday(day: number) {
    setAllowedWeekdays((current) =>
      current.includes(day)
        ? current.filter((v) => v !== day)
        : [...current, day].sort((a, b) => a - b)
    );
  }

  function setSeededTeamId(groupIndex: number, teamId: string) {
    setSeededTeamIds((current) => {
      const next = [...current];
      next[groupIndex] = teamId;
      return next.filter((v, i) => v || i < groupCount);
    });
  }

  function getGenerationOptions(): FixtureGenerationOptions | null {
    if (!selectedFormat) return null;
    return {
      format: selectedFormat,
      groupCount: selectedFormat === "ELIMINATORIA" ? 1 : groupCount,
      seededTeamIds: selectedFormat === "ELIMINATORIA" ? [] : seededTeamIds.filter(Boolean),
      schedulingRules: { startDate, endDate, matchesPerMatchday, allowedWeekdays, dailyStartTime, dailyEndTime, matchDurationMinutes },
    };
  }

  function handleGenerate() {
    const options = getGenerationOptions();
    if (!options) return;
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
    if (!confirm("¿Estás seguro de eliminar todos los partidos y reiniciar?")) return;
    startTransition(async () => {
      setSelectedFormat(null);
      setMessage(null);
      await resetFixture(tournament.id);
    });
  }

  return {
    format: { selected: selectedFormat, groupCount, seededTeamIds } satisfies FixtureFormatConfig,
    scheduling: { startDate, endDate, matchesPerMatchday, dailyStartTime, dailyEndTime, matchDurationMinutes, allowedWeekdays } satisfies FixtureSchedulingConfig,
    estimates: { matchCount: estimatedMatchCount, matchdays: estimatedMatchdays },
    handlers: {
      onSelectFormat: handleFormatSelection,
      onSetGroupCount: updateGroupCount,
      onSetSeededTeamId: setSeededTeamId,
      onSetStartDate: setStartDate,
      onSetEndDate: setEndDate,
      onSetMatchesPerMatchday: setMatchesPerMatchday,
      onSetDailyStartTime: setDailyStartTime,
      onSetDailyEndTime: setDailyEndTime,
      onSetMatchDurationMinutes: setMatchDurationMinutes,
      onToggleWeekday: toggleWeekday,
      onGenerate: handleGenerate,
    } satisfies FixtureConfigHandlers,
    isPending,
    message,
    handleReset,
  };
}
