"use client";

import { useMemo, useState } from "react";
import {
  getMatchIncidentLabel,
  getMatchStatusPresentation,
  MATCH_STATUSES,
  type MatchIncidentType,
  type MatchStatus,
} from "@/features/fixture/domain/match-lifecycle";

type CalendarMatch = {
  id: string;
  date: string | null;
  location: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  status: MatchStatus;
  incidentType: MatchIncidentType | null;
  incidentNotes: string | null;
  groupName: string | null;
  matchLogicIdentifier: string | null;
  homeTeam: { name: string; establishment: { name: string } } | null;
  awayTeam: { name: string; establishment: { name: string } } | null;
};

function getPhaseLabel(match: CalendarMatch) {
  const matchdayLabel = match.matchLogicIdentifier && !match.matchLogicIdentifier.includes(" vs ") ? match.matchLogicIdentifier : null;

  if (match.groupName && matchdayLabel) {
    return `${match.groupName} · ${matchdayLabel}`;
  }

  return match.groupName || matchdayLabel || "Partido";
}

function getCalendarKey(date: string | null) {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(date).toISOString().slice(0, 10);
}

function getDayLabel(dayKey: string) {
  if (dayKey === "Sin fecha") {
    return dayKey;
  }

  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "short" }).format(new Date(`${dayKey}T00:00:00`));
}

function startOfCalendarWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfCalendarWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getTeamLabel(team: CalendarMatch["homeTeam"]) {
  if (!team) {
    return { name: "BYE", establishment: null };
  }

  return { name: team.name, establishment: team.establishment.name };
}

