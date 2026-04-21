import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const establishmentId = request.nextUrl.searchParams.get("establishmentId")?.trim() ?? "";

    let query = supabase
      .from("Team")
      .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
      .order("createdAt", { ascending: false });

    if (establishmentId) query = query.eq("establishmentId", establishmentId);

    const { data, error } = await query;
    if (error) throw error;

    let rows = data ?? [];
    if (q) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          (t.Establishment as unknown as { name: string } | null)?.name.toLowerCase().includes(lower)
      );
    }

    return NextResponse.json(
      rows.map((t) => {
        const est = (t.Establishment as unknown) as { id: string; name: string; comuna: string | null } | null;
        return {
          id: t.id,
          name: t.name,
          establishmentId: t.establishmentId,
          establishment: { id: est?.id ?? t.establishmentId, name: est?.name ?? "", comuna: est?.comuna ?? null },
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        };
      })
    );
  } catch (error) {
    console.error("GET /api/teams failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar los equipos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const establishmentId = typeof body.establishmentId === "string" ? body.establishmentId.trim() : "";

    if (!name || !establishmentId) {
      return NextResponse.json({ error: "Nombre y establecimiento son requeridos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Team")
      .insert({ id: crypto.randomUUID(), name, establishmentId })
      .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
      .single();

    if (error) throw error;

    const est = (data.Establishment as unknown) as { id: string; name: string; comuna: string | null } | null;
    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        establishmentId: data.establishmentId,
        establishment: { id: est?.id ?? establishmentId, name: est?.name ?? "", comuna: est?.comuna ?? null },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/teams failed:", error);
    return NextResponse.json({ error: "No se pudo crear el equipo" }, { status: 500 });
  }
}
