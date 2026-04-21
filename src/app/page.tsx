import { Trophy, Users, Building2, Activity } from "lucide-react";
import { fetchServerApi } from "@/lib/serverApi";

export default async function DashboardPage() {
  let establishmentsCount = 0;
  let teamsCount = 0;
  let tournamentsCount = 0;
  let matchesCount = 0;
  let dataUnavailable = false;

  try {
    const dashboard = await fetchServerApi<{
      establishments: number;
      teams: number;
      tournaments: number;
      matches: number;
    }>("/api/dashboard");
    establishmentsCount = dashboard.establishments;
    teamsCount = dashboard.teams;
    tournamentsCount = dashboard.tournaments;
    matchesCount = dashboard.matches;
  } catch (error) {
    dataUnavailable = true;
    console.error("Dashboard stats unavailable:", error);
  }
  
  const stats = [
    { name: 'Establecimientos', value: establishmentsCount, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Equipos Registrados', value: teamsCount, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { name: 'Torneos Registrados', value: tournamentsCount, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { name: 'Partidos Registrados', value: matchesCount, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard General</h2>
        <p className="text-slate-500 mt-1">Resumen operativo del sistema web de fixtures.</p>
        {dataUnavailable ? (
          <p className="text-amber-600 mt-2 text-sm">
            La base de datos todavia no responde con la estructura esperada. La app sigue disponible mientras terminas la configuracion.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center">
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-4">
            Torneos Recientes
          </h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-slate-400 w-8 h-8" />
            </div>
            <p className="text-slate-600 font-medium">No hay torneos registrados</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Crea tu primer torneo para comenzar a generar los fixtures y realizar el seguimiento de los partidos.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-4">
            Próximos Partidos
          </h3>
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <Activity className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">El calendario está vacío</p>
          </div>
        </div>
      </div>
    </div>
  );
}
