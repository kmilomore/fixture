import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { listTeams } from "@/features/teams/application/team-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      await listTeams({
        q: request.nextUrl.searchParams.get("q") ?? undefined,
        establishmentId: request.nextUrl.searchParams.get("establishmentId") ?? undefined,
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
