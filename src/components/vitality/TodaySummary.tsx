"use client";

import type { VitalityDayLog, VitalityXpBreakdown } from "@/lib/vitality";
import { energyReason } from "@/lib/vitality";

interface Props {
  log: VitalityDayLog;
  breakdown: VitalityXpBreakdown;
}

function Dot({ ok }: { ok: boolean | undefined }) {
  if (ok === undefined)
    return <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />;
  return (
    <span
      className={`w-2 h-2 rounded-full inline-block ${
        ok ? "bg-emerald-400" : "bg-amber-400"
      }`}
    />
  );
}

export default function TodaySummary({ log, breakdown }: Props) {
  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-sm font-medium text-pink-300">Today</h2>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Dot ok={log.glycemia != null} /> Glycemia
        </span>
        <span className="flex items-center gap-1.5">
          <Dot ok={log.sleepHours != null} /> Sleep
        </span>
        <span className="flex items-center gap-1.5">
          <Dot ok={log.trained} /> Training
        </span>
        <span className="flex items-center gap-1.5">
          <Dot ok={log.proteinOk} /> Protein
        </span>
        <span className="flex items-center gap-1.5">
          <Dot ok={log.hygieneDone} /> Hygiene
        </span>
      </div>

      {log.energy != null && (
        <p className="text-xs text-slate-400">
          Energy {log.energy}/5 · {energyReason(log)}
        </p>
      )}

      <p className="text-xs text-slate-500 tabular-nums">
        Breakdown: G {breakdown.glycemia} · S {breakdown.sleep} · T{" "}
        {breakdown.training} · P {breakdown.protein} · H {breakdown.hygiene}
      </p>
    </section>
  );
}
