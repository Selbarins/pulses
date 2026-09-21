"use client";

import { useState, useMemo } from "react";
import AttributeShell from "@/components/layout/AttributeShell";
import type { Attribute } from "@/types/attributes";
import type { VitalityDayLog, TrainingType } from "@/lib/vitality";
import {
  calculateVitalityXp,
  deriveEnergy,
  applyXpToVitality,
} from "@/lib/vitality";
import { xpRequiredForLevel } from "@/lib/xp/leveling";

import GlycemiaCard from "@/components/vitality/GlycemiaCard";
import SleepCard from "@/components/vitality/SleepCard";
import TrainingCard from "@/components/vitality/TrainingCard";
import ProteinCard from "@/components/vitality/ProteinCard";
import HygieneCard from "@/components/vitality/HygieneCard";
import LevelProgress from "@/components/vitality/LevelProgress";
import TodaySummary from "@/components/vitality/TodaySummary";

function todayDate() {
  // Casablanca-friendly simple date for now
  return new Date().toISOString().slice(0, 10);
}

const INITIAL_ATTR: Attribute = {
  name: "vitality",
  level: 2,
  currentXp: 180,
  xpToNext: xpRequiredForLevel(3),
  multiplier: 1.0,
};

export default function VitalityPage() {
  const [attr, setAttr] = useState<Attribute>(INITIAL_ATTR);
  const [log, setLog] = useState<VitalityDayLog>({ date: todayDate() });
  const [prevTotal, setPrevTotal] = useState(0);

  const breakdown = useMemo(() => calculateVitalityXp(log), [log]);
  const todayXp = breakdown.total;
  const level01 = Math.min(1, Math.max(0, (attr.level - 1) / 19));

  // Recompute XP delta and apply to attribute whenever log changes
  const applyLog = (next: VitalityDayLog) => {
    const withEnergy = { ...next, energy: deriveEnergy(next) };
    const nextBreakdown = calculateVitalityXp(withEnergy);
    const delta = nextBreakdown.total - prevTotal;

    setLog(withEnergy);
    setPrevTotal(nextBreakdown.total);

    if (delta > 0) {
      setAttr((a) => applyXpToVitality(a, delta));
    }
    // Note: if user lowers a value, we don't remove XP in this simple version
  };

  return (
    <AttributeShell attribute="vitality" level01={level01} title="Vitality">
      <div className="space-y-4 mt-4">
        <LevelProgress
          level={attr.level}
          currentXp={attr.currentXp}
          xpToNext={attr.xpToNext}
          todayXp={todayXp}
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
          trained={log.trained}
          trainingType={log.trainingType}
          onLog={(trained, type: TrainingType) =>
            applyLog({
              ...log,
              trained,
              trainingType: trained ? type : undefined,
            })
          }
        />

        <ProteinCard
          proteinOk={log.proteinOk}
          onLog={(ok) => applyLog({ ...log, proteinOk: ok })}
        />

        <HygieneCard
          done={log.hygieneDone}
          onLog={(done) => applyLog({ ...log, hygieneDone: done })}
        />
      </div>
    </AttributeShell>
  );
}
