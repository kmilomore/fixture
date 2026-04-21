export const MATCH_STATUSES = [
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "WALKOVER",
  "SUSPENDED",
  "CANCELLED",
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_INCIDENT_TYPES = [
  "NO_PRESENTACION",
  "SUSPENSION",
  "PROTESTA",
  "ABANDONO",
  "REPROGRAMACION",
] as const;

export type MatchIncidentType = (typeof MATCH_INCIDENT_TYPES)[number];

export function isMatchStatus(value: unknown): value is MatchStatus {
  return typeof value === "string" && MATCH_STATUSES.includes(value as MatchStatus);
}

export function isMatchIncidentType(value: unknown): value is MatchIncidentType {
  return typeof value === "string" && MATCH_INCIDENT_TYPES.includes(value as MatchIncidentType);
}

export function isFinishedMatchStatus(status: MatchStatus) {
  return status === "FINISHED" || status === "WALKOVER";
}

export function getMatchStatusPresentation(status: MatchStatus) {
  switch (status) {
    case "LIVE":
      return { label: "En vivo", className: "bg-emerald-100 text-emerald-700" };
    case "FINISHED":
      return { label: "Finalizado", className: "bg-slate-900 text-white" };
    case "WALKOVER":
      return { label: "Walkover", className: "bg-amber-100 text-amber-700" };
    case "SUSPENDED":
      return { label: "Suspendido", className: "bg-rose-100 text-rose-700" };
    case "CANCELLED":
      return { label: "Cancelado", className: "bg-slate-200 text-slate-600" };
    default:
      return { label: "Programado", className: "bg-indigo-100 text-indigo-700" };
  }
}

export function getMatchIncidentLabel(type: MatchIncidentType) {
  switch (type) {
    case "NO_PRESENTACION":
      return "No presentacion";
    case "SUSPENSION":
      return "Suspension";
    case "PROTESTA":
      return "Protesta";
    case "ABANDONO":
      return "Abandono";
    default:
      return "Reprogramacion";
  }
}