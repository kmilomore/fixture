CREATE TABLE IF NOT EXISTS public."Establishment" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "logoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "comuna" TEXT
);

CREATE TABLE IF NOT EXISTS public."Discipline" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public."Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "gender" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public."Team" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "establishmentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_establishmentId_fkey"
    FOREIGN KEY ("establishmentId")
    REFERENCES public."Establishment"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS public."Tournament" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "format" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "scheduleStartDate" DATE,
  "scheduleEndDate" DATE,
  "scheduleMatchesPerMatchday" INTEGER,
  "scheduleAllowedWeekdays" INTEGER[],
  "scheduleDailyStartTime" TEXT,
  "scheduleDailyEndTime" TEXT,
  "scheduleMatchDurationMinutes" INTEGER,
  CONSTRAINT "Tournament_categoryId_fkey"
    FOREIGN KEY ("categoryId")
    REFERENCES public."Category"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT "Tournament_disciplineId_fkey"
    FOREIGN KEY ("disciplineId")
    REFERENCES public."Discipline"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS public."TournamentTeam" (
  "id" TEXT PRIMARY KEY,
  "tournamentId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  CONSTRAINT "TournamentTeam_teamId_fkey"
    FOREIGN KEY ("teamId")
    REFERENCES public."Team"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT "TournamentTeam_tournamentId_fkey"
    FOREIGN KEY ("tournamentId")
    REFERENCES public."Tournament"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TournamentTeam_tournamentId_teamId_key"
  ON public."TournamentTeam" ("tournamentId", "teamId");

CREATE TABLE IF NOT EXISTS public."Match" (
  "id" TEXT PRIMARY KEY,
  "tournamentId" TEXT NOT NULL,
  "homeTeamId" TEXT,
  "awayTeamId" TEXT,
  "date" TIMESTAMP(3),
  "location" TEXT,
  "homeScore" INTEGER,
  "awayScore" INTEGER,
  "isFinished" BOOLEAN NOT NULL DEFAULT FALSE,
  "round" INTEGER,
  "groupName" TEXT,
  "matchLogicIdentifier" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Match_awayTeamId_fkey"
    FOREIGN KEY ("awayTeamId")
    REFERENCES public."Team"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT "Match_homeTeamId_fkey"
    FOREIGN KEY ("homeTeamId")
    REFERENCES public."Team"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT "Match_tournamentId_fkey"
    FOREIGN KEY ("tournamentId")
    REFERENCES public."Tournament"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('Establishment', 'Discipline', 'Category', 'Team', 'Tournament', 'TournamentTeam', 'Match')
ORDER BY table_name;