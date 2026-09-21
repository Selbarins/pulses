/**
 * Vitality domain types.
 * Keep pure — no React, no side effects.
 */

export type TrainingType = "strength" | "other";

/** Single day’s logged values (partial = not yet logged) */
export interface VitalityDayLog {
  date: string; // YYYY-MM-DD (Casablanca)

  // Glycemia
  glycemia?: number;
  glycemiaInTarget?: boolean;

  // Sleep
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;

  // Training
  trained?: boolean;
  trainingType?: TrainingType;

  // Nutrition (simple for now)
  proteinOk?: boolean;

  // Hygiene & recovery
  hygieneDone?: boolean;

  // Derived (not free input)
  energy?: 1 | 2 | 3 | 4 | 5;
}

/** Result of XP calculation for one day */
export interface VitalityXpBreakdown {
  glycemia: number;
  sleep: number;
  training: number;
  protein: number;
  hygiene: number;
  total: number;
}

/** Editable metric definition (lives in metrics.ts) */
export interface VitalityMetricDef {
  id: keyof Omit<VitalityDayLog, "date" | "energy">;
  label: string;
  description?: string;
  /** Base XP when the metric is successfully logged / completed */
  baseXp: number;
  /** Extra XP when a quality condition is met */
  bonusXp?: number;
  /** Soft daily cap for this metric */
  dailyCap?: number;
}
