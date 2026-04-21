import { Trophy, CalendarDays, Building2, Users } from "lucide-react";
import Link from "next/link";

export default function FixturePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fixture General</h2>
        <p className="text-slate-500 mt-1">Vista global de todos los torneos y su estado actual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/tournaments" className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-emerald-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Trophy className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700">Gestionar Torneos</h3>
          </div>
          <p className="text-sm text-slate-500">Crea torneos, inscribe equipos y genera fixtures automáticos en formato Liga o Eliminatoria.</p>
        </Link>

        <Link href="/establishments" className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Building2 className="w-7 h-7 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700">Establecimientos</h3>
          </div>
          <p className="text-sm text-slate-500">Registra colegios y clubes manualmente o carga masiva desde un archivo CSV.</p>
        </Link>

        <Link href="/teams" className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Equipos</h3>
          </div>
          <p className="text-sm text-slate-500">Administra los equipos y su establecimiento de origen para inscribirlos en competencias.</p>
        </Link>

        <Link href="/disciplines" className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-amber-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <CalendarDays className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-700">Disciplinas y Categorías</h3>
          </div>
          <p className="text-sm text-slate-500">Define los deportes y los niveles de competencia (Sub-14, Adultos, Masculino, Femenino).</p>
        </Link>
      </div>
    </div>
  );
}
