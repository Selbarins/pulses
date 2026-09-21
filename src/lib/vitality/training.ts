/**
 * Training program — Phase 1 Initiation (no equipment).
 * Edit this file to change practices or completion rules.
 */

import type { PracticeId, TrainingProgress } from "./types";

export interface PracticeDef {
  id: PracticeId;
  name: string;
  pattern: string;
  howTo: string;
  xp: number; // XP per practice log
}

export const PHASE1_PRACTICES: PracticeDef[] = [
  {
    id: "sit_to_stand",
    name: "Sit-to-Stand",
    pattern: "Squat",
    howTo: "2–3 sets of 8–12 slow reps. Use a chair. Stand up fully, sit with control.",
    xp: 25,
  },
  {
    id: "hinge",
    name: "Hip Hinge",
    pattern: "Hinge",
    howTo: "2–3 sets of 8–10. Push hips back, soft knees, keep back flat. Bodyweight only.",
    xp: 25,
  },
  {
    id: "push",
    name: "Push-up Progression",
    pattern: "Push",
    howTo: "Wall → incline → knees → full. 2–3 sets of clean reps. Stop before form breaks.",
    xp: 25,
  },
  {
    id: "pull",
    name: "Row / Pull",
    pattern: "Pull",
    howTo: "Towel rows, backpack rows, or table inverted rows. 2–3 × 8–12.",
    xp: 25,
  },
  {
    id: "carry_core",
    name: "Carry or Core",
    pattern: "Core + gait",
    howTo: "Farmer carry with water jugs / bags, or 2–3 × 20–40s dead bugs / hollow hold.",
    xp: 25,
  },
];

/** Phase 1 completion rules */
export const PHASE1_RULES = {
  /** Total practice logs needed across all movements */
  minPracticeLogs: 15,
  /** Minimum times each individual practice must be done */
  minPerPractice: 3,
  /** Minimum full sessions */
  minSessions: 6,
  /** Bonus XP when phase is completed */
  completionBonusXp: 200,
  fullSessionXp: 40, // extra when 3+ practices logged same day
};

export function createInitialTrainingProgress(): TrainingProgress {
  return {
    phase: 1,
    practiceCounts: {
      sit_to_stand: 0,
      hinge: 0,
      push: 0,
      pull: 0,
      carry_core: 0,
    },
    sessionsCompleted: 0,
    phase1Complete: false,
  };
}

/** Check if Phase 1 is complete after a new log */
export function checkPhase1Complete(t: TrainingProgress): boolean {
  if (t.phase1Complete) return true;
  const counts = Object.values(t.practiceCounts);
  const totalLogs = counts.reduce((a, b) => a + b, 0);
  const allPracticesHit = counts.every((c) => c >= PHASE1_RULES.minPerPractice);
  return (
    totalLogs >= PHASE1_RULES.minPracticeLogs &&
    allPracticesHit &&
    t.sessionsCompleted >= PHASE1_RULES.minSessions
  );
}

export function practiceById(id: PracticeId) {
  return PHASE1_PRACTICES.find((p) => p.id === id)!;
}
