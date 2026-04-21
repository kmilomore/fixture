"use client";

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
  editingMatch,
  setEditingMatch,
  isPending,
  onReset,
}: GeneratedFixtureViewProps) {
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
          {standingsByGroup.map((group) => (
            <StandingsTable key={group.key} group={group} />
          ))}
        </div>
      )}

      {Object.entries(matchesByGroup).map(([groupKey, groupMatches]) => (
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
    </div>
  );
}