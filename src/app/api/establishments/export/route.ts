import Papa from "papaparse";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("Establishment")
    .select("id, name, comuna, createdAt, updatedAt, Team(id)")
    .order("name", { ascending: true });

  type EstablishmentRow = {
    id: string;
    name: string;
    comuna: string | null;
    createdAt: string;
    updatedAt: string;
    Team: Array<{ id: string }> | null;
  };

  const csv = Papa.unparse(
    ((data ?? []) as unknown as EstablishmentRow[]).map((e) => ({
      id: e.id,
      nombre: e.name,
      comuna: e.comuna ?? "",
      equipos: Array.isArray(e.Team) ? e.Team.length : 0,
      creado_en: e.createdAt,
      actualizado_en: e.updatedAt,
    }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="establecimientos.csv"',
    },
  });
}
