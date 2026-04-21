import prisma from "@/lib/prisma";
import NewEstablishmentForm from "./NewEstablishmentForm";
import { Building2 } from "lucide-react";
import CsvImporter from "./CsvImporter";
import ExportEstablishmentsButton from "./ExportEstablishmentsButton";
import EstablishmentsTable from "./EstablishmentsTable";
import { establishmentsContext } from "./context";

export const dynamic = 'force-dynamic';

export default async function EstablishmentsPage() {
  const establishments = await prisma.establishment.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { teams: true }
      }
    }
  });

  const tableRows = establishments.map((establishment) => ({
    id: establishment.id,
    name: establishment.name,
    comuna: establishment.comuna,
    createdAt: establishment.createdAt.toISOString(),
    teamsCount: establishment._count.teams,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Building2 className="text-slate-400 w-6 h-6" />
            Establecimientos y Clubes
          </h2>
          <p className="text-slate-500 mt-1">
            Administra las instituciones educativas o clubes deportivos participantes.
          </p>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl">
            {establishmentsContext.summary}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportEstablishmentsButton />
          <CsvImporter />
          <NewEstablishmentForm />
        </div>
      </div>

      <EstablishmentsTable establishments={tableRows} />
    </div>
  );
}
