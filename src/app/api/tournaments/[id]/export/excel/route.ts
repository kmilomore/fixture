import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import {
  buildTournamentExportFileName,
  getTournamentFixtureExportData,
} from "@/lib/tournamentExports";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fixture = await getTournamentFixtureExportData(id);

  if (!fixture) {
    return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Fixture Pro";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Fixture");
  sheet.columns = [
    { header: "Grupo / Ronda", key: "group", width: 24 },
    { header: "Fecha deportiva", key: "phase", width: 18 },
    { header: "Estado", key: "status", width: 16 },
    { header: "Incidencia", key: "incident", width: 18 },
    { header: "Local", key: "home", width: 32 },
    { header: "Visita", key: "away", width: 32 },
    { header: "Marcador", key: "score", width: 14 },
    { header: "Fecha", key: "date", width: 24 },
    { header: "Lugar", key: "location", width: 24 },
    { header: "Notas", key: "notes", width: 28 },
  ];

  sheet.mergeCells("A1:J1");
  sheet.getCell("A1").value = `Fixture - ${fixture.name}`;
  sheet.getCell("A1").font = { size: 18, bold: true, color: { argb: "FF0F172A" } };
  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 28;

  sheet.mergeCells("A2:J2");
  sheet.getCell("A2").value = `${fixture.discipline} | ${fixture.category} | ${fixture.format}`;
  sheet.getCell("A2").font = { size: 11, color: { argb: "FF475569" } };
  sheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

  sheet.mergeCells("A3:J3");
  sheet.getCell("A3").value = `Equipos: ${fixture.teamsCount} | Partidos: ${fixture.matchesCount} | Estado: ${fixture.status}`;
  sheet.getCell("A3").font = { size: 11, color: { argb: "FF64748B" } };
  sheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };

  let rowIndex = 5;

  for (const group of fixture.groups) {
    sheet.mergeCells(`A${rowIndex}:J${rowIndex}`);
    const groupCell = sheet.getCell(`A${rowIndex}`);
    groupCell.value = group.title;
    groupCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    groupCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F766E" },
    };
    rowIndex += 1;

    const headerRow = sheet.getRow(rowIndex);
    headerRow.values = ["Grupo / Ronda", "Fecha deportiva", "Estado", "Incidencia", "Local", "Visita", "Marcador", "Fecha", "Lugar", "Notas"];
    headerRow.font = { bold: true, color: { argb: "FF0F172A" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };
    rowIndex += 1;

    for (const match of group.matches) {
      const row = sheet.getRow(rowIndex);
      row.values = [
        group.title,
        match.phaseLabel ?? "-",
        match.statusLabel,
        match.incidentLabel ?? "-",
        match.homeTeam,
        match.awayTeam,
        match.score,
        match.dateLabel,
        match.location,
        match.incidentNotes ?? "-",
      ];
      row.getCell(7).alignment = { horizontal: "center" };
      if (match.isFinished) {
        row.getCell(7).font = { bold: true, color: { argb: "FF166534" } };
      }
      rowIndex += 1;
    }

    rowIndex += 1;
  }

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });

  const content = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${buildTournamentExportFileName(fixture.name, "xlsx")}"`,
    },
  });
}