"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Edit3 } from "lucide-react";
import { updateMatchResult } from "@/app/actions/fixture";
import {
  getMatchIncidentLabel,
  getMatchStatusPresentation,
  MATCH_INCIDENT_TYPES,
  MATCH_STATUSES,
  type MatchIncidentType,
  type MatchStatus,
} from "@/features/fixture/domain/match-lifecycle";
import { getPlaceholderTeams } from "@/features/fixture/domain/standings";
import type { MatchWithTeams } from "@/features/fixture/types";

type MatchRowProps = {
  tournamentId: string;
  match: MatchWithTeams;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
};

export function MatchRow({ tournamentId, match, isEditing, onEdit, onCancelEdit }: MatchRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? "");
  const [location, setLocation] = useState(match.location ?? "");
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [incidentType, setIncidentType] = useState<MatchIncidentType | "">(match.incidentType ?? "");
  const [incidentNotes, setIncidentNotes] = useState(match.incidentNotes ?? "");
  const [dateTime, setDateTime] = useState(match.date ? new Date(match.date).toISOString().slice(0, 16) : "");
  const requiresScore = status === "FINISHED" || status === "WALKOVER";

  useEffect(() => {
    setHomeScore(match.homeScore?.toString() ?? "");
    setAwayScore(match.awayScore?.toString() ?? "");
    setLocation(match.location ?? "");
    setStatus(match.status);
    setIncidentType(match.incidentType ?? "");
    setIncidentNotes(match.incidentNotes ?? "");
    setDateTime(match.date ? new Date(match.date).toISOString().slice(0, 16) : "");
  }, [match]);

  function formatMatchDateLabel(date: string) {
    const [rawDate, rawTime] = date.split("T");
    if (!rawDate) {
      return date;
    }

    const [year, month, day] = rawDate.split("-");
    const time = rawTime ? rawTime.slice(0, 5) : "--:--";
    return `${day}/${month}/${year} ${time}`;
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateMatchResult(tournamentId, match.id, {
        homeScore: requiresScore && homeScore !== "" ? Number(homeScore) : undefined,
        awayScore: requiresScore && awayScore !== "" ? Number(awayScore) : undefined,
        location,
        date: dateTime,
        status,
        incidentType: incidentType || null,
        incidentNotes,
      });

      if (result.error) {
        alert(result.error);
        return;
      }

      onCancelEdit();
      router.refresh();
    });
  }

  const isBye = !match.homeTeam || !match.awayTeam;
  const placeholderTeams = getPlaceholderTeams(match);
  const homeLabel = match.homeTeam?.name ?? placeholderTeams?.home ?? "BYE";
  const awayLabel = match.awayTeam?.name ?? placeholderTeams?.away ?? "BYE";
  const isPlaceholderMatch = !match.homeTeam && !match.awayTeam && Boolean(placeholderTeams);
  const matchdayLabel = match.matchLogicIdentifier && !match.matchLogicIdentifier.includes(" vs ") ? match.matchLogicIdentifier : null;
  const statusPresentation = getMatchStatusPresentation(match.status);

  return (
    <li className={`px-4 py-3 ${isBye && !isPlaceholderMatch ? "bg-slate-50 opacity-60" : ""}`}>
      {(matchdayLabel || match.incidentType || match.status) && (
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            {matchdayLabel ?? "Partido"}
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusPresentation.className}`}>
            {statusPresentation.label}
          </span>
          {match.incidentType && (
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              {getMatchIncidentLabel(match.incidentType)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className={`flex-1 text-right font-semibold text-sm ${match.isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-emerald-700" : "text-slate-700"}`}>
          {homeLabel}
        </span>

        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg font-mono font-bold text-sm min-w-[70px] justify-center ${
          match.isFinished ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {match.isFinished ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        </div>

        <span className={`flex-1 font-semibold text-sm ${match.isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-emerald-700" : "text-slate-700"}`}>
          {awayLabel}
        </span>

        {!isBye && !isPlaceholderMatch && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
            title="Editar resultado/fecha"
          >
            {match.isFinished ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Edit3 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {(match.date || match.location || match.incidentNotes) && !isEditing && (
        <div className="flex gap-3 mt-1 pl-1 text-xs text-slate-400">
          {match.date && <span>📅 {formatMatchDateLabel(match.date)}</span>}
          {match.location && <span>📍 {match.location}</span>}
          {match.incidentNotes && <span>📝 {match.incidentNotes}</span>}
        </div>
      )}

      {isEditing && (
        <div className="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-200 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Estado</label>
            <select value={status} onChange={(event) => setStatus(event.target.value as MatchStatus)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white">
              {MATCH_STATUSES.map((value) => (
                <option key={value} value={value}>{getMatchStatusPresentation(value).label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Incidencia</label>
            <select value={incidentType} onChange={(event) => setIncidentType(event.target.value as MatchIncidentType | "")} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white">
              <option value="">Sin incidencia</option>
              {MATCH_INCIDENT_TYPES.map((value) => (
                <option key={value} value={value}>{getMatchIncidentLabel(value)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Marcador Local</label>
            <input type="number" min="0" value={homeScore} onChange={(event) => setHomeScore(event.target.value)} disabled={!requiresScore} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Marcador Visita</label>
            <input type="number" min="0" value={awayScore} onChange={(event) => setAwayScore(event.target.value)} disabled={!requiresScore} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Fecha y Hora</label>
            <input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Cancha / Lugar</label>
            <input type="text" placeholder="Ej: Estadio Municipal" value={location} onChange={(event) => setLocation(event.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500 font-medium block mb-1">Notas de incidencia</label>
            <textarea value={incidentNotes} onChange={(event) => setIncidentNotes(event.target.value)} rows={2} className="w-full border rounded-md px-2 py-1.5 text-sm bg-white" placeholder="Detalle breve si hubo suspension, protesta, abandono o reprogramacion" />
          </div>
          {!requiresScore && (
            <p className="col-span-2 text-xs text-slate-500">
              El marcador solo se guarda cuando el partido esta en estado Finalizado o Walkover.
            </p>
          )}
          <div className="col-span-2 flex justify-end gap-2 mt-1">
            <button type="button" onClick={onCancelEdit} className="text-sm px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600">Cancelar</button>
            <button type="button" onClick={handleSave} disabled={isPending} className="text-sm px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}