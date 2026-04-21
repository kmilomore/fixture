"use client";

import { useState, useTransition } from "react";
import { setTournamentFormat, generateFixture, resetFixture, updateMatchResult } from "../../actions/fixture";
import { Trophy, Zap, RefreshCw, CalendarDays, Edit3, CheckCircle2, FileSpreadsheet, FileText } from "lucide-react";
import {
  estimateFixtureMatchCount,
  estimateRequiredMatchdays,
  type FixtureFormat,
  type FixtureGenerationOptions,
  type FixtureSchedulingRules,
} from "@/lib/fixtureEngine";
import { DEFAULT_SCHEDULING_RULES, type TournamentStatus } from "@/lib/tournamentLifecycle";

type Team = { id: string; name: string; establishment: { name: string } };
type MatchWithTeams = {
  id: string;
  round: number | null;
  groupName: string | null;
  matchLogicIdentifier: string | null;
  date: string | null;
  location: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  homeTeam: Team | null;
  awayTeam: Team | null;
};

type Props = {
  tournament: {
    id: string;
    format: string | null;
    status: TournamentStatus;
    schedulingRules?: FixtureSchedulingRules;
    teams: { team: Team }[];
    matches: MatchWithTeams[];
  };
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

function getPlaceholderTeams(match: MatchWithTeams) {
  if (match.homeTeam || match.awayTeam || !match.matchLogicIdentifier || !match.matchLogicIdentifier.includes(" vs ")) {
    return null;
  }

  const [homeLabel, awayLabel] = match.matchLogicIdentifier.split(" vs ");
  return {
    home: homeLabel,
    away: awayLabel,
  };
}

export function FixtureEngine({ tournament }: Props) {
  const schedulingRules = tournament.schedulingRules ?? DEFAULT_SCHEDULING_RULES;
  const [selectedFormat, setSelectedFormat] = useState<FixtureFormat | null>(
    (tournament.format as FixtureFormat) || null
  );
  const [groupCount, setGroupCount] = useState(1);
  const [startDate, setStartDate] = useState(schedulingRules.startDate);
  const [endDate, setEndDate] = useState(schedulingRules.endDate);
  const [matchesPerMatchday, setMatchesPerMatchday] = useState(schedulingRules.matchesPerMatchday);
  const [dailyStartTime, setDailyStartTime] = useState(schedulingRules.dailyStartTime);
  const [dailyEndTime, setDailyEndTime] = useState(schedulingRules.dailyEndTime);
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(schedulingRules.matchDurationMinutes);
  const [allowedWeekdays, setAllowedWeekdays] = useState<number[]>(schedulingRules.allowedWeekdays);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
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
    if (!options) return;
    startTransition(async () => {
      setMsg(null);
      await setTournamentFormat(tournament.id, options.format, options.schedulingRules);
      const result = await generateFixture(tournament.id, options);
      if (result.error) setMsg(`❌ ${result.error}`);
      else setMsg(`✅ Fixture generado: ${result.count} partidos creados.`);
    });
  }

  function handleReset() {
    if (!confirm("¿Estás seguro de eliminar todos los partidos y reiniciar?")) return;
    startTransition(async () => {
      setSelectedFormat(null);
      setMsg(null);
      await resetFixture(tournament.id);
    });
  }

  // Agrupar partidos
  const matchesByGroup = tournament.matches.reduce<Record<string, MatchWithTeams[]>>((acc, m) => {
    const key = m.groupName || m.matchLogicIdentifier || `Ronda ${m.round}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {/* ── Configurador (sólo si no hay fixture) ── */}
      {!isGenerated && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Configurar Formato
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {/* LIGA */}
            <button
              onClick={() => handleFormatSelection("LIGA")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selectedFormat === "LIGA"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <p className="font-bold text-slate-800 text-base">🏆 Liga / Grupos</p>
              <p className="text-sm text-slate-500 mt-1">
                Todos contra todos. Se generan fechas y se rota equitativamente entre local y visitante.
              </p>
            </button>

            {/* ELIMINATORIA */}
            <button
              onClick={() => handleFormatSelection("ELIMINATORIA")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selectedFormat === "ELIMINATORIA"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <p className="font-bold text-slate-800 text-base">⚡ Copa / Eliminatoria</p>
              <p className="text-sm text-slate-500 mt-1">
                Llaves de eliminación directa. El perdedor queda fuera. Incluye Byes si los equipos no son potencia de 2.
              </p>
            </button>

            <button
              onClick={() => handleFormatSelection("GRUPOS_ELIMINATORIA")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selectedFormat === "GRUPOS_ELIMINATORIA"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <p className="font-bold text-slate-800 text-base">🌍 Grupos + Eliminatoria</p>
              <p className="text-sm text-slate-500 mt-1">
                Fase grupal por grupos y luego fase final. Si hay 3 grupos, avanzan los tres primeros de grupo y el mejor 2°.
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-3">Grupos</h4>
              <label className="block text-sm text-slate-600 mb-2">
                Cantidad de grupos
              </label>
              <input
                type="number"
                min={1}
                max={Math.max(1, tournament.teams.length)}
                value={groupCount}
                onChange={(event) => setGroupCount(Math.max(1, Number(event.target.value) || 1))}
                disabled={selectedFormat === "ELIMINATORIA"}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                En `Liga`, un grupo genera todos contra todos general. Si defines más de un grupo, cada grupo juega su propia fase todos contra todos.
              </p>
              {selectedFormat === "GRUPOS_ELIMINATORIA" && (
                <p className="mt-2 text-xs text-slate-500">
                  Para este formato puedes usar 2, 3, 4, 8 o más grupos en potencia de 2. Con 3 grupos clasifican los tres primeros y el mejor 2°.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-3">Reglas de calendario</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Partidos por fecha</label>
                  <input
                    type="number"
                    min={1}
                    value={matchesPerMatchday}
                    onChange={(event) => setMatchesPerMatchday(Math.max(1, Number(event.target.value) || 1))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Define cuántos partidos se pueden jugar por cada fecha. Con esto el sistema calcula automáticamente cuántos días reales necesita reservar.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Hora inicial</label>
                  <input
                    type="time"
                    value={dailyStartTime}
                    onChange={(event) => setDailyStartTime(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Hora final</label>
                  <input
                    type="time"
                    value={dailyEndTime}
                    onChange={(event) => setDailyEndTime(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Duración por partido (minutos)</label>
                  <input
                    type="number"
                    min={30}
                    step={5}
                    value={matchDurationMinutes}
                    onChange={(event) => setMatchDurationMinutes(Math.max(30, Number(event.target.value) || 30))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {selectedFormat
                  ? `Con la configuración actual se programarán ${estimatedMatchCount} partidos en ${estimatedMatchdays} fecha${estimatedMatchdays === 1 ? "" : "s"} de juego.`
                  : "Selecciona un formato para calcular cuántas fechas serán necesarias."}
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-slate-200 p-4 bg-slate-50">
            <h4 className="font-semibold text-slate-800 mb-3">Días habilitados de juego</h4>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((weekday) => {
                const isActive = allowedWeekdays.includes(weekday.value);
                return (
                  <button
                    key={weekday.value}
                    type="button"
                    onClick={() => toggleWeekday(weekday.value)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    {weekday.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              El sistema asigna automáticamente fechas y horas sin repetir horarios, usando solo los días necesarios según los partidos por fecha definidos.
            </p>
          </div>

          {msg && <p className="text-sm mb-4 font-medium">{msg}</p>}

          <button
            onClick={handleGenerate}
            disabled={!selectedFormat || isPending || tournament.teams.length < 2}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            {isPending ? "Generando..." : `Generar Fixture (${tournament.teams.length} equipos)`}
          </button>

          {tournament.teams.length < 2 && (
            <p className="text-xs text-red-500 mt-2 text-center">Necesitas al menos 2 equipos para generar el fixture.</p>
          )}
        </div>
      )}

      {/* ── Fixture generado ── */}
      {isGenerated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                tournament.format === "LIGA"
                  ? "bg-emerald-100 text-emerald-700"
                  : tournament.format === "GRUPOS_ELIMINATORIA"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-indigo-100 text-indigo-700"
              }`}>
                {tournament.format === "LIGA"
                  ? "🏆 Formato Liga"
                  : tournament.format === "GRUPOS_ELIMINATORIA"
                    ? "🌍 Grupos + Eliminatoria"
                    : "⚡ Eliminatoria"}
              </span>
              <span className="text-sm text-slate-500">{tournament.matches.length} partidos</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <a
                href={`/api/tournaments/${tournament.id}/export/pdf`}
                className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" /> Exportar PDF
              </a>
              <a
                href={`/api/tournaments/${tournament.id}/export/excel`}
                className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
              </a>
              <button
                onClick={handleReset}
                disabled={isPending}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reiniciar
              </button>
            </div>
          </div>

          {Object.entries(matchesByGroup).map(([groupKey, groupMatches]) => (
            <MatchGroup
              key={groupKey}
              groupKey={groupKey}
              matches={groupMatches}
              format={tournament.format}
              editingMatch={editingMatch}
              setEditingMatch={setEditingMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function MatchGroup({
  groupKey,
  matches,
  format,
  editingMatch,
  setEditingMatch,
}: {
  groupKey: string;
  matches: MatchWithTeams[];
  format: string | null;
  editingMatch: string | null;
  setEditingMatch: (id: string | null) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 font-bold text-sm flex items-center gap-2 ${
        format === "LIGA" 
          ? "bg-emerald-50 text-emerald-800 border-b border-emerald-100" 
          : "bg-indigo-50 text-indigo-800 border-b border-indigo-100"
      }`}>
        <CalendarDays className="w-4 h-4" />
        {groupKey}
      </div>
      <ul className="divide-y divide-slate-100">
        {matches.map((m) => (
          <MatchRow
            key={m.id}
            match={m}
            isEditing={editingMatch === m.id}
            onEdit={() => setEditingMatch(m.id)}
            onCancelEdit={() => setEditingMatch(null)}
          />
        ))}
      </ul>
    </div>
  );
}


function MatchRow({
  match,
  isEditing,
  onEdit,
  onCancelEdit,
}: {
  match: MatchWithTeams;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [hs, setHs] = useState(match.homeScore?.toString() ?? "");
  const [as_, setAs] = useState(match.awayScore?.toString() ?? "");
  const [loc, setLoc] = useState(match.location ?? "");
  const [dt, setDt] = useState(
    match.date ? new Date(match.date).toISOString().slice(0, 16) : ""
  );

  function handleSave() {
    startTransition(async () => {
      await updateMatchResult(match.id, Number(hs), Number(as_), loc, dt);
      onCancelEdit();
    });
  }

  const isBye = !match.homeTeam || !match.awayTeam;
  const placeholderTeams = getPlaceholderTeams(match);
  const homeLabel = match.homeTeam?.name ?? placeholderTeams?.home ?? "BYE";
  const awayLabel = match.awayTeam?.name ?? placeholderTeams?.away ?? "BYE";
  const isPlaceholderMatch = !match.homeTeam && !match.awayTeam && Boolean(placeholderTeams);
  const matchdayLabel = match.matchLogicIdentifier && !match.matchLogicIdentifier.includes(" vs ")
    ? match.matchLogicIdentifier
    : null;

  return (
    <li className={`px-4 py-3 ${isBye && !isPlaceholderMatch ? "bg-slate-50 opacity-60" : ""}`}>
      {matchdayLabel && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {matchdayLabel}
          </span>
        </div>
      )}
      {/* Teams row */}
      <div className="flex items-center gap-3">
        <span className={`flex-1 text-right font-semibold text-sm ${match.isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-emerald-700" : "text-slate-700"}`}>
          {homeLabel}
        </span>

        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg font-mono font-bold text-sm min-w-[70px] justify-center ${
          match.isFinished ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {match.isFinished ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        </div>

        <span className={`flex-1 font-semibold text-sm ${match.isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-emerald-700" : "text-slate-700"}`}>
          {awayLabel}
        </span>

        {!isBye && !isPlaceholderMatch && (
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
            title="Editar resultado/fecha"
          >
            {match.isFinished ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Edit3 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Meta info */}
      {(match.date || match.location) && !isEditing && (
        <div className="flex gap-3 mt-1 pl-1 text-xs text-slate-400">
          {match.date && <span>📅 {new Date(match.date).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}</span>}
          {match.location && <span>📍 {match.location}</span>}
        </div>
      )}

      {/* Inline edit form */}
      {isEditing && (
        <div className="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-200 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Marcador Local</label>
            <input type="number" min="0" value={hs} onChange={(e) => setHs(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Marcador Visita</label>
            <input type="number" min="0" value={as_} onChange={(e) => setAs(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Fecha y Hora</label>
            <input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Cancha / Lugar</label>
            <input type="text" placeholder="Ej: Estadio Municipal" value={loc} onChange={(e) => setLoc(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-1">
            <button onClick={onCancelEdit} className="text-sm px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600">Cancelar</button>
            <button onClick={handleSave} disabled={isPending} className="text-sm px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
