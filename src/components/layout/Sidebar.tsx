"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Users,
  Building2,
  CalendarDays,
  Settings,
  LayoutDashboard,
  Layers
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Establecimientos", href: "/establishments", icon: Building2 },
  { name: "Equipos", href: "/teams", icon: Users },
  { name: "Torneos", href: "/tournaments", icon: Trophy },
  { name: "Disciplinas y Cat.", href: "/disciplines", icon: Layers },
  { name: "Fixture General", href: "/fixture", icon: CalendarDays },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen">
      <div className="flex items-center justify-center h-16 border-b border-slate-800 bg-slate-950">
        <Trophy className="w-6 h-6 text-emerald-500 mr-2" />
        <span className="text-xl font-bold text-white tracking-wider">FIXTURE PRO</span>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                  isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-300"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Administrador</p>
            <p className="text-xs font-medium text-slate-500 group-hover:text-white">Modo Web</p>
          </div>
        </div>
      </div>
    </div>
  );
}
