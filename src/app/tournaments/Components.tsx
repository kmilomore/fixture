"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { deleteTournament, createTournament } from "../actions/tournaments";

export function DeleteTournamentButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          if (!confirm("¿Eliminar competición entera?")) {
            return;
          }

          const result = await deleteTournament(id);
          if (result.error) {
            alert(result.error);
            return;
          }

          router.refresh();
        });
      }}
      disabled={isPending}
      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
      title="Eliminar torneo"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}

export function NewTournamentForm({ 
  disciplines, 
  categories 
}: { 
  disciplines: { id: string, name: string }[],
  categories: { id: string, name: string, gender: string }[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
  
    async function onSubmit(formData: FormData) {
      if (disciplines.length === 0 || categories.length === 0) {
        alert("Debes crear disciplinas y categorías antes de iniciar un torneo.");
        return;
      }
      setIsPending(true);
      await createTournament(formData);
      setIsPending(false);
      setIsOpen(false);
    }
  
    if (!isOpen) {
      return (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Torneo
        </button>
      );
    }
  
    return (
      <form action={onSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 flex gap-4 items-end flex-wrap shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre (Edición)</label>
          <input type="text" name="name" required placeholder="Ej: Campeonato Escolar 2026" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500 bg-white" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
          <select name="disciplineId" required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500 bg-white">
            {disciplines.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select name="categoryId" required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500 bg-white">
            {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.gender}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">Crear</button>
        </div>
      </form>
    );
}