export function CalendarView({ matches }: { matches: CalendarMatch[] }) {
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [selectedMatch, setSelectedMatch] = useState<CalendarMatch | null>(null);

  function getDayKey(date: string | null) {
    return date ? date.slice(0, 10) : "NO_DATE";
  }

  function formatDayOption(day: string) {
    if (day === "NO_DATE") {
      return "Sin fecha";
    }

    const [year, month, date] = day.split("-");
    return `${date}/${month}/${year}`;
  }

  function formatTimeLabel(date: string | null) {
    if (!date) {
      return "Hora por definir";
    }

    const rawTime = date.split("T")[1] ?? "";
    return rawTime.slice(0, 5) || "Hora por definir";
  }

  function formatDateTimeLabel(date: string | null) {
    if (!date) {
      return "Sin fecha programada";
    }

    const [rawDate] = date.split("T");
    const [year, month, day] = rawDate.split("-");
    return `${day}/${month}/${year} ${formatTimeLabel(date)}`;
  }

  const locationOptions = useMemo(
    () => Array.from(new Set(matches.map((match) => match.location?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "es")),
    [matches]
  );

  const dayOptions = useMemo(
    () => Array.from(new Set(matches.map((match) => getDayKey(match.date)))).sort((left, right) => left.localeCompare(right)),
    [matches]
  );

  const filteredMatches = useMemo(
    () => matches.filter((match) => {
      if (statusFilter !== "ALL" && match.status !== statusFilter) {
        return false;
      }

      if (locationFilter !== "ALL" && (match.location?.trim() || "") !== locationFilter) {
        return false;
      }

      const matchDay = getDayKey(match.date);
      if (dayFilter !== "ALL" && matchDay !== dayFilter) {
        return false;
      }

      return true;
    }),
    [matches, statusFilter, locationFilter, dayFilter]
  );

  const orderedMatches = [...filteredMatches].sort((left, right) => {
    if (!left.date && !right.date) return 0;
    if (!left.date) return 1;
    if (!right.date) return -1;
    return new Date(left.date).getTime() - new Date(right.date).getTime();
  });

  const groupedMatches = orderedMatches.reduce<Record<string, CalendarMatch[]>>((acc, match) => {
    const key = getCalendarKey(match.date);
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(match);
      return acc;
  }, {});

  const scheduledDayKeys = Object.keys(groupedMatches).filter((key) => key !== "Sin fecha").sort((left, right) => left.localeCompare(right));
  const calendarDays = useMemo(() => {
    if (scheduledDayKeys.length === 0) {
      return [] as Array<{ key: string; label: string; matches: CalendarMatch[]; isCurrentMonth: boolean }>;
    }

    const firstDay = startOfCalendarWeek(new Date(`${scheduledDayKeys[0]}T00:00:00`));
    const lastDay = endOfCalendarWeek(new Date(`${scheduledDayKeys[scheduledDayKeys.length - 1]}T00:00:00`));
    const referenceMonth = new Date(`${scheduledDayKeys[0]}T00:00:00`).getMonth();
    const days: Array<{ key: string; label: string; matches: CalendarMatch[]; isCurrentMonth: boolean }> = [];

    for (const cursor = new Date(firstDay); cursor <= lastDay; cursor.setDate(cursor.getDate() + 1)) {
      const key = cursor.toISOString().slice(0, 10);
      days.push({
        key,
        label: getDayLabel(key),
        matches: groupedMatches[key] ?? [],
        isCurrentMonth: cursor.getMonth() === referenceMonth,
      });
    }

    return days;
  }, [groupedMatches, scheduledDayKeys]);

  const unscheduledMatches = groupedMatches["Sin fecha"] ?? [];
  const weekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as MatchStatus | "ALL")} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option value="ALL">Todos</option>
              {MATCH_STATUSES.map((status) => (
                <option key={status} value={status}>{getMatchStatusPresentation(status).label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Sede / Lugar</span>
            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option value="ALL">Todos</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Día</span>
            <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option value="ALL">Todos</option>
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                    {formatDayOption(day)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {calendarDays.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Calendario de partidos</h3>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {weekdays.map((weekday) => (
              <div key={weekday} className="border-r border-slate-200 px-2 py-3 last:border-r-0">{weekday}</div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7">
            {calendarDays.map((day) => (
              <div key={day.key} className={`min-h-[220px] border-r border-b border-slate-200 p-3 last:border-r-0 ${day.isCurrentMonth ? "bg-white" : "bg-slate-50/60"}`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${day.matches.length > 0 ? "text-slate-700" : "text-slate-400"}`}>
                    {day.label}
                  </span>
                  {day.matches.length > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      {day.matches.length}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {day.matches.map((match) => {
                    const statusPresentation = getMatchStatusPresentation(match.status);
                    return (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => setSelectedMatch(match)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold uppercase tracking-wide text-slate-600">{getPhaseLabel(match)}</span>
                          <span className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${statusPresentation.className}`}>
                            {statusPresentation.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{formatTimeLabel(match.date)}</div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="truncate font-semibold text-slate-700">{getTeamLabel(match.homeTeam).name}</div>
                          <div className="text-center font-mono text-xs font-bold text-slate-400">
                            {match.isFinished ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : "vs"}
                          </div>
                          <div className="truncate font-semibold text-slate-700">{getTeamLabel(match.awayTeam).name}</div>
                        </div>
                        <div className="mt-2 truncate text-[11px] text-slate-500">{match.location ?? "Lugar por definir"}</div>
                        {match.incidentType && (
                          <div className="mt-2 text-[11px] font-medium text-amber-700">{getMatchIncidentLabel(match.incidentType)}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {unscheduledMatches.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Partidos sin fecha asignada</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {unscheduledMatches.map((match) => {
              const statusPresentation = getMatchStatusPresentation(match.status);
              return (
                <li key={match.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {getPhaseLabel(match)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusPresentation.className}`}>
                      {statusPresentation.label}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="text-sm md:text-right">
                      <div className="font-semibold text-slate-700">{getTeamLabel(match.homeTeam).name}</div>
                    </div>
                    <div className="min-w-[92px] rounded-lg bg-slate-100 px-3 py-2 text-center font-mono text-sm font-bold text-slate-600">vs</div>
                    <div className="text-sm">
                      <div className="font-semibold text-slate-700">{getTeamLabel(match.awayTeam).name}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {filteredMatches.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
          No hay partidos que coincidan con los filtros actuales.
        </div>
      )}

      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onClick={() => setSelectedMatch(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Detalle del evento</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{getPhaseLabel(selectedMatch)}</h3>
              </div>
              <button type="button" onClick={() => setSelectedMatch(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200">
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-1 text-sm">
                <span className="text-slate-500">Partido</span>
                <span className="font-semibold text-slate-800">{getTeamLabel(selectedMatch.homeTeam).name} vs {getTeamLabel(selectedMatch.awayTeam).name}</span>
              </div>
              <div className="grid gap-1 text-sm">
                <span className="text-slate-500">Fecha y hora</span>
                <span className="font-semibold text-slate-800">{formatDateTimeLabel(selectedMatch.date)}</span>
              </div>
              <div className="grid gap-1 text-sm">
                <span className="text-slate-500">Lugar</span>
                <span className="font-semibold text-slate-800">{selectedMatch.location ?? "Lugar por definir"}</span>
              </div>
              <div className="grid gap-1 text-sm">
                <span className="text-slate-500">Estado</span>
                <span className="font-semibold text-slate-800">{getMatchStatusPresentation(selectedMatch.status).label}</span>
              </div>
              <div className="grid gap-1 text-sm">
                <span className="text-slate-500">Marcador</span>
                <span className="font-semibold text-slate-800">{selectedMatch.isFinished ? `${selectedMatch.homeScore ?? 0} - ${selectedMatch.awayScore ?? 0}` : "Pendiente"}</span>
              </div>
              {selectedMatch.incidentType && (
                <div className="grid gap-1 text-sm">
                  <span className="text-slate-500">Incidencia</span>
                  <span className="font-semibold text-amber-700">{getMatchIncidentLabel(selectedMatch.incidentType)}</span>
                </div>
              )}
              {selectedMatch.incidentNotes && (
                <div className="grid gap-1 text-sm">
                  <span className="text-slate-500">Notas</span>
                  <span className="font-semibold text-slate-800">{selectedMatch.incidentNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}