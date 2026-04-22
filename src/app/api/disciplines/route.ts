import { NextResponse } from "next/server";
import { createDiscipline, listCatalogs } from "@/features/disciplines/application/catalog-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listCatalogs());
  } catch (error) {
    console.error("GET /api/disciplines failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar disciplinas y categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const discipline = await createDiscipline({ name: typeof body.name === "string" ? body.name : "" });
    return NextResponse.json(discipline, { status: 201 });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo crear la disciplina");
    console.error("POST /api/disciplines failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
