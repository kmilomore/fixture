import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { data, error } = await supabase
      .from("Team")
      .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });

    const est = (data.Establishment as unknown) as { id: string; name: string; comuna: string | null } | null;
    return NextResponse.json({
      id: data.id,
      name: data.name,
      establishmentId: data.establishmentId,
      establishment: { id: est?.id ?? data.establishmentId, name: est?.name ?? "", comuna: est?.comuna ?? null },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    console.error("GET /api/teams/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo consultar el equipo" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.establishmentId === "string" && body.establishmentId.trim()) updateData.establishmentId = body.establishmentId.trim();

    const { data, error } = await supabase
      .from("Team")
      .update(updateData)
      .eq("id", id)
      .select("id, name, establishmentId, createdAt, updatedAt, Establishment(id, name, comuna)")
      .single();

    if (error || !data) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });

    const est = (data.Establishment as unknown) as { id: string; name: string; comuna: string | null } | null;
    return NextResponse.json({
      id: data.id,
      name: data.name,
      establishmentId: data.establishmentId,
      establishment: { id: est?.id ?? data.establishmentId, name: est?.name ?? "", comuna: est?.comuna ?? null },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    console.error("PATCH /api/teams/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar el equipo" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { error } = await supabase.from("Team").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teams/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo eliminar el equipo" }, { status: 500 });
  }
}
