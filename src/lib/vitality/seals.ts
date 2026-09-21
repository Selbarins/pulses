import type { VitalityDayLog } from "./types";

/** Same 5 seals as TodaySummary UI. Returns 0–5. */
export function countTodaySeals(log: VitalityDayLog): number {
  let n = 0;
  if (log.glycemia != null) n++;
  if (log.sleepHours != null) n++;
  if ((log.practicesToday?.length ?? 0) > 0) n++;
  if (log.proteinHit || (log.menus && Object.keys(log.menus).length > 0)) n++;
  if (log.hygiene && Object.values(log.hygiene).some(Boolean)) n++;
  return n;
}

/** 0–1 for orb glow / Soul Orb impact */
export function vitalityGlow01(log: VitalityDayLog): number {
  return countTodaySeals(log) / 5;
}
