"use client";

import { useState } from "react";
import { createDiscipline, createCategory } from "../actions/disciplines";
import { Plus } from "lucide-react";

export function AddDisciplineForm() {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    await createDiscipline(formData);
    setIsPending(false);
  }

  return (
    <form action={onSubmit} className="flex gap-2 bg-slate-50 p-3 flex-wrap sm:flex-nowrap rounded-lg border border-slate-200">
      <input type="text" name="name" required placeholder="Nva. Disciplina (Fútbol 7)" className="flex-1 px-3 py-2 border rounded-md text-sm outline-none focus:border-emerald-500 bg-white" />
      <button type="submit" disabled={isPending} className="bg-slate-800 text-white px-3 py-2 rounded-md font-medium text-sm flex items-center gap-1 hover:bg-slate-700">
        <Plus className="w-4 h-4" /> Agregar
      </button>
    </form>
  );
}

export function AddCategoryForm() {
    const [isPending, setIsPending] = useState(false);
  
    async function onSubmit(formData: FormData) {
      setIsPending(true);
      await createCategory(formData);
      setIsPending(false);
    }
  
    return (
      <form action={onSubmit} className="flex gap-2 flex-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
        <input type="text" name="name" required placeholder="Nva. Categoría (Sub-14)" className="flex-1 min-w-[120px] px-3 py-2 border rounded-md text-sm outline-none focus:border-emerald-500 bg-white" />
        <select name="gender" required className="flex-1 px-3 py-2 border rounded-md text-sm outline-none bg-white min-w-[120px]">
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Mixto">Mixto</option>
        </select>
        <button type="submit" disabled={isPending} className="bg-slate-800 text-white px-3 py-2 rounded-md font-medium text-sm flex items-center gap-1 hover:bg-slate-700">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </form>
    );
  }
