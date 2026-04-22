/**
 * Fixture Engine - Core algorithms
 *
 * Genera schedules de:
 * 1. Liga (Round Robin / Todos contra todos)
 * 2. Eliminatoria (Bracket / Single Elimination)
 * 3. Grupos + Eliminatoria (tipo mundial)
 */

export type FixtureTeam = {
  id: string;
  name: string;
};

export type FixtureFormat = "LIGA" | "ELIMINATORIA" | "GRUPOS_ELIMINATORIA";

export type FixtureSchedulingRules = {
  startDate: string;
  endDate: string;
  matchesPerMatchday: number;
  allowedWeekdays: number[];
  dailyStartTime: string;
  dailyEndTime: string;
  matchDurationMinutes: number;
};

export type FixtureGenerationOptions = {
  format: FixtureFormat;
  groupCount?: number;
  seededTeamIds?: string[];
  schedulingRules?: FixtureSchedulingRules;
};

export type FixtureMatch = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  round: number;
  groupName: string | null;
  matchLogicIdentifier: string | null;
  date?: Date | null;
};

type TeamGroup = {
  label: string;
  teams: FixtureTeam[];
};

const ROUND_NAMES: Record<number, string> = {
  2: "Final",
  4: "Semifinal",
  8: "Cuartos de Final",
  16: "Octavos de Final",
  32: "Dieciseisavos",
};

function getRoundName(participantsCount: number, fallbackRound: number) {
  return ROUND_NAMES[participantsCount] || `Ronda ${fallbackRound}`;
}

function buildGroupLabel(index: number) {
  return `Grupo ${String.fromCharCode(65 + index)}`;
}

function buildMatchdayLabel(round: number) {
  return `Fecha ${round}`;
}

function isPowerOfTwo(value: number) {
  return value > 0 && (value & (value - 1)) === 0;
}

