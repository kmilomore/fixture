import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeCatalogName } from "@/lib/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        gender: category.gender,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar las categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";

    if (!name || !gender) {
      return NextResponse.json(
        { error: "Nombre y genero son requeridos" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findMany({ select: { name: true, gender: true } });
    if (
      existing.some(
        (item) =>
          normalizeCatalogName(item.name) === normalizeCatalogName(name) &&
          normalizeCatalogName(item.gender) === normalizeCatalogName(gender)
      )
    ) {
      return NextResponse.json({ error: "La categoria ya existe" }, { status: 409 });
    }

    const category = await prisma.category.create({ data: { name, gender } });

    return NextResponse.json(
      {
        id: category.id,
        name: category.name,
        gender: category.gender,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear la categoria" },
      { status: 500 }
    );
  }
}