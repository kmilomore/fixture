"use client";

import { Trophy, Zap } from "lucide-react";
import type { FixtureFormat } from "@/features/fixture/domain/fixture-engine";
import type {
  FixtureFormatConfig,
  FixtureSchedulingConfig,
  FixtureConfigHandlers,
} from "@/features/fixture/types";

type WeekdayOption = { value: number; label: string };

type Props = {
  format: FixtureFormatConfig;
  scheduling: FixtureSchedulingConfig;
  estimates: { matchCount: number; matchdays: number };
  teams: Array<{ id: string; name: string; establishment: { name: string } }>;
  weekdays: WeekdayOption[];
  handlers: FixtureConfigHandlers;
  isPending: boolean;
  message: string | null;
};

export function FixtureConfigurator({ format, scheduling, estimates, teams, weekdays, handlers, isPending, message }: Props) {
  const showSeedConfiguration = format.selected !== "ELIMINATORIA" && format.groupCount > 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" /> Configurar Formato
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {(["LIGA", "ELIMINATORIA", "GRUPOS_ELIMINATORIA"] as FixtureFormat[]).map((fmt) => {
          const labels: Record<FixtureFormat, { title: string; description: string; activeClass: string }> = {
            LIGA: {
              title: "🏆 Liga / Grupos",
              description: "Todos contra todos. Se generan fechas y se rota equitativamente entre local y visitante.",
              activeClass: "border-emerald-500 bg-emerald-50",
            },
            ELIMINATORIA: {
              title: "⚡ Copa / Eliminatoria",
              description: "Llaves de eliminacion directa. El perdedor queda fuera. Incluye byes si los equipos no son potencia de 2.",
              activeClass: "border-indigo-500 bg-indigo-50",
            },
            GRUPOS_ELIMINATORIA: {
              title: "🌍 Grupos + Eliminatoria",
              description: "Fase grupal por grupos y luego fase final. Si hay 3 grupos, avanzan los tres primeros y el mejor segundo.",
              activeClass: "border-sky-500 bg-sky-50",
            },
          };
          const meta = labels[fmt];
          return (
            <button
              key={fmt}
              type="button"
              onClick={() => handlers.onSelectFormat(fmt)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                format.selected === fmt ? meta.activeClass : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <p className="font-bold text-slate-800 text-base">{meta.title}</p>
              <p className="text-sm text-slate-500 mt-1">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
          <h4 className="font-semibold text-slate-800 mb-3">Grupos</h4>
          <label className="block text-sm text-slate-600 mb-2">Cantidad de grupos</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, teams.length)}
            value={format.groupCount}
            onChange={(e) => handlers.onSetGroupCount(Math.max(1, Number(e.target.value) || 1))}
            disabled={format.selected === "ELIMINATORIA"}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-slate-500">
            En Liga, un grupo genera todos contra todos general. Si defines mas de un grupo, cada grupo juega su propia fase.
          </p>
          {format.selected === "GRUPOS_ELIMINATORIA" && (
            <p className="mt-2 text-xs text-slate-500">
              Para este formato puedes usar 2, 3, 4, 8 o mas grupos en potencia de 2. Con 3 grupos clasifican los tres primeros y el mejor segundo.
            </p>
          )}

          {showSeedConfiguration && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div>
                <h5 className="text-sm font-semibold text-slate-800">Cabezas de serie</h5>
                <p className="mt-1 text-xs text-slate-500">
                  Puedes fijar un cabeza de serie por grupo. El resto de equipos se reparte automaticamente sin repetir seleccionados.
                </p>
              </div>
              <div className="grid gap-3">
                {Array.from({ length: format.groupCount }, (_, groupIndex) => {
                  const selectedTeamId = format.seededTeamIds[groupIndex] ?? "";
                  const usedSeedIds = format.seededTeamIds.filter((id, i) => id && i !== groupIndex);
                  return (
                    <label key={groupIndex} className="text-sm text-slate-600">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Cabeza de serie {groupIndex + 1}
                      </span>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => handlers.onSetSeededTeamId(groupIndex, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                      >
                        <option value="">Asignacion automatica</option>
                        {teams
                          .filter((t) => !usedSeedIds.includes(t.id) || t.id === selectedTeamId)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} · {t.establishment.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
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
                value={scheduling.matchesPerMatchday}
                onChange={(e) => handlers.onSetMatchesPerMatchday(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Define cuantos partidos se pueden jugar por cada fecha. Con esto el sistema calcula cuantos dias reales necesita reservar.
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Desde</label>
              <input type="date" value={scheduling.startDate} onChange={(e) => handlers.onSetStartDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hasta</label>
              <input type="date" value={scheduling.endDate} onChange={(e) => handlers.onSetEndDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hora inicial</label>
              <input type="time" value={scheduling.dailyStartTime} onChange={(e) => handlers.onSetDailyStartTime(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hora final</label>
              <input type="time" value={scheduling.dailyEndTime} onChange={(e) => handlers.onSetDailyEndTime(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Duracion por partido (minutos)</label>
              <input
                type="number"
                min={30}
                step={5}
                value={scheduling.matchDurationMinutes}
                onChange={(e) => handlers.onSetMatchDurationMinutes(Math.max(30, Number(e.target.value) || 30))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {format.selected
              ? `Con la configuracion actual se programaran ${estimates.matchCount} partidos en ${estimates.matchdays} fecha${estimates.matchdays === 1 ? "" : "s"} de juego.`
              : "Selecciona un formato para calcular cuantas fechas seran necesarias."}
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h4 className="font-semibold text-slate-800 mb-3">Dias habilitados de juego</h4>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((weekday) => {
            const isActive = scheduling.allowedWeekdays.includes(weekday.value);
            return (
              <button
                key={weekday.value}
                type="button"
                onClick={() => handlers.onToggleWeekday(weekday.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                }`}
              >
                {weekday.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          El sistema asigna automaticamente fechas y horas sin repetir horarios, usando solo los dias necesarios segun los partidos por fecha definidos.
        </p>
      </div>

      {message && <p className="text-sm mb-4 font-medium">{message}</p>}

      <button
        type="button"
        onClick={handlers.onGenerate}
        disabled={!format.selected || isPending || teams.length < 2}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <Trophy className="w-4 h-4" />
        {isPending ? "Generando..." : `Generar Fixture (${teams.length} equipos)`}
      </button>

      {teams.length < 2 && (
        <p className="text-xs text-red-500 mt-2 text-center">Necesitas al menos 2 equipos para generar el fixture.</p>
      )}
    </div>
  );
}
