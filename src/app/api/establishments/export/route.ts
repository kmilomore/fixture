import Papa from "papaparse";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const establishments = await prisma.establishment.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { teams: true },
      },
    },
  });

  const csv = Papa.unparse(
    establishments.map((establishment) => ({
      id: establishment.id,
      nombre: establishment.name,
      comuna: establishment.comuna ?? "",
      equipos: establishment._count.teams,
      creado_en: establishment.createdAt.toISOString(),
      actualizado_en: establishment.updatedAt.toISOString(),
    }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="establecimientos.csv"',
    },
  });
}