/**
 * Pure XP calculation for Vitality.
 * Edit numbers in metrics.ts — this file only applies the rules.
 */

import type { VitalityDayLog, VitalityXpBreakdown } from "./types";
import {
  GLYCEMIA_TARGET,
  SLEEP_TARGETS,
  METRIC_BY_ID,
  VITALITY_METRICS,
} from "./metrics";
import { applyMultipliers } from "@/lib/xp/calculator";

/**
 * Calculate XP earned from a single day’s vitality log.
 * Returns breakdown + total (before streak/edge multipliers).
 */
export function calculateVitalityXp(log: VitalityDayLog): VitalityXpBreakdown {
  let glycemia = 0;
  let sleep = 0;
  let training = 0;
  let protein = 0;
  let hygiene = 0;

  // Glycemia
  if (log.glycemia != null) {
    const m = METRIC_BY_ID.glycemia;
    glycemia = m.baseXp;
    const inTarget =
      log.glycemiaInTarget ??
      (log.glycemia >= GLYCEMIA_TARGET.min &&
        log.glycemia <= GLYCEMIA_TARGET.max);
    if (inTarget && m.bonusXp) glycemia += m.bonusXp;
    if (m.dailyCap) glycemia = Math.min(glycemia, m.dailyCap);
  }

  // Sleep (hours + quality treated as one metric)
  if (log.sleepHours != null || log.sleepQuality != null) {
    const m = METRIC_BY_ID.sleepHours;
    sleep = m.baseXp;
    const hoursOk =
      log.sleepHours != null && log.sleepHours >= SLEEP_TARGETS.minHoursForBonus;
    const qualityOk =
      log.sleepQuality != null &&
      log.sleepQuality >= SLEEP_TARGETS.minQualityForBonus;
    if (hoursOk && qualityOk && m.bonusXp) sleep += m.bonusXp;
    if (m.dailyCap) sleep = Math.min(sleep, m.dailyCap);
  }

  // Training
  if (log.trained) {
    const m = METRIC_BY_ID.trained;
    training = m.baseXp;
    if (log.trainingType === "strength" && m.bonusXp) {
      training += m.bonusXp;
    }
    if (m.dailyCap) training = Math.min(training, m.dailyCap);
  }

  // Protein
  if (log.proteinOk) {
    const m = METRIC_BY_ID.proteinOk;
    protein = m.baseXp;
    if (m.dailyCap) protein = Math.min(protein, m.dailyCap);
  }

  // Hygiene
  if (log.hygieneDone) {
    const m = METRIC_BY_ID.hygieneDone;
    hygiene = m.baseXp;
    if (m.dailyCap) hygiene = Math.min(hygiene, m.dailyCap);
  }

  const total = glycemia + sleep + training + protein + hygiene;

  return { glycemia, sleep, training, protein, hygiene, total };
}

/**
 * Apply streak + edge multipliers and return final XP to award.
 */
export function awardVitalityXp(
  log: VitalityDayLog,
  streakMultiplier = 1,
  edgeMultiplier = 1
): { breakdown: VitalityXpBreakdown; finalXp: number } {
  const breakdown = calculateVitalityXp(log);
  const finalXp = applyMultipliers(
    breakdown.total,
    streakMultiplier,
    edgeMultiplier
  );
  return { breakdown, finalXp };
}

/**
 * How much XP is still available today (useful for UI progress).
 */
export function maxPossibleDailyXp(): number {
  return VITALITY_METRICS.reduce((sum, m) => {
    const max = (m.baseXp ?? 0) + (m.bonusXp ?? 0);
    return sum + (m.dailyCap ? Math.min(max, m.dailyCap) : max);
  }, 0);
}
