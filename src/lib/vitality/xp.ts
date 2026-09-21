/**
 * Pure XP calculation for Vitality (all systems).
 */

import type { VitalityDayLog, VitalityXpBreakdown, TrainingProgress } from "./types";
import { GLYCEMIA_TARGET, SLEEP_TARGETS, METRIC_BY_ID } from "./metrics";
import { PHASE1_PRACTICES, PHASE1_RULES, practiceById } from "./training";
import { HYGIENE_ITEMS } from "./hygiene";
import { NUTRITION_DEFAULTS } from "./nutrition";
import { applyMultipliers } from "@/lib/xp/calculator";

export function calculateVitalityXp(
  log: VitalityDayLog,
  training?: TrainingProgress
): VitalityXpBreakdown {
  let glycemia = 0;
  let sleep = 0;
  let trainingXp = 0;
  let protein = 0;
  let hygiene = 0;

  // Glycemia
  if (log.glycemia != null) {
    const m = METRIC_BY_ID.glycemia;
    glycemia = m.baseXp;
    const inTarget =
      log.glycemiaInTarget ??
      (log.glycemia >= GLYCEMIA_TARGET.min && log.glycemia <= GLYCEMIA_TARGET.max);
    if (inTarget && m.bonusXp) glycemia += m.bonusXp;
    if (m.dailyCap) glycemia = Math.min(glycemia, m.dailyCap);
  }

  // Sleep
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

  // Training — sum practice XP + full session bonus
  if (log.practicesToday?.length) {
    for (const id of log.practicesToday) {
      trainingXp += practiceById(id).xp;
    }
    if (log.fullSession || (log.practicesToday.length >= 3)) {
      trainingXp += PHASE1_RULES.fullSessionXp;
    }
  }

  // Protein
  if (log.proteinHit) {
    protein = NUTRITION_DEFAULTS.hitGoalXp;
  } else if (log.menus && Object.keys(log.menus).length >= 2) {
    protein = NUTRITION_DEFAULTS.planMenusXp;
  }

  // Hygiene
  if (log.hygiene) {
    for (const item of HYGIENE_ITEMS) {
      if (log.hygiene[item.id]) hygiene += item.xp;
    }
  }

  const total = glycemia + sleep + trainingXp + protein + hygiene;
  return { glycemia, sleep, training: trainingXp, protein, hygiene, total };
}

export function awardVitalityXp(
  log: VitalityDayLog,
  streakMultiplier = 1,
  edgeMultiplier = 1
) {
  const breakdown = calculateVitalityXp(log);
  const finalXp = applyMultipliers(
    breakdown.total,
    streakMultiplier,
    edgeMultiplier
  );
  return { breakdown, finalXp };
}
