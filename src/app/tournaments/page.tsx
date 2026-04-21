import prisma from "@/lib/prisma";
import { Trophy, CalendarDays, ExternalLink, Settings2 } from "lucide-react";
import { NewTournamentForm, DeleteTournamentButton } from "./Components";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      discipline: true,
      category: true,
      _count: {
        select: { teams: true, matches: true }
      }
    }
  });

  const disciplines = await prisma.discipline.findMany({ orderBy: { name: 'asc' }});
  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'asc' }});

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Trophy className="text-slate-400 w-6 h-6" />
            Gestión de Torneos
          </h2>
          <p className="text-slate-500 mt-1">
            Crea torneos definiendo disciplina y categoría, y comienza a armar tu fixture.
          </p>
        </div>
        <NewTournamentForm disciplines={disciplines} categories={categories} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tournaments.map((t) => (
          <Link href={`/tournaments/${t.id}`} key={t.id} className="block group">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm group-hover:shadow-md transition-all group-hover:border-emerald-300 relative">
              
              <div className="absolute top-4 right-4 z-10">
                <DeleteTournamentButton id={t.id} />
              </div>

              <div className="flex items-start gap-4 mb-3">
                 <div className="p-3 bg-emerald-50 rounded-xl">
                    <Trophy className="w-8 h-8 text-emerald-500" />
                 </div>
                 <div>
                    <h3 className="font-bold text-xl text-slate-800 group-hover:text-emerald-700 transition-colors">{t.name}</h3>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{t.discipline.name}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">{t.category.name} ({t.category.gender})</span>
                    </p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 justify-center py-2 bg-slate-50 rounded-lg">
                    <span className="font-bold text-xl text-slate-700">{t._count.teams}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Equipos</span>
                </div>
                <div className="flex items-center gap-2 justify-center py-2 bg-slate-50 rounded-lg">
                    <span className="font-bold text-xl text-slate-700">{t._count.matches}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Partidos</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-emerald-600 font-medium text-sm">
                <span className="flex items-center gap-1">
                    <Settings2 className="w-4 h-4" /> Configurar Fixture
                </span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

            </div>
          </Link>
        ))}
        
        {tournaments.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No hay torneos creados</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Combina las disciplinas y categorías creadas anteriormente para formar el primer campeonato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
