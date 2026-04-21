"use client";

import { CalendarDays } from "lucide-react";
import type { MatchWithTeams } from "@/features/fixture/types";
import { MatchRow } from "@/features/fixture/presentation/MatchRow";

type MatchGroupProps = {
  tournamentId: string;
  groupKey: string;
  matches: MatchWithTeams[];
  format: string | null;
  editingMatch: string | null;
  setEditingMatch: (id: string | null) => void;
};

export function MatchGroup({
  tournamentId,
  groupKey,
  matches,
  format,
  editingMatch,
  setEditingMatch,
}: MatchGroupProps) {
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
        {matches.map((match) => (
          <MatchRow
            key={match.id}
            tournamentId={tournamentId}
            match={match}
            isEditing={editingMatch === match.id}
            onEdit={() => setEditingMatch(match.id)}
            onCancelEdit={() => setEditingMatch(null)}
          />
        ))}
      </ul>
    </div>
  );
}