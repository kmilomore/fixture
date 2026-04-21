import { Layers, Medal, Tags } from "lucide-react";
import { AddDisciplineForm, AddCategoryForm } from "./Forms";
import { DeleteDisciplineButton, DeleteCategoryButton } from "./DeleteButtons";
import { fetchServerApi } from "@/lib/serverApi";

export const dynamic = 'force-dynamic';

export default async function DisciplinesPage() {
  let disciplines: Array<{ id: string; name: string; createdAt: string; updatedAt: string }> = [];
  let categories: Array<{ id: string; name: string; gender: string; createdAt: string; updatedAt: string }> = [];
  try {
    const data = await fetchServerApi<{ disciplines: typeof disciplines; categories: typeof categories }>("/api/disciplines");
    disciplines = data.disciplines;
    categories = data.categories;
  } catch {}

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Layers className="text-slate-400 w-6 h-6" />
          Disciplinas y Categorías
        </h2>
        <p className="text-slate-500 mt-1">
          Configura los deportes y los niveles (ej. Sub-14 Masculino, Adultos Mixto) que formarán los torneos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* DISCIPLINAS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Medal className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Deportes (Disciplinas)</h3>
          </div>
          
          <div className="p-5 flex-1 flex flex-col space-y-4">
             <AddDisciplineForm />
             
             <div className="space-y-2 mt-4">
                {disciplines.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay deportes registrados</p>}
                {disciplines.map(d => (
                    <div key={d.id} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">{d.name}</span>
                        <DeleteDisciplineButton id={d.id} />
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Tags className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-800">Categorías de Competencia</h3>
          </div>
          
          <div className="p-5 flex-1 flex flex-col space-y-4">
             <AddCategoryForm />
             
             <div className="space-y-2 mt-4">
                {categories.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay categorías registradas</p>}
                {categories.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                        <div>
                            <span className="font-medium text-slate-700">{c.name}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                c.gender === 'Masculino' ? 'bg-blue-100 text-blue-700' : 
                                c.gender === 'Femenino' ? 'bg-pink-100 text-pink-700' : 
                                'bg-purple-100 text-purple-700'
                            }`}>
                                {c.gender}
                            </span>
                        </div>
                        <DeleteCategoryButton id={c.id} />
                    </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
