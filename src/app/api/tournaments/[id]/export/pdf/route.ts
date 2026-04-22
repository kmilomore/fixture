import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import {
  buildTournamentExportFileName,
  getTournamentFixtureExportData,
} from "@/lib/tournamentExports";

export const dynamic = "force-dynamic";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 22;
const ROW_HEIGHT = 42;

function drawText(
  page: Awaited<ReturnType<PDFDocument["addPage"]>>,
  text: string,
  x: number,
  y: number,
  size: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  color = rgb(0.06, 0.09, 0.16)
) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fixture = await getTournamentFixtureExportData(id);

  if (!fixture) {
    return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - PAGE_MARGIN;

  drawText(page, `Fixture - ${fixture.name}`, PAGE_MARGIN, cursorY, 20, boldFont);
  cursorY -= 20;
  drawText(page, `${fixture.discipline} | ${fixture.category} | ${fixture.format}`, PAGE_MARGIN, cursorY, 11, regularFont, rgb(0.28, 0.35, 0.41));
  cursorY -= 14;
  drawText(page, `Equipos: ${fixture.teamsCount} | Partidos: ${fixture.matchesCount} | Estado: ${fixture.status}`, PAGE_MARGIN, cursorY, 11, regularFont, rgb(0.39, 0.45, 0.55));
  cursorY -= 28;

  for (const group of fixture.groups) {
    if (cursorY < PAGE_MARGIN + HEADER_HEIGHT + 60) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - PAGE_MARGIN;
    }

    page.drawRectangle({
      x: PAGE_MARGIN,
      y: cursorY - HEADER_HEIGHT + 4,
      width: PAGE_WIDTH - PAGE_MARGIN * 2,
      height: HEADER_HEIGHT,
      color: rgb(0.06, 0.46, 0.43),
    });
    drawText(page, group.title, PAGE_MARGIN + 12, cursorY - 12, 11, boldFont, rgb(1, 1, 1));
    cursorY -= 32;

    for (const match of group.matches) {
      if (cursorY < PAGE_MARGIN + ROW_HEIGHT + 18) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        cursorY = PAGE_HEIGHT - PAGE_MARGIN;
      }

      page.drawRectangle({
        x: PAGE_MARGIN,
        y: cursorY - ROW_HEIGHT + 4,
        width: PAGE_WIDTH - PAGE_MARGIN * 2,
        height: ROW_HEIGHT,
        color: rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.89, 0.91, 0.94),
        borderWidth: 1,
      });

      drawText(page, match.homeTeam.slice(0, 28), PAGE_MARGIN + 12, cursorY - 12, 10, boldFont);
      drawText(page, match.score, PAGE_MARGIN + 190, cursorY - 12, 10, boldFont, match.isFinished ? rgb(0.09, 0.4, 0.2) : rgb(0.28, 0.35, 0.41));
      drawText(page, match.awayTeam.slice(0, 28), PAGE_MARGIN + 260, cursorY - 12, 10, boldFont);

      if (match.phaseLabel) {
        drawText(page, match.phaseLabel.slice(0, 16), PAGE_WIDTH - PAGE_MARGIN - 85, cursorY - 11, 8, boldFont, rgb(0.2, 0.25, 0.31));
      }

      drawText(page, `Estado: ${match.statusLabel}`.slice(0, 24), PAGE_WIDTH - PAGE_MARGIN - 130, cursorY - 28, 8, regularFont, rgb(0.39, 0.45, 0.55));
      if (match.incidentLabel) {
        drawText(page, `Incidencia: ${match.incidentLabel}`.slice(0, 26), PAGE_WIDTH - PAGE_MARGIN - 130, cursorY - 38, 8, regularFont, rgb(0.55, 0.35, 0.08));
      }

      drawText(page, `Fecha: ${match.dateLabel}`.slice(0, 42), PAGE_MARGIN + 12, cursorY - 28, 8, regularFont, rgb(0.39, 0.45, 0.55));
      drawText(page, `Lugar: ${match.location}`.slice(0, 40), PAGE_MARGIN + 260, cursorY - 28, 8, regularFont, rgb(0.39, 0.45, 0.55));
      if (match.incidentNotes) {
        drawText(page, `Nota: ${match.incidentNotes}`.slice(0, 72), PAGE_MARGIN + 12, cursorY - 38, 8, regularFont, rgb(0.45, 0.33, 0.1));
      }
      cursorY -= 50;
    }

    cursorY -= 6;
  }

  const bytes = await pdf.save();
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${buildTournamentExportFileName(fixture.name, "pdf")}"`,
    },
  });
}