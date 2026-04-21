import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ensureDefaultCatalogsLoaded } from "@/lib/catalogs";
import { ensureDefaultEstablishmentsLoaded } from "@/lib/establishments";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fixture Pro - Gestión Deportiva Web",
  description: "Sistema web para la gestión de campeonatos y fixtures deportivos desplegable en Vercel",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldRunStartupSync =
    process.env.ENABLE_STARTUP_SYNC === "true" || process.env.NODE_ENV !== "production";

  if (shouldRunStartupSync) {
    try {
      await ensureDefaultCatalogsLoaded();
      await ensureDefaultEstablishmentsLoaded();
    } catch (error) {
      console.error("Startup sync failed:", error);
    }
  }

  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen">
          {/* Menú Lateral */}
          <Sidebar />
          
          {/* Contenido Principal */}
          <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden relative">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10 shadow-sm">
              <h1 className="text-xl font-semibold text-slate-800">
                Panel de Administración
              </h1>
            </header>
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-6xl mx-auto w-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
