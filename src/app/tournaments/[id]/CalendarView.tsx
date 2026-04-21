import {
  getMatchIncidentLabel,
  getMatchStatusPresentation,
  type MatchIncidentType,
  type MatchStatus,
} from "@/lib/matchLifecycle";

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
  return match.groupName || match.matchLogicIdentifier || "Partido";
}

function getCalendarKey(date: string | null) {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CL", { dateStyle: "full" }).format(new Date(date));
}

function getTeamLabel(team: CalendarMatch["homeTeam"]) {
  if (!team) {
    return "BYE";
  }

  return `${team.name} · ${team.establishment.name}`;
}

export function CalendarView({ matches }: { matches: CalendarMatch[] }) {
  const orderedMatches = [...matches].sort((left, right) => {
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

  return (
    <div className="space-y-4">
      {Object.entries(groupedMatches).map(([dayLabel, dayMatches]) => (
        <section key={dayLabel} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{dayLabel}</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {dayMatches.map((match) => {
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
                    {match.incidentType && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        {getMatchIncidentLabel(match.incidentType)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="text-sm font-semibold text-slate-700 md:text-right">{getTeamLabel(match.homeTeam)}</div>
                    <div className={`min-w-[92px] rounded-lg px-3 py-2 text-center font-mono text-sm font-bold ${match.isFinished ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {match.isFinished ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : "vs"}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{getTeamLabel(match.awayTeam)}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>
                      {match.date
                        ? new Intl.DateTimeFormat("es-CL", { timeStyle: "short" }).format(new Date(match.date))
                        : "Hora por definir"}
                    </span>
                    <span>{match.location ?? "Lugar por definir"}</span>
                    {match.incidentNotes && <span>Nota: {match.incidentNotes}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {matches.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
          El calendario aparecerá aquí una vez que el torneo tenga partidos generados.
        </div>
      )}
    </div>
  );
}