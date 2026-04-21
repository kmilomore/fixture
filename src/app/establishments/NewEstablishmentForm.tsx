"use client";

import { useState } from "react";
import { createEstablishment } from "../actions/establishments";
import { Plus } from "lucide-react";

export default function NewEstablishmentForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await createEstablishment(formData);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nuevo Establecimiento
      </button>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 max-w-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Nuevo Establecimiento</h3>
      <form action={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del Establecimiento / Colegio
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans bg-white text-slate-800"
            placeholder="Ej: Colegio San Alberto"
          />
        </div>

        <div>
          <label htmlFor="comuna" className="block text-sm font-medium text-slate-700 mb-1">
            Comuna
          </label>
          <input
            type="text"
            id="comuna"
            name="comuna"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans bg-white text-slate-800"
            placeholder="Ej: San Fernando"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[100px]"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
