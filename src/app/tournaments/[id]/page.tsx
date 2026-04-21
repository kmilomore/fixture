import { Trophy, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ManageTournamentTeams } from "./ClientComponents";
import { FixtureEngine } from "./FixtureEngine";
import { fetchServerApi } from "@/lib/serverApi";

export const dynamic = 'force-dynamic';

export default async function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let tournament: {
    id: string;
    name: string;
    format: string | null;
    status: string;
    discipline: { id: string; name: string };
    category: { id: string; name: string; gender: string };
    teams: Array<{
      id: string;
      tournamentId: string;
      teamId: string;
      team: {
        id: string;
        name: string;
        establishmentId: string;
        establishment: { id: string; name: string; comuna?: string | null };
        createdAt: string;
        updatedAt: string;
      };
    }>;
    matches: Array<{
      id: string;
      tournamentId: string;
      homeTeamId: string | null;
      awayTeamId: string | null;
      date: string | null;
      location: string | null;
      homeScore: number | null;
      awayScore: number | null;
      isFinished: boolean;
      round: number | null;
      groupName: string | null;
      matchLogicIdentifier: string | null;
      createdAt: string;
      updatedAt: string;
      homeTeam: {
        id: string;
        name: string;
        establishmentId: string;
        establishment: { id: string; name: string; comuna?: string | null };
        createdAt: string;
        updatedAt: string;
      } | null;
      awayTeam: {
        id: string;
        name: string;
        establishmentId: string;
        establishment: { id: string; name: string; comuna?: string | null };
        createdAt: string;
        updatedAt: string;
      } | null;
    }>;
  };
  let availableTeams: Array<{ id: string; name: string; establishment: { name: string } }>;

  try {
    [tournament, availableTeams] = await Promise.all([
      fetchServerApi<typeof tournament>(`/api/tournaments/${id}`),
      fetchServerApi<Array<{ id: string; name: string; establishment: { name: string } }>>("/api/teams"),
    ]);
  } catch {
    notFound();
  }

  // Serializar el torneo para el client component
  const serializedTournament = {
    id: tournament.id,
    format: tournament.format,
    status: tournament.status,
    teams: tournament.teams,
    matches: tournament.matches.map(m => ({
      ...m,
      date: m.date ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }))
  };

  const isGenerated = tournament.status === "PLAYING";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        <Link href="/tournaments" className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Trophy className="text-emerald-500 w-7 h-7" />
            {tournament.name}
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            {tournament.discipline.name} &bull; {tournament.category.name} ({tournament.category.gender})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
            tournament.status === 'PLAYING' ? 'bg-emerald-100 text-emerald-700' : 
            tournament.status === 'FINISHED' ? 'bg-slate-200 text-slate-600' : 
            'bg-amber-100 text-amber-700'
          }`}>
            {tournament.status === 'PLAYING' ? 'En Juego' : tournament.status === 'FINISHED' ? 'Finalizado' : 'Borrador'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna Izquierda: Equipos */}
        <div className="lg:col-span-1 space-y-4 min-w-0">
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Settings className="w-28 h-28" />
            </div>
            <h3 className="text-base font-bold mb-3 relative z-10 text-emerald-400">📊 Resumen</h3>
            <div className="space-y-2 text-sm text-slate-300 relative z-10">
              <p>Equipos: <span className="font-bold text-white">{tournament.teams.length}</span></p>
              <p>Partidos: <span className="font-bold text-white">{tournament.matches.length}</span></p>
              <p>Formato: <span className="font-bold text-white">{tournament.format ?? "Sin definir"}</span></p>
            </div>
          </div>

          {/* Solo mostrar gestión de equipos si no hay fixture generado */}
          {!isGenerated && (
            <ManageTournamentTeams
              tournamentId={tournament.id}
              availableTeams={availableTeams}
              currentTeams={tournament.teams}
            />
          )}

          {isGenerated && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider text-slate-500">Equipos Participantes</h4>
              <ul className="space-y-2">
                {tournament.teams.map(tt => (
                  <li key={tt.team.id} className="text-sm bg-slate-50 px-3 py-2 rounded-lg">
                    <p className="font-semibold text-slate-700">{tt.team.name}</p>
                    <p className="text-xs text-slate-400">{tt.team.establishment.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Columna Derecha: Motor de Fixture */}
        <div className="lg:col-span-2 min-w-0">
          <FixtureEngine tournament={serializedTournament} />
        </div>

      </div>
    </div>
  );
}
