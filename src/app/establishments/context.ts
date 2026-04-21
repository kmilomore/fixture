export const establishmentsContext = {
  title: "Establecimientos",
  summary:
    "El módulo mantiene un directorio base de establecimientos disponible siempre desde el CSV integrado en la aplicación y permite agregar registros adicionales en la base alojada.",
  behaviors: [
    "Los establecimientos base se sincronizan automáticamente al abrir la app.",
    "Cada establecimiento tiene un equipo homónimo creado automáticamente para quedar disponible en torneos.",
    "Los establecimientos agregados desde la aplicación quedan guardados en la base PostgreSQL hospedada.",
    "La exportación CSV incluye tanto el directorio base como los registros creados en la aplicación.",
    "La tabla permite buscar por nombre de escuela y filtrar por comuna.",
  ],
  columns: ["Nombre", "Comuna", "Equipos", "Fecha de creación"],
} as const;

export type EstablishmentsContext = typeof establishmentsContext;