"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, FileText, RefreshCw } from "lucide-react";
import { MatchGroup } from "@/features/fixture/presentation/MatchGroup";
import { StandingsTable } from "@/features/fixture/presentation/StandingsTable";
import type { MatchWithTeams, StandingGroup } from "@/features/fixture/types";

type GeneratedFixtureViewProps = {
  tournamentId: string;
  tournamentFormat: string | null;
  matchesCount: number;
  standingsByGroup: StandingGroup[];
  matchesByGroup: Record<string, MatchWithTeams[]>;
  defaultViewMode?: "all" | "groups" | "knockout";
  editingMatch: string | null;
  setEditingMatch: (id: string | null) => void;
  isPending: boolean;
  onReset: () => void;
};

export function GeneratedFixtureView({
  tournamentId,
  tournamentFormat,
  matchesCount,
  standingsByGroup,
  matchesByGroup,
  defaultViewMode = "all",
  editingMatch,
  setEditingMatch,
  isPending,
  onReset,
}: GeneratedFixtureViewProps) {
  const [viewMode, setViewMode] = useState<"all" | "groups" | "knockout">(defaultViewMode);
  const groupStageEntries = useMemo(
    () => Object.entries(matchesByGroup).filter(([groupKey]) => groupKey.startsWith("Grupo ")),
    [matchesByGroup]
  );
  const knockoutEntries = useMemo(
    () => Object.entries(matchesByGroup).filter(([groupKey]) => !groupKey.startsWith("Grupo ")),
    [matchesByGroup]
  );
  const visibleEntries = viewMode === "groups" ? groupStageEntries : viewMode === "knockout" ? knockoutEntries : Object.entries(matchesByGroup);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            tournamentFormat === "LIGA"
              ? "bg-emerald-100 text-emerald-700"
              : tournamentFormat === "GRUPOS_ELIMINATORIA"
                ? "bg-sky-100 text-sky-700"
                : "bg-indigo-100 text-indigo-700"
          }`}>
            {tournamentFormat === "LIGA"
              ? "🏆 Formato Liga"
              : tournamentFormat === "GRUPOS_ELIMINATORIA"
                ? "🌍 Grupos + Eliminatoria"
                : "⚡ Eliminatoria"}
          </span>
          <span className="text-sm text-slate-500">{matchesCount} partidos</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href={`/api/tournaments/${tournamentId}/export/pdf`}
            className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" /> Exportar PDF
          </a>
          <a
            href={`/api/tournaments/${tournamentId}/export/excel`}
            className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
          </a>
          <button
            type="button"
            onClick={onReset}
            disabled={isPending}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reiniciar
          </button>
        </div>
      </div>

      {standingsByGroup.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Posiciones y parciales por grupo</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Revisa la tabla parcial de cada grupo y alterna entre resultados grupales, llaves eliminatorias o la vista completa del fixture.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("all")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Todo
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("groups")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "groups" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Fase grupal
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("knockout")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "knockout" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  Eliminatoria
                </button>
              </div>
            </div>
          </div>

          {standingsByGroup.map((group) => (
            <StandingsTable key={group.key} group={group} />
          ))}
        </div>
      )}

      {visibleEntries.map(([groupKey, groupMatches]) => (
        <MatchGroup
          key={groupKey}
          tournamentId={tournamentId}
          groupKey={groupKey}
          matches={groupMatches}
          format={tournamentFormat}
          editingMatch={editingMatch}
          setEditingMatch={setEditingMatch}
        />
      ))}

      {viewMode === "groups" && groupStageEntries.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
          Este torneo no tiene fase grupal disponible para mostrar.
        </div>
      )}

      {viewMode === "knockout" && knockoutEntries.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
          Las llaves eliminatorias todavía no tienen cruces visibles.
        </div>
      )}
    </div>
  );
}