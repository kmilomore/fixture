import Papa from "papaparse";
import { NextResponse } from "next/server";
import postgres from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  const establishments = await postgres.query<{
    id: string;
    name: string;
    comuna: string | null;
    teamsCount: number;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `SELECT e."id", e."name", e."comuna", e."createdAt", e."updatedAt",
       COUNT(t."id")::int AS "teamsCount"
     FROM public."Establishment" e
     LEFT JOIN public."Team" t ON t."establishmentId" = e."id"
     GROUP BY e."id"
     ORDER BY e."name" ASC`
  );

  const csv = Papa.unparse(
    establishments.rows.map((establishment) => ({
      id: establishment.id,
      nombre: establishment.name,
      comuna: establishment.comuna ?? "",
      equipos: establishment.teamsCount,
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