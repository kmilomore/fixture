import { Trophy, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ManageTournamentTeams, TournamentStatusControls } from "./ClientComponents";
import { FixtureEngine } from "./FixtureEngine";
import { fetchServerApi } from "@/lib/serverApi";
import { getTournamentStatusPresentation, type TournamentStatus } from "@/lib/tournamentLifecycle";
import type { FixtureSchedulingRules } from "@/lib/fixtureEngine";

export const dynamic = 'force-dynamic';

const DETAIL_TABS = [
  { id: "overview", label: "Resumen" },
  { id: "teams", label: "Equipos" },
  { id: "fixture", label: "Fixture" },
] as const;

type DetailTab = (typeof DETAIL_TABS)[number]["id"];

function isDetailTab(value: string): value is DetailTab {
  return DETAIL_TABS.some((tab) => tab.id === value);
}

function TournamentSummaryCard({
  tournament,
}: {
  tournament: {
    teams: Array<unknown>;
    matches: Array<unknown>;
    format: string | null;
  };
}) {
  return (
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
  );
}

export default async function TournamentDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab: DetailTab = isDetailTab(resolvedSearchParams?.tab ?? "") ? resolvedSearchParams!.tab as DetailTab : "overview";

  let tournament: {
    id: string;
    name: string;
    format: string | null;
    status: TournamentStatus;
    schedulingRules: FixtureSchedulingRules;
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
    schedulingRules: tournament.schedulingRules,
    teams: tournament.teams,
    matches: tournament.matches.map(m => ({
      ...m,
      date: m.date ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }))
  };

  const isGenerated = ["SCHEDULED", "PLAYING", "PAUSED", "FINISHED"].includes(tournament.status);
  const statusPresentation = getTournamentStatusPresentation(tournament.status);

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
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusPresentation.className}`}>
            {statusPresentation.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={`/tournaments/${tournament.id}?tab=${tab.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1 min-w-0">
            <TournamentSummaryCard tournament={tournament} />
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider text-slate-500">Estado operativo</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Equipos inscritos: <span className="font-semibold text-slate-800">{tournament.teams.length}</span></p>
                <p>Partidos generados: <span className="font-semibold text-slate-800">{tournament.matches.length}</span></p>
                <p>Calendario: <span className="font-semibold text-slate-800">{tournament.schedulingRules.startDate} a {tournament.schedulingRules.endDate}</span></p>
              </div>
            </div>
            <TournamentStatusControls tournamentId={tournament.id} currentStatus={tournament.status} />
          </div>
          <div className="lg:col-span-2 min-w-0 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3">Próximo paso</h4>
              <p className="text-sm text-slate-600">
                {tournament.status === "DRAFT"
                  ? "Define formato y agrega al menos dos equipos para dejar el torneo listo para programar."
                  : tournament.status === "READY"
                    ? "El torneo ya puede generar fixture con las reglas de calendario persistidas."
                    : tournament.status === "SCHEDULED"
                      ? "El fixture ya fue programado; ahora puedes cargar resultados y ajustar fechas puntuales."
                      : tournament.status === "PLAYING"
                        ? "El torneo ya está en juego; usa la pestaña Fixture para continuar la operación."
                        : tournament.status === "FINISHED"
                          ? "El torneo terminó; usa Fixture para revisar partidos y exportaciones."
                          : "El torneo está en un estado manual y requiere intervención administrativa."}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider text-slate-500">Equipos participantes</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tournament.teams.map((tt) => (
                  <li key={tt.team.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <p className="font-semibold text-slate-700">{tt.team.name}</p>
                    <p className="text-xs text-slate-400">{tt.team.establishment.name}</p>
                  </li>
                ))}
                {tournament.teams.length === 0 && <li className="text-sm text-slate-500">No hay equipos inscritos todavía.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1 min-w-0">
            <TournamentSummaryCard tournament={tournament} />
          </div>
          <div className="lg:col-span-2 min-w-0">
            {!isGenerated ? (
              <ManageTournamentTeams
                tournamentId={tournament.id}
                availableTeams={availableTeams}
                currentTeams={tournament.teams}
              />
            ) : (
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
        </div>
      )}

      {activeTab === "fixture" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1 min-w-0">
            <TournamentSummaryCard tournament={tournament} />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <FixtureEngine tournament={serializedTournament} />
          </div>
        </div>
      )}
    </div>
  );
}
