"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import DeleteEstablishmentButton from "./DeleteEstablishmentButton";

type EstablishmentRow = {
  id: string;
  name: string;
  comuna: string | null;
  createdAt: string;
  teamsCount: number;
};

export default function EstablishmentsTable({ establishments }: { establishments: EstablishmentRow[] }) {
  const [search, setSearch] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("todas");

  const comunas = useMemo(() => {
    const values = Array.from(
      new Set(establishments.map((item) => item.comuna).filter((item): item is string => Boolean(item)))
    );

    return values.sort((left, right) => left.localeCompare(right, "es"));
  }, [establishments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return establishments.filter((item) => {
      const matchesSearch =
        query.length === 0 || item.name.toLowerCase().includes(query);
      const matchesComuna =
        selectedComuna === "todas" || item.comuna === selectedComuna;

      return matchesSearch && matchesComuna;
    });
  }, [establishments, search, selectedComuna]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por escuela o establecimiento"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <MapPin className="h-4 w-4 text-slate-400" />
          <select
            value={selectedComuna}
            onChange={(event) => setSelectedComuna(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 outline-none"
          >
            <option value="todas">Todas las comunas</option>
            {comunas.map((comuna) => (
              <option key={comuna} value={comuna}>
                {comuna}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Escuela / Establecimiento</th>
                <th className="px-4 py-3 font-semibold">Comuna</th>
                <th className="px-4 py-3 font-semibold">Equipos</th>
                <th className="px-4 py-3 font-semibold">Creado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((establishment) => (
                <tr key={establishment.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-800">{establishment.name}</td>
                  <td className="px-4 py-3 text-slate-600">{establishment.comuna ?? "Sin comuna"}</td>
                  <td className="px-4 py-3 text-slate-600">{establishment.teamsCount}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(establishment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <DeleteEstablishmentButton id={establishment.id} />
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No hay establecimientos que coincidan con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}