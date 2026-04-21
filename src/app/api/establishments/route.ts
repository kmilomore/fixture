import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeComuna, normalizeEstablishmentName } from "@/lib/establishments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const comuna = request.nextUrl.searchParams.get("comuna")?.trim() ?? "";

    let query = supabase
      .from("Establishment")
      .select("id, name, comuna, createdAt, updatedAt, Team(id)")
      .order("name", { ascending: true });

    if (q) query = query.ilike("name", `%${q}%`);
    if (comuna) query = query.ilike("comuna", comuna);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      (data ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        comuna: e.comuna,
        teamsCount: Array.isArray(e.Team) ? e.Team.length : 0,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/establishments failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los establecimientos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const comuna = normalizeComuna(body.comuna);
    const logoUrl = typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const { data: existing } = await supabase.from("Establishment").select("name");
    if ((existing ?? []).some((r) => normalizeEstablishmentName(r.name) === normalizeEstablishmentName(name))) {
      return NextResponse.json({ error: "El establecimiento ya existe" }, { status: 409 });
    }

    const establishmentId = crypto.randomUUID();
    const { data, error } = await supabase
      .from("Establishment")
      .insert({ id: establishmentId, name, comuna, logoUrl })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("Team").insert({ id: crypto.randomUUID(), name, establishmentId });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/establishments failed:", error);
    return NextResponse.json({ error: "No se pudo crear el establecimiento" }, { status: 500 });
  }
}
