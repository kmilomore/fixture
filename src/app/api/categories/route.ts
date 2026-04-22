import { NextResponse } from "next/server";
import { createCategory, listCategories } from "@/features/disciplines/application/catalog-service";
import { asServiceError } from "@/shared/lib/service-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listCategories());
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json({ error: "No se pudieron consultar las categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await createCategory({
      name: typeof body.name === "string" ? body.name : "",
      gender: typeof body.gender === "string" ? body.gender : "",
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const serviceError = asServiceError(error, "No se pudo crear la categoria");
    console.error("POST /api/categories failed:", error);
    return NextResponse.json({ error: serviceError.message }, { status: serviceError.status });
  }
}