function parseTimeString(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function setTimeOnDate(baseDate: Date, totalMinutes: number) {
  const nextDate = new Date(baseDate);
  nextDate.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return nextDate;
}

function enumerateScheduleSlots(rules: FixtureSchedulingRules, requiredMatchdays: number) {
  const slots: Date[] = [];
  const start = new Date(`${rules.startDate}T00:00:00`);
  const end = new Date(`${rules.endDate}T00:00:00`);
  const startMinutes = parseTimeString(rules.dailyStartTime);
  const endMinutes = parseTimeString(rules.dailyEndTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Debes definir un rango de fechas valido.");
  }

  if (end < start) {
    throw new Error("La fecha final debe ser igual o posterior a la fecha inicial.");
  }

  if (endMinutes <= startMinutes) {
    throw new Error("La hora de termino debe ser posterior a la hora de inicio.");
  }

  if (rules.matchDurationMinutes <= 0) {
    throw new Error("La duracion del partido debe ser mayor a cero.");
  }

  if (rules.matchesPerMatchday <= 0) {
    throw new Error("La cantidad de partidos por fecha debe ser mayor a cero.");
  }

  const allowedDays = new Set(rules.allowedWeekdays);

  if (allowedDays.size === 0) {
    throw new Error("Debes habilitar al menos un dia de juego.");
  }

  const currentDate = new Date(start);
  let selectedMatchdays = 0;
  const availableSlotsPerDay = Math.floor((endMinutes - startMinutes) / rules.matchDurationMinutes);

  if (availableSlotsPerDay <= 0) {
    throw new Error("La franja horaria seleccionada no alcanza para programar partidos.");
  }

  if (availableSlotsPerDay < rules.matchesPerMatchday) {
    throw new Error("La franja horaria seleccionada no alcanza para la cantidad de partidos por fecha solicitada.");
  }

  while (currentDate <= end && selectedMatchdays < requiredMatchdays) {
    if (allowedDays.has(currentDate.getDay())) {
      selectedMatchdays += 1;
      let currentMinutes = startMinutes;
      let assignedMatches = 0;

      while (
        currentMinutes + rules.matchDurationMinutes <= endMinutes &&
        assignedMatches < rules.matchesPerMatchday
      ) {
        slots.push(setTimeOnDate(currentDate, currentMinutes));
        currentMinutes += rules.matchDurationMinutes;
        assignedMatches += 1;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (selectedMatchdays < requiredMatchdays) {
    throw new Error("No existen suficientes dias validos dentro del rango para programar todas las fechas necesarias.");
  }

  return slots;
}

function assignScheduleToMatches(matches: FixtureMatch[], schedulingRules?: FixtureSchedulingRules) {
  if (!schedulingRules) {
    return matches;
  }

  const requiredMatchdays = Math.ceil(matches.length / schedulingRules.matchesPerMatchday);
  const slots = enumerateScheduleSlots(schedulingRules, requiredMatchdays);

  if (slots.length < matches.length) {
    throw new Error("No hay suficientes fechas y horarios disponibles para calendarizar todos los partidos.");
  }

  return matches.map((match, index) => ({
    ...match,
    date: slots[index],
  }));
}

function distributeTeamsIntoGroups(teams: FixtureTeam[], requestedGroupCount: number, seededTeamIds: string[] = []) {
  const groupCount = Math.max(1, Math.min(requestedGroupCount, teams.length));
  const groups: TeamGroup[] = Array.from({ length: groupCount }, (_, index) => ({
    label: buildGroupLabel(index),
    teams: [],
  }));
  const orderedTeams = [...teams].sort((left, right) => left.name.localeCompare(right.name, "es"));
  const seededIds = Array.from(new Set(seededTeamIds)).slice(0, groupCount);
  const seededTeams = seededIds
    .map((teamId) => orderedTeams.find((team) => team.id === teamId) ?? null)
    .filter((team): team is FixtureTeam => Boolean(team));

  seededTeams.forEach((team, index) => {
    groups[index]?.teams.push(team);
  });

  const remainingTeams = orderedTeams.filter((team) => !seededTeams.some((seededTeam) => seededTeam.id === team.id));

  remainingTeams.forEach((team, index) => {
    const cycle = Math.floor(index / groupCount);
    const offset = index % groupCount;
    const groupIndex = cycle % 2 === 0 ? offset : groupCount - 1 - offset;
    groups[groupIndex].teams.push(team);
  });

  return groups;
}

function generateRoundRobinForGroup(teams: FixtureTeam[], groupLabel?: string) {
  const matches: FixtureMatch[] = [];
  const participants = [...teams];

  if (participants.length % 2 !== 0) {
    participants.push({ id: "BYE", name: "Libre" });
  }

  const participantsCount = participants.length;
  const rounds = participantsCount - 1;
  const half = participantsCount / 2;

  for (let round = 0; round < rounds; round += 1) {
    for (let index = 0; index < half; index += 1) {
      const home = participants[index];
      const away = participants[participantsCount - 1 - index];

      if (home.id !== "BYE" && away.id !== "BYE") {
        const isFlipped = round % 2 !== 0 && index !== 0;
        matches.push({
          homeTeamId: isFlipped ? away.id : home.id,
          awayTeamId: isFlipped ? home.id : away.id,
          round: round + 1,
          groupName: groupLabel ?? buildMatchdayLabel(round + 1),
          matchLogicIdentifier: groupLabel ? buildMatchdayLabel(round + 1) : null,
        });
      }
    }

    const last = participants.pop();
    if (!last) {
      break;
    }
    participants.splice(1, 0, last);
  }

  return matches;
}

function generateEliminationBracket(teams: FixtureTeam[]) {
  const matches: FixtureMatch[] = [];
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(teams.length)));
  const byesCount = bracketSize - teams.length;
  const slots: Array<FixtureTeam | null> = [...teams, ...Array(byesCount).fill(null)];

  let currentSlots = slots;
  let roundNumber = 1;
  let currentParticipants = bracketSize;

  while (currentParticipants >= 2) {
    const roundName = getRoundName(currentParticipants, roundNumber);
    for (let index = 0; index < currentParticipants / 2; index += 1) {
      const home = currentSlots[index * 2];
      const away = currentSlots[index * 2 + 1];

      matches.push({
        homeTeamId: home?.id ?? null,
        awayTeamId: away?.id ?? null,
        round: roundNumber,
        groupName: roundName,
        matchLogicIdentifier:
          home && away
            ? `${home.name} vs ${away.name}`
            : home
              ? `${home.name} vs BYE`
              : away
                ? `BYE vs ${away.name}`
                : null,
      });
    }

    currentSlots = Array(currentParticipants / 2).fill(null);
    currentParticipants /= 2;
    roundNumber += 1;
  }

  return matches;
}

function buildGroupKnockoutPairings(groups: TeamGroup[]) {
  const pairings: Array<{ home: string; away: string }> = [];

  if (groups.length === 3) {
    return {
      participants: 4,
      pairings: [
        { home: "1A", away: "Mejor 2°" },
        { home: "1B", away: "1C" },
      ],
    };
  }

  for (let index = 0; index < groups.length; index += 2) {
    const current = groups[index];
    const next = groups[index + 1];

    if (!current || !next) {
      continue;
    }

    pairings.push({ home: `1${current.label.split(" ")[1]}`, away: `2${next.label.split(" ")[1]}` });
    pairings.push({ home: `1${next.label.split(" ")[1]}`, away: `2${current.label.split(" ")[1]}` });
  }

  return {
    participants: groups.length * 2,
    pairings,
  };
}

function generateGroupPlusKnockout(groups: TeamGroup[]) {
  const groupStageMatches = groups.flatMap((group) => generateRoundRobinForGroup(group.teams, group.label));
  const { pairings: firstRoundPairings, participants: firstRoundParticipants } = buildGroupKnockoutPairings(groups);
  const knockoutMatches: FixtureMatch[] = [];

  let currentParticipants = firstRoundParticipants;
  let currentPairings = firstRoundPairings;
  let roundNumber = Math.max(...groupStageMatches.map((match) => match.round), 0) + 1;
  let previousRoundName = "";

  while (currentParticipants >= 2 && currentPairings.length > 0) {
    const roundName = getRoundName(currentParticipants, roundNumber);

    currentPairings.forEach((pairing) => {
      knockoutMatches.push({
        homeTeamId: null,
        awayTeamId: null,
        round: roundNumber,
        groupName: roundName,
        matchLogicIdentifier: `${pairing.home} vs ${pairing.away}`,
      });
    });

    previousRoundName = roundName;
    currentParticipants /= 2;
    roundNumber += 1;

    currentPairings = Array.from({ length: Math.floor(currentPairings.length / 2) }, (_, index) => ({
      home: `Ganador ${previousRoundName} ${index * 2 + 1}`,
      away: `Ganador ${previousRoundName} ${index * 2 + 2}`,
    }));
  }

  return [...groupStageMatches, ...knockoutMatches];
}

export function generateRoundRobin(teams: FixtureTeam[]): FixtureMatch[] {
  return generateRoundRobinForGroup(teams);
}

export function generateElimination(teams: FixtureTeam[]): FixtureMatch[] {
  return generateEliminationBracket(teams);
}

export function generateFixtureMatches(teams: FixtureTeam[], options: FixtureGenerationOptions): FixtureMatch[] {
  const groupCount = Math.max(1, options.groupCount ?? 1);
  let matches: FixtureMatch[] = [];

  if (options.format === "ELIMINATORIA") {
    matches = generateEliminationBracket(teams);
  } else if (options.format === "GRUPOS_ELIMINATORIA") {
    if (groupCount < 2 || (groupCount !== 3 && !isPowerOfTwo(groupCount))) {
      throw new Error("El formato grupos + eliminatoria permite 2, 3, 4, 8 o mas grupos en potencia de 2. Con 3 grupos clasifican los primeros de cada grupo y el mejor 2°.");
    }

    const groups = distributeTeamsIntoGroups(teams, groupCount, options.seededTeamIds);
    matches = generateGroupPlusKnockout(groups);
  } else if (groupCount <= 1) {
    matches = generateRoundRobinForGroup(teams);
  } else {
    const groups = distributeTeamsIntoGroups(teams, groupCount, options.seededTeamIds);
    matches = groups.flatMap((group) => generateRoundRobinForGroup(group.teams, group.label));
  }

  return assignScheduleToMatches(matches, options.schedulingRules);
}

export function estimateFixtureMatchCount(teams: FixtureTeam[], options: Omit<FixtureGenerationOptions, "schedulingRules">): number {
  return generateFixtureMatches(teams, options).length;
}

export function estimateRequiredMatchdays(matchCount: number, matchesPerMatchday: number) {
  return Math.ceil(matchCount / Math.max(1, matchesPerMatchday));
}