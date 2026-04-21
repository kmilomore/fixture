import { Download } from "lucide-react";

export default function ExportEstablishmentsButton() {
  return (
    <a
      href="/api/establishments/export"
      className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      <Download className="w-4 h-4" />
      Exportar CSV
    </a>
  );
}