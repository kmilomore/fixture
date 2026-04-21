import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { data, error } = await supabase.from("Category").select("id, name, gender, createdAt, updatedAt").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/categories/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo consultar la categoria" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.gender === "string" && body.gender.trim()) updateData.gender = body.gender.trim();

    const { data, error } = await supabase.from("Category").update(updateData).eq("id", id).select().single();
    if (error || !data) return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/categories/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar la categoria" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { error } = await supabase.from("Category").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] failed:", error);
    return NextResponse.json({ error: "No se pudo eliminar la categoria" }, { status: 500 });
  }
}
