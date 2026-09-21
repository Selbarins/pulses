/**
 * Read sealed history (+ optional today) for compact charts.
 */

import type { VitalityDayLog, TrainingProgress } from "./types";
import { calculateVitalityXp } from "./xp";
import { PHASE1_RULES } from "./training";
import { casablancaDateISO, toISODateKey } from "@/lib/utils/casablanca";

export interface DayPoint {
  date: string; // YYYY-MM-DD
  glycemia?: number;
  glycemiaInTarget?: boolean;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  trained: boolean;
  proteinHit: boolean;
  recoveryCount: number;
  xp: number;
}

function toPoint(log: VitalityDayLog): DayPoint {
  return {
    date: toISODateKey(log.date),
    glycemia: log.glycemia,
    glycemiaInTarget: log.glycemiaInTarget,
    sleepHours: log.sleepHours,
    sleepQuality: log.sleepQuality,
    trained: (log.practicesToday?.length ?? 0) > 0 || !!log.fullSession,
    proteinHit: !!log.proteinHit,
    recoveryCount: log.hygiene
      ? Object.values(log.hygiene).filter(Boolean).length
      : 0,
    xp: calculateVitalityXp(log).total,
  };
}

/** Merge sealed history + today, newest last, unique by date */
export function buildSeries(
  history: VitalityDayLog[],
  todayLog?: VitalityDayLog | null,
  maxDays = 14
): DayPoint[] {
  const map = new Map<string, DayPoint>();

  for (const h of history) {
    if (!h?.date) continue;
    map.set(toISODateKey(h.date), toPoint(h));
  }
  if (todayLog?.date) {
    map.set(toISODateKey(todayLog.date), toPoint(todayLog));
  }

  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-maxDays);
}

export function glycemiaSeries(points: DayPoint[]) {
  return points
    .filter((p) => p.glycemia != null)
    .map((p) => ({
      date: p.date,
      value: p.glycemia as number,
      inTarget: p.glycemiaInTarget,
    }));
}

export function sleepSeries(points: DayPoint[]) {
  return points.map((p) => ({
    date: p.date,
    hours: p.sleepHours ?? 0,
    quality: p.sleepQuality ?? 0,
    hasData: p.sleepHours != null,
  }));
}

export function phase1Progress(training: TrainingProgress) {
  const totalLogs = Object.values(training.practiceCounts).reduce(
    (a, b) => a + b,
    0
  );
  const practicePct = Math.min(1, totalLogs / PHASE1_RULES.minPracticeLogs);
  const sessionPct = Math.min(
    1,
    training.sessionsCompleted / PHASE1_RULES.minSessions
  );
  const perPractice = Object.values(training.practiceCounts);
  const masteryPct =
    perPractice.length === 0
      ? 0
      : perPractice.filter((c) => c >= PHASE1_RULES.minPerPractice).length /
        perPractice.length;

  const pct = training.phase1Complete
    ? 1
    : Math.min(1, practicePct * 0.5 + sessionPct * 0.25 + masteryPct * 0.25);

  return {
    pct,
    totalLogs,
    sessionsCompleted: training.sessionsCompleted,
    complete: training.phase1Complete,
  };
}

export function todayISO() {
  return casablancaDateISO();
}
