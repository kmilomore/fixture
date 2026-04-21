import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ensureTeamsMatchEstablishments,
  getExistingEstablishmentNameSet,
  normalizeComuna,
  normalizeEstablishmentName,
} from "@/lib/establishments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const comuna = request.nextUrl.searchParams.get("comuna")?.trim() ?? "";

    const establishments = await prisma.establishment.findMany({
      where: {
        AND: [
          query
            ? {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              }
            : {},
          comuna
            ? {
                comuna: {
                  equals: comuna,
                  mode: "insensitive",
                },
              }
            : {},
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        comuna: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { teams: true },
        },
      },
    });

    return NextResponse.json(
      establishments.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        comuna: establishment.comuna,
        teamsCount: establishment._count.teams,
        createdAt: establishment.createdAt.toISOString(),
        updatedAt: establishment.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/establishments failed:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los establecimientos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const comuna = normalizeComuna(body.comuna);
    const logoUrl = typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existingNames = await getExistingEstablishmentNameSet();
    if (existingNames.has(normalizeEstablishmentName(name))) {
      return NextResponse.json({ error: "El establecimiento ya existe" }, { status: 409 });
    }

    const establishment = await prisma.establishment.create({
      data: {
        name,
        comuna,
        logoUrl,
      },
    });

    await ensureTeamsMatchEstablishments();

    return NextResponse.json(
      {
        id: establishment.id,
        name: establishment.name,
        comuna: establishment.comuna,
        logoUrl: establishment.logoUrl,
        createdAt: establishment.createdAt.toISOString(),
        updatedAt: establishment.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/establishments failed:", error);
    return NextResponse.json(
      { error: "No se pudo crear el establecimiento" },
      { status: 500 }
    );
  }
}