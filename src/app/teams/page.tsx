import prisma from "@/lib/prisma";
import { Users, Shield, Building2 } from "lucide-react";
import { NewTeamForm, DeleteTeamButton } from "./Components";

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      establishment: true
    }
  });

  const establishments = await prisma.establishment.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Users className="text-slate-400 w-6 h-6" />
            Directorio de Equipos
          </h2>
          <p className="text-slate-500 mt-1">
            Cada establecimiento genera su equipo base automáticamente y puedes seguir agregando más equipos si lo necesitas.
          </p>
        </div>
        <NewTeamForm establishments={establishments} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-indigo-50 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                 </div>
                 <h3 className="font-bold text-slate-800 ml-1">{team.name}</h3>
              </div>
              <DeleteTeamButton id={team.id} />
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2 mt-4">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Establecimiento / Institución</p>
                 <p className="text-sm font-medium text-slate-700">{team.establishment.name}</p>
              </div>
            </div>
          </div>
        ))}
        
        {teams.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No hay equipos creados</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Antes de crear un torneo, necesitas agregar equipos. Asegúrate de tener al menos un establecimiento registrado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
