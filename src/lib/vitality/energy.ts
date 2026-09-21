/**
 * Daily energy score (1–5) is derived, not free-input.
 * Primary driver: sleep quality + hours.
 */

import type { VitalityDayLog } from "./types";
import { SLEEP_TARGETS } from "./metrics";

/**
 * Derive a 1–5 energy score from the day’s log.
 * Returns undefined if not enough data yet.
 */
export function deriveEnergy(log: VitalityDayLog): 1 | 2 | 3 | 4 | 5 | undefined {
  if (log.sleepHours == null && log.sleepQuality == null) {
    return undefined;
  }

  let score = 3; // neutral baseline

  if (log.sleepQuality != null) {
    score = log.sleepQuality;
  }

  if (log.sleepHours != null) {
    if (log.sleepHours < 5) score -= 2;
    else if (log.sleepHours < SLEEP_TARGETS.minHoursForBonus) score -= 1;
    else if (log.sleepHours >= 8) score += 1;
  }

  // Training today (any practice)
  if ((log.practicesToday?.length ?? 0) > 0) score += 0.5;

  // Glycemia off target
  if (log.glycemiaInTarget === false) score -= 0.5;

  // Any recovery item done
  if (log.hygiene && Object.values(log.hygiene).some(Boolean)) score += 0.25;

  const clamped = Math.min(5, Math.max(1, Math.round(score)));
  return clamped as 1 | 2 | 3 | 4 | 5;
}

/**
 * Human-readable reason for the derived energy (for UI tooltip).
 */
export function energyReason(log: VitalityDayLog): string {
  const parts: string[] = [];
  if (log.sleepQuality != null) parts.push(`Sleep quality ${log.sleepQuality}/5`);
  if (log.sleepHours != null) parts.push(`${log.sleepHours}h sleep`);
  if ((log.practicesToday?.length ?? 0) > 0) parts.push("trained");
  if (log.glycemiaInTarget === false) parts.push("glycemia off-target");
  if (log.hygiene && Object.values(log.hygiene).some(Boolean)) {
    parts.push("recovery done");
  }
  return parts.length ? parts.join(" · ") : "Not enough data yet";
}
