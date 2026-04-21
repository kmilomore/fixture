"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEstablishment } from "../actions/establishments";

export default function DeleteEstablishmentButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este establecimiento? Se perderán sus equipos asociados si no son gestionados.")) {
      startTransition(async () => {
        const result = await deleteEstablishment(id);
        if (result.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ${
        isPending ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Eliminar establecimiento"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
