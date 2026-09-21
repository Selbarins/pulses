"use client";

import type { VitalityDayLog, VitalityXpBreakdown } from "@/lib/vitality";

interface Props {
  log: VitalityDayLog;
  breakdown: VitalityXpBreakdown;
}

function Seal({ active, label }: { active?: boolean; label: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 min-w-[48px] transition-all duration-300 ${
        active ? "opacity-100 scale-100" : "opacity-40 scale-95"
      }`}
    >
      <div
        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          active
            ? "border-pink-400 bg-pink-500/20 text-pink-200 shadow-[0_0_14px_rgba(244,114,182,0.5)] animate-seal-pop"
            : "border-slate-600 bg-slate-800/50 text-slate-500"
        }`}
      >
        {active ? "✓" : "·"}
      </div>
      <span className="text-[9px] text-slate-400 tracking-wide">{label}</span>
    </div>
  );
}

export default function TodaySummary({ log }: Props) {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/50 px-3 py-3">
      <div className="flex justify-between items-center">
        <Seal active={log.glycemia != null} label="Glycemia" />
        <Seal active={log.sleepHours != null} label="Sleep" />
        <Seal active={(log.practicesToday?.length ?? 0) > 0} label="Train" />
        <Seal
          active={
            !!log.proteinHit ||
            (!!log.menus && Object.keys(log.menus).length > 0)
          }
          label="Fuel"
        />
        <Seal
          active={!!log.hygiene && Object.values(log.hygiene).some(Boolean)}
          label="Recover"
        />
      </div>
    </section>
  );
}
