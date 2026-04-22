"use client";

import { Trophy, Zap } from "lucide-react";
import type { FixtureFormat } from "@/features/fixture/domain/fixture-engine";

type WeekdayOption = {
  value: number;
  label: string;
};

type FixtureConfiguratorProps = {
  selectedFormat: FixtureFormat | null;
  groupCount: number;
  teamCount: number;
  startDate: string;
  endDate: string;
  matchesPerMatchday: number;
  dailyStartTime: string;
  dailyEndTime: string;
  matchDurationMinutes: number;
  allowedWeekdays: number[];
  weekdays: WeekdayOption[];
  estimatedMatchCount: number;
  estimatedMatchdays: number;
  isPending: boolean;
  message: string | null;
  onSelectFormat: (format: FixtureFormat) => void;
  onSetGroupCount: (value: number) => void;
  onSetStartDate: (value: string) => void;
  onSetEndDate: (value: string) => void;
  onSetMatchesPerMatchday: (value: number) => void;
  onSetDailyStartTime: (value: string) => void;
  onSetDailyEndTime: (value: string) => void;
  onSetMatchDurationMinutes: (value: number) => void;
  onToggleWeekday: (day: number) => void;
  onGenerate: () => void;
};

export function FixtureConfigurator({
  selectedFormat,
  groupCount,
  teamCount,
  startDate,
  endDate,
  matchesPerMatchday,
  dailyStartTime,
  dailyEndTime,
  matchDurationMinutes,
  allowedWeekdays,
  weekdays,
  estimatedMatchCount,
  estimatedMatchdays,
  isPending,
  message,
  onSelectFormat,
  onSetGroupCount,
  onSetStartDate,
  onSetEndDate,
  onSetMatchesPerMatchday,
  onSetDailyStartTime,
  onSetDailyEndTime,
  onSetMatchDurationMinutes,
  onToggleWeekday,
  onGenerate,
}: FixtureConfiguratorProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" /> Configurar Formato
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <button
          onClick={() => onSelectFormat("LIGA")}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            selectedFormat === "LIGA" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-400"
          }`}
        >
          <p className="font-bold text-slate-800 text-base">🏆 Liga / Grupos</p>
          <p className="text-sm text-slate-500 mt-1">
            Todos contra todos. Se generan fechas y se rota equitativamente entre local y visitante.
          </p>
        </button>

        <button
          onClick={() => onSelectFormat("ELIMINATORIA")}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            selectedFormat === "ELIMINATORIA" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-400"
          }`}
        >
          <p className="font-bold text-slate-800 text-base">⚡ Copa / Eliminatoria</p>
          <p className="text-sm text-slate-500 mt-1">
            Llaves de eliminacion directa. El perdedor queda fuera. Incluye byes si los equipos no son potencia de 2.
          </p>
        </button>

        <button
          onClick={() => onSelectFormat("GRUPOS_ELIMINATORIA")}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            selectedFormat === "GRUPOS_ELIMINATORIA" ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-400"
          }`}
        >
          <p className="font-bold text-slate-800 text-base">🌍 Grupos + Eliminatoria</p>
          <p className="text-sm text-slate-500 mt-1">
            Fase grupal por grupos y luego fase final. Si hay 3 grupos, avanzan los tres primeros y el mejor segundo.
          </p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
          <h4 className="font-semibold text-slate-800 mb-3">Grupos</h4>
          <label className="block text-sm text-slate-600 mb-2">Cantidad de grupos</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, teamCount)}
            value={groupCount}
            onChange={(event) => onSetGroupCount(Math.max(1, Number(event.target.value) || 1))}
            disabled={selectedFormat === "ELIMINATORIA"}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-slate-500">
            En Liga, un grupo genera todos contra todos general. Si defines mas de un grupo, cada grupo juega su propia fase.
          </p>
          {selectedFormat === "GRUPOS_ELIMINATORIA" && (
            <p className="mt-2 text-xs text-slate-500">
              Para este formato puedes usar 2, 3, 4, 8 o mas grupos en potencia de 2. Con 3 grupos clasifican los tres primeros y el mejor segundo.
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
                onChange={(event) => onSetMatchesPerMatchday(Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Define cuantos partidos se pueden jugar por cada fecha. Con esto el sistema calcula cuantos dias reales necesita reservar.
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Desde</label>
              <input type="date" value={startDate} onChange={(event) => onSetStartDate(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hasta</label>
              <input type="date" value={endDate} onChange={(event) => onSetEndDate(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hora inicial</label>
              <input type="time" value={dailyStartTime} onChange={(event) => onSetDailyStartTime(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hora final</label>
              <input type="time" value={dailyEndTime} onChange={(event) => onSetDailyEndTime(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Duracion por partido (minutos)</label>
              <input
                type="number"
                min={30}
                step={5}
                value={matchDurationMinutes}
                onChange={(event) => onSetMatchDurationMinutes(Math.max(30, Number(event.target.value) || 30))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {selectedFormat
              ? `Con la configuracion actual se programaran ${estimatedMatchCount} partidos en ${estimatedMatchdays} fecha${estimatedMatchdays === 1 ? "" : "s"} de juego.`
              : "Selecciona un formato para calcular cuantas fechas seran necesarias."}
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h4 className="font-semibold text-slate-800 mb-3">Dias habilitados de juego</h4>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((weekday) => {
            const isActive = allowedWeekdays.includes(weekday.value);
            return (
              <button
                key={weekday.value}
                type="button"
                onClick={() => onToggleWeekday(weekday.value)}
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
        onClick={onGenerate}
        disabled={!selectedFormat || isPending || teamCount < 2}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <Trophy className="w-4 h-4" />
        {isPending ? "Generando..." : `Generar Fixture (${teamCount} equipos)`}
      </button>

      {teamCount < 2 && (
        <p className="text-xs text-red-500 mt-2 text-center">Necesitas al menos 2 equipos para generar el fixture.</p>
      )}
    </div>
  );
}