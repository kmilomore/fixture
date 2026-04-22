import { getSupabase } from "@/infrastructure/supabase/client";

export type DashboardStats = {
  establishments: number;
  teams: number;
  tournaments: number;
  matches: number;
};

export async function getDashboardStats() {
  const supabase = getSupabase();
  const [establishments, teams, tournaments, matches] = await Promise.all([
    supabase.from("Establishment").select("*", { count: "exact", head: true }),
    supabase.from("Team").select("*", { count: "exact", head: true }),
    supabase.from("Tournament").select("*", { count: "exact", head: true }),
    supabase.from("Match").select("*", { count: "exact", head: true }),
  ]);

  return {
    establishments: establishments.count ?? 0,
    teams: teams.count ?? 0,
    tournaments: tournaments.count ?? 0,
    matches: matches.count ?? 0,
  } satisfies DashboardStats;
}