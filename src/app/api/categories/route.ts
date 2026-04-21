import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeCatalogName } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Category")
      .select("id, name, gender, createdAt, updatedAt")
      .order("createdAt", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar las categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";

    if (!name || !gender) {
      return NextResponse.json({ error: "Nombre y genero son requeridos" }, { status: 400 });
    }

    const { data: existing } = await supabase.from("Category").select("name, gender");
    if ((existing ?? []).some(
      (i) => normalizeCatalogName(i.name) === normalizeCatalogName(name) &&
             normalizeCatalogName(i.gender) === normalizeCatalogName(gender)
    )) {
      return NextResponse.json({ error: "La categoria ya existe" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("Category")
      .insert({ id: crypto.randomUUID(), name, gender })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories failed:", error);
    return NextResponse.json({ error: "No se pudo crear la categoria" }, { status: 500 });
  }
}
