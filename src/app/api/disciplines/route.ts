import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeCatalogName } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [disciplines, categories] = await Promise.all([
      prisma.discipline.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      disciplines: disciplines.map((discipline) => ({
        id: discipline.id,
        name: discipline.name,
        createdAt: discipline.createdAt.toISOString(),
        updatedAt: discipline.updatedAt.toISOString(),
      })),
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        gender: category.gender,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/disciplines failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar disciplinas y categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await prisma.discipline.findMany({ select: { name: true } });
    if (existing.some((item) => normalizeCatalogName(item.name) === normalizeCatalogName(name))) {
      return NextResponse.json({ error: "La disciplina ya existe" }, { status: 409 });
    }

    const discipline = await prisma.discipline.create({ data: { name } });
    return NextResponse.json(
      {
        id: discipline.id,
        name: discipline.name,
        createdAt: discipline.createdAt.toISOString(),
        updatedAt: discipline.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/disciplines failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear la disciplina" },
      { status: 500 }
    );
  }
}