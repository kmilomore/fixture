"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDiscipline, deleteCategory } from "../actions/disciplines";

export function DeleteDisciplineButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => {
        if(confirm("¿Eliminar disciplina?")) await deleteDiscipline(id);
      })}
      disabled={isPending}
      className="text-slate-400 hover:text-red-500"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => {
        if(confirm("¿Eliminar categoría?")) await deleteCategory(id);
      })}
      disabled={isPending}
      className="text-slate-400 hover:text-red-500"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
