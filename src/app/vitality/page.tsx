"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import AttributeShell from "@/components/layout/AttributeShell";
import type { Attribute } from "@/types/attributes";
import type {
  VitalityDayLog,
  TrainingProgress,
  PracticeId,
  HygieneId,
  MenuSlot,
} from "@/lib/vitality";
import {
  calculateVitalityXp,
  deriveEnergy,
  applyXpToVitality,
  loadVitalityState,
  saveVitalityState,
  checkPhase1Complete,
  PHASE1_RULES,
} from "@/lib/vitality";

import LevelProgress from "@/components/vitality/LevelProgress";
import TodaySummary from "@/components/vitality/TodaySummary";
import GlycemiaCard from "@/components/vitality/GlycemiaCard";
import SleepCard from "@/components/vitality/SleepCard";
import TrainingCard from "@/components/vitality/TrainingCard";
import NutritionCard from "@/components/vitality/NutritionCard";
import HygieneCard from "@/components/vitality/HygieneCard";

export default function VitalityPage() {
  const [attr, setAttr] = useState<Attribute | null>(null);
  const [log, setLog] = useState<VitalityDayLog | null>(null);
  const [training, setTraining] = useState<TrainingProgress | null>(null);
  const [prevTotal, setPrevTotal] = useState(0);
  const [ready, setReady] = useState(false);

  // Load once
  useEffect(() => {
    const s = loadVitalityState();
    setAttr(s.attribute);
    setLog(s.dayLog);
    setTraining(s.training);
    setPrevTotal(calculateVitalityXp(s.dayLog).total);
    setReady(true);
  }, []);

  // Persist whenever state changes
  useEffect(() => {
    if (!ready || !attr || !log || !training) return;
    saveVitalityState(attr, log, training);
  }, [attr, log, training, ready]);

  const breakdown = useMemo(
    () => (log ? calculateVitalityXp(log) : { glycemia: 0, sleep: 0, training: 0, protein: 0, hygiene: 0, total: 0 }),
    [log]
  );

  const applyLog = useCallback(
    (next: VitalityDayLog, trainingPatch?: Partial<TrainingProgress>) => {
      if (!attr || !training) return;

      const withEnergy = { ...next, energy: deriveEnergy(next) };
      const nextBreakdown = calculateVitalityXp(withEnergy);
      const delta = nextBreakdown.total - prevTotal;

      let nextTraining = trainingPatch
        ? { ...training, ...trainingPatch }
        : training;

      // Phase 1 completion bonus
      if (
        !nextTraining.phase1Complete &&
        checkPhase1Complete(nextTraining)
      ) {
        nextTraining = { ...nextTraining, phase1Complete: true };
        // bonus applied as extra delta
        setAttr((a) =>
          a
            ? applyXpToVitality(
                applyXpToVitality(a, Math.max(0, delta)),
                PHASE1_RULES.completionBonusXp
              )
            : a
        );
      } else if (delta > 0) {
        setAttr((a) => (a ? applyXpToVitality(a, delta) : a));
      }

      setLog(withEnergy);
      setPrevTotal(nextBreakdown.total);
      setTraining(nextTraining);
    },
    [attr, training, prevTotal]
  );

  const onPractice = (id: PracticeId) => {
    if (!log || !training) return;
    if (log.practicesToday?.includes(id)) return;

    const practicesToday = [...(log.practicesToday ?? []), id];
    const practiceCounts = {
      ...training.practiceCounts,
      [id]: (training.practiceCounts[id] ?? 0) + 1,
    };
    const fullSession = practicesToday.length >= 3;
    const sessionsCompleted =
      fullSession && !log.fullSession
        ? training.sessionsCompleted + 1
        : training.sessionsCompleted;

    applyLog(
      { ...log, practicesToday, fullSession },
      { practiceCounts, sessionsCompleted }
    );
  };

  if (!ready || !attr || !log || !training) {
    return (
      <main className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Loading Vitality…</p>
      </main>
    );
  }

  const level01 = Math.min(1, Math.max(0, (attr.level - 1) / 19));

  return (
    <AttributeShell attribute="vitality" level01={level01} title="Vitality">
      <div className="space-y-4 mt-4 pb-8">
        <LevelProgress
          level={attr.level}
          currentXp={attr.currentXp}
          xpToNext={attr.xpToNext}
          todayXp={breakdown.total}
        />

        <TodaySummary log={log} breakdown={breakdown} />

        <GlycemiaCard
          value={log.glycemia}
          inTarget={log.glycemiaInTarget}
          onLog={(glycemia, inTarget) =>
            applyLog({ ...log, glycemia, glycemiaInTarget: inTarget })
          }
        />

        <SleepCard
          hours={log.sleepHours}
          quality={log.sleepQuality}
          onLog={(hours, quality) =>
            applyLog({ ...log, sleepHours: hours, sleepQuality: quality })
          }
        />

        <TrainingCard
          practicesToday={log.practicesToday ?? []}
          training={training}
          onPractice={onPractice}
        />

        <NutritionCard
          proteinGoal={log.proteinGoal}
          proteinHit={log.proteinHit}
          menus={log.menus}
          shoppingNeeded={log.shoppingNeeded}
          onUpdate={(patch) => applyLog({ ...log, ...patch })}
        />

        <HygieneCard
          hygiene={log.hygiene}
          onToggle={(id: HygieneId) =>
            applyLog({
              ...log,
              hygiene: {
                ...log.hygiene,
                [id]: !log.hygiene?.[id],
              },
            })
          }
        />
      </div>
    </AttributeShell>
  );
}
