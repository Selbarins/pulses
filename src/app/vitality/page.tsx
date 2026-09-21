"use client";

import InsightsStrip from "@/components/vitality/InsightsStrip";
import { useState, useEffect, useMemo, useCallback } from "react";
import AttributeShell from "@/components/layout/AttributeShell";
import type { Attribute } from "@/types/attributes";
import type {
  VitalityDayLog,
  TrainingProgress,
  PracticeId,
  HygieneId,
} from "@/lib/vitality";
import {
  calculateVitalityXp,
  deriveEnergy,
  loadVitalityState,
  saveVitalityState,
  displayAttribute,
  checkPhase1Complete,
  PHASE1_RULES,
  applyXpToVitality,
} from "@/lib/vitality";

import LevelProgress from "@/components/vitality/LevelProgress";
import TodaySummary from "@/components/vitality/TodaySummary";
import GlycemiaCard from "@/components/vitality/GlycemiaCard";
import SleepCard from "@/components/vitality/SleepCard";
import TrainingCard from "@/components/vitality/TrainingCard";
import NutritionCard from "@/components/vitality/NutritionCard";
import HygieneCard from "@/components/vitality/HygieneCard";
import ShoppingCart from "@/components/shopping/ShoppingCart";

export default function VitalityPage() {
  const [attributeBase, setAttributeBase] = useState<Attribute | null>(null);
  const [log, setLog] = useState<VitalityDayLog | null>(null);
  const [training, setTraining] = useState<TrainingProgress | null>(null);
  const [history, setHistory] = useState<VitalityDayLog[]>([]);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [phaseBonusApplied, setPhaseBonusApplied] = useState(false);

  useEffect(() => {
    const s = loadVitalityState();
    setAttributeBase(s.attributeBase);
    setLog(s.dayLog);
    setTraining(s.training);
    setHistory(s.history);
    setPhaseBonusApplied(s.training.phase1Complete);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !attributeBase || !log || !training) return;
    saveVitalityState(attributeBase, log, training, history);
  }, [attributeBase, log, training, history, ready]);

  const breakdown = useMemo(
    () =>
      log
        ? calculateVitalityXp(log)
        : {
            glycemia: 0,
            sleep: 0,
            training: 0,
            protein: 0,
            hygiene: 0,
            total: 0,
          },
    [log]
  );

  const display = useMemo(() => {
    if (!attributeBase || !log) return null;
    let attr = displayAttribute(attributeBase, log);
    // Phase completion bonus is one-shot on base so it survives the day
    return attr;
  }, [attributeBase, log]);

  const setDayLog = useCallback((next: VitalityDayLog) => {
    setLog({ ...next, energy: deriveEnergy(next) });
  }, []);

  const onPracticeToggle = (id: PracticeId) => {
    if (!log || !training) return;
    const current = log.practicesToday ?? [];
    const wasOn = current.includes(id);

    let practicesToday: PracticeId[];
    let practiceCounts = { ...training.practiceCounts };
    let sessionsCompleted = training.sessionsCompleted;

    if (wasOn) {
      practicesToday = current.filter((p) => p !== id);
      practiceCounts[id] = Math.max(0, (practiceCounts[id] ?? 0) - 1);
      // if we drop below 3 practices and had fullSession, undo session count once
      if (log.fullSession && practicesToday.length < 3) {
        sessionsCompleted = Math.max(0, sessionsCompleted - 1);
      }
    } else {
      practicesToday = [...current, id];
      practiceCounts[id] = (practiceCounts[id] ?? 0) + 1;
      if (!log.fullSession && practicesToday.length >= 3) {
        sessionsCompleted = sessionsCompleted + 1;
      }
    }

    const fullSession = practicesToday.length >= 3;

    let nextTraining: TrainingProgress = {
      ...training,
      practiceCounts,
      sessionsCompleted,
    };

    // Phase 1 complete → apply bonus once onto attributeBase
    if (
      !nextTraining.phase1Complete &&
      checkPhase1Complete(nextTraining)
    ) {
      nextTraining = { ...nextTraining, phase1Complete: true };
      if (!phaseBonusApplied) {
        setAttributeBase((b) =>
          b ? applyXpToVitality(b, PHASE1_RULES.completionBonusXp) : b
        );
        setPhaseBonusApplied(true);
      }
    }

    setTraining(nextTraining);
    setDayLog({ ...log, practicesToday, fullSession });
  };

  if (!ready || !attributeBase || !log || !training || !display) {
    return (
      <main className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Loading Vitality…</p>
      </main>
    );
  }

  const level01 = Math.min(1, Math.max(0, (display.level - 1) / 19));

  return (
    <AttributeShell attribute="vitality" level01={level01} title="Vitality">
      <div className="space-y-4 mt-4 pb-8">
        <LevelProgress
          level={display.level}
          currentXp={display.currentXp}
          xpToNext={display.xpToNext}
          todayXp={breakdown.total}
        />

        <TodaySummary log={log} breakdown={breakdown} />

        <InsightsStrip history={history} todayLog={log} training={training} />

        <GlycemiaCard
        value={log.glycemia}
        inTarget={log.glycemiaInTarget}
        onLog={(glycemia, inTarget) =>
          setDayLog({ ...log, glycemia, glycemiaInTarget: inTarget })
        }
        onClear={() => {
          setDayLog({
            ...log,
            glycemia: undefined,
            glycemiaInTarget: undefined,
          });
        }}
      />

        <SleepCard
        hours={log.sleepHours}
        quality={log.sleepQuality}
        onLog={(hours, quality) =>
          setDayLog({ ...log, sleepHours: hours, sleepQuality: quality })
        }
        onClear={() => {
          setDayLog({
            ...log,
            sleepHours: undefined,
            sleepQuality: undefined,
          });
        }}
      />

        <TrainingCard
          practicesToday={log.practicesToday ?? []}
          training={training}
          onToggle={onPracticeToggle}
        />

        <Phase2Teaser unlocked={training.phase1Complete} />

        <NutritionCard
          proteinGoal={log.proteinGoal}
          proteinHit={log.proteinHit}
          menus={log.menus}
          onUpdate={(patch) => setDayLog({ ...log, ...patch })}
          onOpenCart={() => setCartOpen(true)}
        />

        <HygieneCard
          hygiene={log.hygiene}
          onToggle={(id: HygieneId) =>
            setDayLog({
              ...log,
              hygiene: { ...log.hygiene, [id]: !log.hygiene?.[id] },
            })
          }
        />
      </div>

      <ShoppingCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        defaultCategory="nutrition"
      />
    </AttributeShell>
  );
}
