import type { FixtureSchedulingRules } from "@/lib/fixtureEngine";

export const TOURNAMENT_STATUSES = [
  "DRAFT",
  "READY",
  "SCHEDULED",
  "PLAYING",
  "PAUSED",
  "FINISHED",
  "CANCELLED",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const DEFAULT_SCHEDULING_RULES: FixtureSchedulingRules = {
  startDate: buildDateOffset(0),
  endDate: buildDateOffset(30),
  matchesPerMatchday: 4,
  allowedWeekdays: [1, 2, 3, 4, 5],
  dailyStartTime: "09:00",
  dailyEndTime: "18:00",
  matchDurationMinutes: 90,
};

export function buildDateOffset(days: number) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

export function isTournamentStatus(value: unknown): value is TournamentStatus {
  return typeof value === "string" && TOURNAMENT_STATUSES.includes(value as TournamentStatus);
}

export function normalizeSchedulingRules(input: Partial<FixtureSchedulingRules> | null | undefined): FixtureSchedulingRules {
  return {
    startDate: typeof input?.startDate === "string" && input.startDate ? input.startDate : DEFAULT_SCHEDULING_RULES.startDate,
    endDate: typeof input?.endDate === "string" && input.endDate ? input.endDate : DEFAULT_SCHEDULING_RULES.endDate,
    matchesPerMatchday:
      typeof input?.matchesPerMatchday === "number" && input.matchesPerMatchday > 0
        ? input.matchesPerMatchday
        : DEFAULT_SCHEDULING_RULES.matchesPerMatchday,
    allowedWeekdays:
      Array.isArray(input?.allowedWeekdays) && input.allowedWeekdays.every((day) => Number.isInteger(day))
        ? [...new Set(input.allowedWeekdays)].sort((left, right) => left - right)
        : DEFAULT_SCHEDULING_RULES.allowedWeekdays,
    dailyStartTime:
      typeof input?.dailyStartTime === "string" && input.dailyStartTime
        ? input.dailyStartTime
        : DEFAULT_SCHEDULING_RULES.dailyStartTime,
    dailyEndTime:
      typeof input?.dailyEndTime === "string" && input.dailyEndTime
        ? input.dailyEndTime
        : DEFAULT_SCHEDULING_RULES.dailyEndTime,
    matchDurationMinutes:
      typeof input?.matchDurationMinutes === "number" && input.matchDurationMinutes > 0
        ? input.matchDurationMinutes
        : DEFAULT_SCHEDULING_RULES.matchDurationMinutes,
  };
}

type TournamentSchedulingRow = Partial<{
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  scheduleMatchesPerMatchday: number | null;
  scheduleAllowedWeekdays: number[] | null;
  scheduleDailyStartTime: string | null;
  scheduleDailyEndTime: string | null;
  scheduleMatchDurationMinutes: number | null;
}>;

export function schedulingRulesFromRow(row: TournamentSchedulingRow): FixtureSchedulingRules {
  return normalizeSchedulingRules({
    startDate: row.scheduleStartDate ?? undefined,
    endDate: row.scheduleEndDate ?? undefined,
    matchesPerMatchday: row.scheduleMatchesPerMatchday ?? undefined,
    allowedWeekdays: row.scheduleAllowedWeekdays ?? undefined,
    dailyStartTime: row.scheduleDailyStartTime ?? undefined,
    dailyEndTime: row.scheduleDailyEndTime ?? undefined,
    matchDurationMinutes: row.scheduleMatchDurationMinutes ?? undefined,
  });
}

export function schedulingRulesToRow(rules: Partial<FixtureSchedulingRules> | null | undefined) {
  const normalized = normalizeSchedulingRules(rules);
  return {
    scheduleStartDate: normalized.startDate,
    scheduleEndDate: normalized.endDate,
    scheduleMatchesPerMatchday: normalized.matchesPerMatchday,
    scheduleAllowedWeekdays: normalized.allowedWeekdays,
    scheduleDailyStartTime: normalized.dailyStartTime,
    scheduleDailyEndTime: normalized.dailyEndTime,
    scheduleMatchDurationMinutes: normalized.matchDurationMinutes,
  };
}

type TournamentStatusContext = {
  teamCount: number;
  matchCount: number;
  finishedMatchCount?: number;
  format: string | null;
  status: TournamentStatus;
};

export function deriveTournamentStatus(context: TournamentStatusContext): TournamentStatus {
  if (context.status === "CANCELLED" || context.status === "PAUSED") {
    return context.status;
  }

  if (context.matchCount > 0) {
    if ((context.finishedMatchCount ?? 0) >= context.matchCount) {
      return "FINISHED";
    }

    if ((context.finishedMatchCount ?? 0) > 0) {
      return "PLAYING";
    }

    return "SCHEDULED";
  }

  if (context.teamCount >= 2 && context.format) {
    return "READY";
  }

  return "DRAFT";
}

const ALLOWED_STATUS_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["DRAFT", "SCHEDULED", "CANCELLED"],
  SCHEDULED: ["READY", "PLAYING", "PAUSED", "CANCELLED"],
  PLAYING: ["PAUSED", "FINISHED", "CANCELLED"],
  PAUSED: ["SCHEDULED", "PLAYING", "CANCELLED"],
  FINISHED: ["SCHEDULED"],
  CANCELLED: ["DRAFT"],
};

export function canTransitionTournamentStatus(from: TournamentStatus, to: TournamentStatus) {
  return from === to || ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export function getTournamentStatusPresentation(status: TournamentStatus) {
  switch (status) {
    case "READY":
      return { label: "Listo", className: "bg-sky-100 text-sky-700" };
    case "SCHEDULED":
      return { label: "Programado", className: "bg-indigo-100 text-indigo-700" };
    case "PLAYING":
      return { label: "En Juego", className: "bg-emerald-100 text-emerald-700" };
    case "PAUSED":
      return { label: "Pausado", className: "bg-amber-100 text-amber-700" };
    case "FINISHED":
      return { label: "Finalizado", className: "bg-slate-200 text-slate-600" };
    case "CANCELLED":
      return { label: "Cancelado", className: "bg-rose-100 text-rose-700" };
    default:
      return { label: "Borrador", className: "bg-slate-100 text-slate-700" };
  }
}