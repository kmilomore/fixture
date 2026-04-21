import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { normalizeComuna } from "@/lib/establishments";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { data, error } = await supabase
      .from("Establishment")
      .select("id, name, comuna, logoUrl, createdAt, updatedAt, Team(id)")
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });

    return NextResponse.json({
      id: data.id,
      name: data.name,
      comuna: data.comuna,
      logoUrl: data.logoUrl,
      teamsCount: Array.isArray(data.Team) ? data.Team.length : 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    console.error("GET /api/establishments/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo consultar el establecimiento" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (body.comuna !== undefined) updateData.comuna = normalizeComuna(body.comuna);
    if (body.logoUrl !== undefined) updateData.logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() || null : null;

    const { data, error } = await supabase
      .from("Establishment")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/establishments/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar el establecimiento" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { error } = await supabase.from("Establishment").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/establishments/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo eliminar el establecimiento" }, { status: 500 });
  }
}
