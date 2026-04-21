import { Settings2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-slate-400" />
          Configuración
        </h2>
        <p className="text-slate-500 mt-1">Ajustes generales del sistema.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800">Acerca de Fixture Pro</h3>
        <div className="text-sm text-slate-600 space-y-1">
          <p><span className="font-medium">Versión:</span> 1.0.0</p>
          <p><span className="font-medium">Base de datos:</span> PostgreSQL alojado</p>
          <p><span className="font-medium">Infraestructura:</span> Next.js + PostgreSQL + Vercel</p>
          <p><span className="font-medium">Motor de fixtures:</span> Liga, grupos y eliminatoria</p>
        </div>
      </div>
    </div>
  );
}
