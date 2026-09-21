/**
 * Vitality metrics — EDIT THIS FILE to change goals / XP values.
 * New metrics can be added here; UI and XP calculator will pick them up.
 */

import type { VitalityMetricDef } from "./types";

/** Glycemia target range (edit when goals change) */
export const GLYCEMIA_TARGET = {
  unit: "mg/dL" as const,
  min: 70,
  max: 140,
};

/** Sleep thresholds that grant bonus XP */
export const SLEEP_TARGETS = {
  minHoursForBonus: 6.5,
  minQualityForBonus: 4 as 1 | 2 | 3 | 4 | 5,
};

/**
 * Canonical list of vitality metrics.
 * Order here is the suggested UI order.
 */
export const VITALITY_METRICS: VitalityMetricDef[] = [
  {
    id: "glycemia",
    label: "Morning Glycemia",
    description: "Log your morning reading. Bonus if inside target range.",
    baseXp: 40,
    bonusXp: 25,
    dailyCap: 65,
  },
  {
    id: "sleepHours",
    label: "Sleep",
    description: "Hours + quality (1–5). Bonus for enough hours + good quality.",
    baseXp: 50,
    bonusXp: 30,
    dailyCap: 80,
  },
  {
    id: "trained",
    label: "Training",
    description: "Did you train today? Strength preferred for now.",
    baseXp: 80,
    bonusXp: 20, // extra when type === "strength"
    dailyCap: 100,
  },
  {
    id: "proteinOk",
    label: "Protein / Nutrition",
    description: "Simple check for now — hit protein target?",
    baseXp: 35,
    dailyCap: 35,
  },
  {
    id: "hygieneDone",
    label: "Hygiene & Recovery",
    description: "Basic recovery checklist done.",
    baseXp: 20,
    dailyCap: 20,
  },
];

/** Quick lookup by id */
export const METRIC_BY_ID = Object.fromEntries(
  VITALITY_METRICS.map((m) => [m.id, m])
) as Record<string, VitalityMetricDef>;
