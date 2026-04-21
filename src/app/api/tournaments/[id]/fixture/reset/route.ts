import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { error: e1 } = await supabase.from("Match").delete().eq("tournamentId", id);
    if (e1) throw e1;

    const { error: e2 } = await supabase.from("Tournament").update({ status: "DRAFT", format: null }).eq("id", id);
    if (e2) throw e2;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/tournaments/[id]/fixture/reset failed:", error);
    return NextResponse.json({ error: "No se pudo reiniciar el fixture" }, { status: 500 });
  }
}
