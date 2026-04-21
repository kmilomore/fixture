import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { data, error } = await supabase.from("Discipline").select("id, name, createdAt, updatedAt").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/disciplines/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo consultar la disciplina" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();

    const { data, error } = await supabase.from("Discipline").update(updateData).eq("id", id).select().single();
    if (error || !data) return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/disciplines/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar la disciplina" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { error } = await supabase.from("Discipline").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/disciplines/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo eliminar la disciplina" }, { status: 500 });
  }
}
