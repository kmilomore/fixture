"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { bulkCreateEstablishments } from "../actions/fixture";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";

type PreviewRow = { name: string; comuna: string | null; valid: boolean };

export default function CsvImporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setResult(null);
    if (!file) return;
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const firstRow = results.data[0];
        const nameKey = Object.keys(firstRow || {}).find((k) =>
          ["nombre", "name", "establecimiento", "colegio", "institución", "institucion"].includes(
            k.toLowerCase().trim()
          )
        );
        const comunaKey = Object.keys(firstRow || {}).find((k) =>
          ["comuna", "municipio", "ciudad"].includes(k.toLowerCase().trim())
        );

        if (!nameKey) {
          setError(
            `No se encontró columna de nombre. El CSV debe tener una columna: "nombre", "name", "establecimiento" o "colegio".`
          );
          setPreview([]);
          return;
        }

        const rows: PreviewRow[] = results.data.map((row) => ({
          name: row[nameKey]?.trim() || "",
          comuna: comunaKey ? row[comunaKey]?.trim() || null : null,
          valid: !!row[nameKey]?.trim(),
        }));
        setPreview(rows);
      },
      error: () => setError("No se pudo leer el archivo CSV."),
    });
  }

  function handleImport() {
    const rows = preview
      .filter((r) => r.valid)
      .map((r) => ({ name: r.name, comuna: r.comuna }));
    if (rows.length === 0) return;

    startTransition(async () => {
      const res = await bulkCreateEstablishments(rows);
      if (res.error) {
        setError(res.error);
      } else {
        setResult(`✅ Se importaron ${res.count} establecimientos correctamente.`);
        setPreview([]);
        setFileName(null);
        setTimeout(() => setIsOpen(false), 2000);
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Upload className="w-4 h-4" />
        Importar CSV
      </button>
    );
  }

  const validCount = preview.filter((r) => r.valid).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Importar Establecimientos por CSV
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg mb-4">
          <p className="font-semibold">¿Cómo preparar el CSV?</p>
          <p className="mt-1">El archivo CSV debe tener una columna llamada: <code className="font-mono bg-blue-100 px-1 rounded">nombre</code> (o "name", "colegio", "establecimiento"). La columna <code className="font-mono bg-blue-100 px-1 rounded">comuna</code> es opcional.</p>
        </div>

        <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors bg-slate-50">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">
            {fileName ? fileName : "Haz clic o arrastra tu archivo .csv aquí"}
          </p>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </label>

        {error && (
          <div className="mt-3 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-3 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {result}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Vista previa ({validCount} válidos de {preview.length} filas):
            </p>
            <ul className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-sm">
              {preview.slice(0, 50).map((row, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 ${row.valid ? "text-slate-700" : "text-red-400 bg-red-50"}`}
                >
                  <span>{row.name || "(vacío)"}</span>
                  {row.valid && row.comuna && <span className="text-xs text-slate-500">{row.comuna}</span>}
                  {!row.valid && <span className="text-xs text-red-500">Inválido</span>}
                </li>
              ))}
              {preview.length > 50 && (
                <li className="px-3 py-2 text-slate-500 italic text-xs">
                  ...y {preview.length - 50} filas más (todas serán importadas)
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={validCount === 0 || isPending}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Importando..." : `Importar ${validCount} establecimientos`}
          </button>
        </div>
      </div>
    </div>
  );
}
