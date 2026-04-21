"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import { addTeamToTournament, removeTeamFromTournament } from "../../actions/tournaments";

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ManageTournamentTeams({
  tournamentId,
  availableTeams,
  currentTeams
}: {
  tournamentId: string;
  availableTeams: { id: string; name: string; establishment: { name: string } }[];
  currentTeams: { id: string; team: { id: string; name: string; establishment: { name: string } } }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectableTeams = useMemo(() => {
    const available = availableTeams.filter(
      (team) => !currentTeams.some((current) => current.team.id === team.id)
    );
    const normalizedSearch = normalizeSearchValue(searchTerm);

    if (!normalizedSearch) {
      return available;
    }

    return available.filter((team) => {
      const teamName = normalizeSearchValue(team.name);
      const establishmentName = normalizeSearchValue(team.establishment.name);

      return teamName.includes(normalizedSearch) || establishmentName.includes(normalizedSearch);
    });
  }, [availableTeams, currentTeams, searchTerm]);

  const selectedTeam = selectableTeams.find((team) => team.id === selectedTeamId)
    ?? availableTeams.find((team) => team.id === selectedTeamId)
    ?? null;

  const visibleTeams = useMemo(() => selectableTeams.slice(0, 12), [selectableTeams]);

  function getTeamLabel(team: { name: string; establishment: { name: string } }) {
    return `${team.establishment.name} · ${team.name}`;
  }

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    
    startTransition(async () => {
        const result = await addTeamToTournament(tournamentId, selectedTeamId);
        if (!result.error) {
          setSelectedTeamId("");
          setSearchTerm("");
          setIsPickerOpen(false);
        } else {
          alert(result.error);
        }
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedTeamId("");
    setIsPickerOpen(true);
  };

  const handleSelectTeam = (team: { id: string; name: string; establishment: { name: string } }) => {
    setSelectedTeamId(team.id);
    setSearchTerm(getTeamLabel(team));
    setIsPickerOpen(false);
  };

  const handleRemove = (relId: string) => {
    startTransition(async () => {
        if (confirm("¿Quitar este equipo del torneo?")) {
            const result = await removeTeamFromTournament(relId, tournamentId);
            if (result.error) {
              alert(result.error);
            }
        }
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6 min-w-0">
      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Equipos Participantes ({currentTeams.length})</h3>
      
      <form onSubmit={handleAdd} className="space-y-3 mb-6 min-w-0">
        <div className="relative min-w-0">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setIsPickerOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsPickerOpen(false), 120);
              }}
              placeholder="Busca y selecciona una escuela"
              disabled={isPending || selectableTeams.length === 0 && !searchTerm}
              className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </label>

          {isPickerOpen && visibleTeams.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
              {visibleTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelectTeam(team);
                  }}
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-800">{team.establishment.name}</span>
                  <span className="text-xs text-slate-500">{team.name}</span>
                </button>
              ))}
            </div>
          )}

          {isPickerOpen && searchTerm && visibleTeams.length === 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-xl">
              No hay coincidencias para esa búsqueda.
            </div>
          )}
        </div>

        <div className="flex gap-2 min-w-0 flex-wrap sm:flex-nowrap">
        <button
          type="submit"
          disabled={isPending || !selectedTeamId}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center justify-center gap-1 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <Plus className="w-4 h-4"/> Agregar al torneo
        </button>
        </div>

        {selectedTeam && (
          <p className="text-sm text-slate-500">
            Seleccionado: <span className="font-medium text-slate-700">{selectedTeam.establishment.name}</span>
            <span className="text-slate-400"> · {selectedTeam.name}</span>
          </p>
        )}
      </form>

      {selectableTeams.length === 0 && (
        <p className="mb-4 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          No hay escuelas o equipos disponibles para agregar a este torneo.
        </p>
      )}

      {selectableTeams.length > 0 && searchTerm && !selectedTeamId && (
        <p className="mb-4 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          Resultados del buscador: <span className="font-medium text-slate-700">{selectableTeams.length}</span>
        </p>
      )}

      <ul className="space-y-2">
        {currentTeams.map(ct => (
            <li key={ct.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg">
                <div>
                    <p className="font-semibold text-slate-700">{ct.team.name}</p>
                    <p className="text-xs text-slate-500">{ct.team.establishment.name}</p>
                </div>
                <button 
                  onClick={() => handleRemove(ct.id)} 
                  disabled={isPending}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  title="Quitar Equipo"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </li>
        ))}
        {currentTeams.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4 border-2 border-dashed rounded-lg">No hay equipos en este torneo aún.</p>
        )}
      </ul>
    </div>
  );
}
