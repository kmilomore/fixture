ALTER TABLE public."Tournament"
  ADD COLUMN IF NOT EXISTS "scheduleStartDate" DATE,
  ADD COLUMN IF NOT EXISTS "scheduleEndDate" DATE,
  ADD COLUMN IF NOT EXISTS "scheduleMatchesPerMatchday" INTEGER,
  ADD COLUMN IF NOT EXISTS "scheduleAllowedWeekdays" INTEGER[],
  ADD COLUMN IF NOT EXISTS "scheduleDailyStartTime" TEXT,
  ADD COLUMN IF NOT EXISTS "scheduleDailyEndTime" TEXT,
  ADD COLUMN IF NOT EXISTS "scheduleMatchDurationMinutes" INTEGER;