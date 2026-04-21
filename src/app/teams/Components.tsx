"use client";

import { useTransition, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { deleteTeam, createTeam } from "../actions/teams";

export function DeleteTeamButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => {
        if(confirm("¿Eliminar equipo?")) await deleteTeam(id);
      })}
      disabled={isPending}
      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}

export function NewTeamForm({ establishments }: { establishments: { id: string, name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
  
    async function onSubmit(formData: FormData) {
      if (establishments.length === 0) {
        alert("Debes crear un establecimiento primero.");
        return;
      }
      setIsPending(true);
      await createTeam(formData);
      setIsPending(false);
      setIsOpen(false);
    }
  
    if (!isOpen) {
      return (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Equipo
        </button>
      );
    }
  
    return (
      <form action={onSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Equipo</label>
          <input type="text" name="name" required placeholder="Ej: Selección Fútbol Adultos" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500 bg-white" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Pertenece a Establecimiento</label>
          <select name="establishmentId" required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500 bg-white">
            {establishments.map(est => (
                <option key={est.id} value={est.id}>{est.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Guardar</button>
        </div>
      </form>
    );
}
