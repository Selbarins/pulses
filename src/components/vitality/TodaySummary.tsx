"use client";

import type { VitalityDayLog, VitalityXpBreakdown } from "@/lib/vitality";
import { energyReason } from "@/lib/vitality";

interface Props {
  log: VitalityDayLog;
  breakdown: VitalityXpBreakdown;
}

function Seal({ active, label }: { active?: boolean; label: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 min-w-[52px] ${
        active ? "opacity-100" : "opacity-40"
      }`}
    >
      <div
        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
          active
            ? "border-pink-400 bg-pink-500/20 text-pink-200 shadow-[0_0_10px_rgba(244,114,182,0.35)]"
            : "border-slate-600 bg-slate-800/50 text-slate-500"
        }`}
      >
        {active ? "✓" : "·"}
      </div>
      <span className="text-[9px] text-slate-400 tracking-wide">{label}</span>
    </div>
  );
}

export default function TodaySummary({ log, breakdown }: Props) {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.18em] text-pink-400/80">
          Today’s seals
        </h2>
        {log.energy != null && (
          <span className="text-[11px] text-pink-200/80">
            Energy {log.energy}/5
          </span>
        )}
      </div>

      <div className="flex justify-between px-1">
        <Seal active={log.glycemia != null} label="Glycemia" />
        <Seal active={log.sleepHours != null} label="Sleep" />
        <Seal active={(log.practicesToday?.length ?? 0) > 0} label="Train" />
        <Seal active={log.proteinHit || (log.menus && Object.keys(log.menus).length > 0)} label="Fuel" />
        <Seal
          active={log.hygiene && Object.values(log.hygiene).some(Boolean)}
          label="Recover"
        />
      </div>

      {log.energy != null && (
        <p className="text-[10px] text-slate-500 text-center">
          {energyReason(log)}
        </p>
      )}

      <div className="flex justify-center gap-3 text-[10px] text-slate-500 tabular-nums">
        <span>G {breakdown.glycemia}</span>
        <span>S {breakdown.sleep}</span>
        <span>T {breakdown.training}</span>
        <span>P {breakdown.protein}</span>
        <span>R {breakdown.hygiene}</span>
      </div>
    </section>
  );
}
