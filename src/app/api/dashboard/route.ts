import { NextResponse } from "next/server";
import { getDashboardStats } from "@/features/dashboard/application/dashboard-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getDashboardStats());
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    return NextResponse.json({ error: "No se pudo consultar el dashboard" }, { status: 500 });
  }
}
