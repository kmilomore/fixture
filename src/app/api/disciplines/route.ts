import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeCatalogName } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabase();
    const [{ data: disciplines, error: e1 }, { data: categories, error: e2 }] = await Promise.all([
      supabase.from("Discipline").select("id, name, createdAt, updatedAt").order("name", { ascending: true }),
      supabase.from("Category").select("id, name, gender, createdAt, updatedAt").order("createdAt", { ascending: true }),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    return NextResponse.json({ disciplines: disciplines ?? [], categories: categories ?? [] });
  } catch (error) {
    console.error("GET /api/disciplines failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar disciplinas y categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const { data: existing } = await supabase.from("Discipline").select("name");
    if ((existing ?? []).some((i) => normalizeCatalogName(i.name) === normalizeCatalogName(name))) {
      return NextResponse.json({ error: "La disciplina ya existe" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("Discipline")
      .insert({ id: crypto.randomUUID(), name })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/disciplines failed:", error);
    return NextResponse.json({ error: "No se pudo crear la disciplina" }, { status: 500 });
  }
}
