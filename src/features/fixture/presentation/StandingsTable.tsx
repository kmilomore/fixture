import type { StandingGroup } from "@/features/fixture/types";

export function StandingsTable({ group }: { group: StandingGroup }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{group.label}</h3>
          <p className="text-xs text-slate-500">Partidos cerrados: {group.playedMatches} · Pendientes: {group.pendingMatches}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          Tabla de posiciones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Equipo</th>
              <th className="px-3 py-3 text-center">PJ</th>
              <th className="px-3 py-3 text-center">PG</th>
              <th className="px-3 py-3 text-center">PE</th>
              <th className="px-3 py-3 text-center">PP</th>
              <th className="px-3 py-3 text-center">GF</th>
              <th className="px-3 py-3 text-center">GC</th>
              <th className="px-3 py-3 text-center">DG</th>
              <th className="px-3 py-3 text-center">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {group.rows.map((row, index) => (
              <tr key={row.teamId} className={index < 2 ? "bg-emerald-50/50" : "bg-white"}>
                <td className="px-4 py-3 font-semibold text-slate-600">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{row.teamName}</div>
                  <div className="text-xs text-slate-500">{row.establishmentName}</div>
                </td>
                <td className="px-3 py-3 text-center text-slate-700">{row.played}</td>
                <td className="px-3 py-3 text-center text-slate-700">{row.wins}</td>
                <td className="px-3 py-3 text-center text-slate-700">{row.draws}</td>
                <td className="px-3 py-3 text-center text-slate-700">{row.losses}</td>
                <td className="px-3 py-3 text-center text-slate-700">{row.goalsFor}</td>
                <td className="px-3 py-3 text-center text-slate-700">{row.goalsAgainst}</td>
                <td className="px-3 py-3 text-center font-semibold text-slate-800">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                <td className="px-3 py-3 text-center font-bold text-slate-900">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}