"use client";

import { useMemo } from "react";
import type { VitalityDayLog, TrainingProgress } from "@/lib/vitality";
import {
  buildSeries,
  glycemiaSeries,
  sleepSeries,
  phase1Progress,
} from "@/lib/vitality";
import { GLYCEMIA_TARGET } from "@/lib/vitality";

interface Props {
  history: VitalityDayLog[];
  todayLog: VitalityDayLog;
  training: TrainingProgress;
}

export default function InsightsStrip({ history, todayLog, training }: Props) {
  const points = useMemo(
    () => buildSeries(history, todayLog, 14),
    [history, todayLog]
  );
  const gly = useMemo(() => glycemiaSeries(points), [points]);
  const sleep = useMemo(() => sleepSeries(points).slice(-7), [points]);
  const phase = useMemo(() => phase1Progress(training), [training]);

  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/50 p-3">
      <div className="grid grid-cols-3 gap-2">
        {/* Glycemia sparkline */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-2 min-h-[88px] flex flex-col">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">
            Glycemia
          </p>
          <GlycemiaSpark values={gly} />
          <p className="text-[9px] text-slate-600 mt-auto pt-1">
            {GLYCEMIA_TARGET.min}–{GLYCEMIA_TARGET.max}
          </p>
        </div>

        {/* Sleep 7 bars */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-2 min-h-[88px] flex flex-col">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">
            Sleep 7d
          </p>
          <SleepBars days={sleep} />
        </div>

        {/* Phase ring */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-2 min-h-[88px] flex flex-col items-center justify-center">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 self-start">
            Phase 1
          </p>
          <PhaseRing pct={phase.pct} complete={phase.complete} />
          <p className="text-[9px] text-slate-500 mt-1 tabular-nums">
            {phase.complete
              ? "Cleared"
              : `${Math.round(phase.pct * 100)}%`}
          </p>
        </div>
      </div>
    </section>
  );
}

function GlycemiaSpark({
  values,
}: {
  values: { value: number; inTarget?: boolean }[];
}) {
  if (values.length < 2) {
    return (
      <p className="text-[10px] text-slate-600 flex-1 flex items-center">
        Log to see trend
      </p>
    );
  }

  const nums = values.map((v) => v.value);
  const min = Math.min(...nums, GLYCEMIA_TARGET.min) - 10;
  const max = Math.max(...nums, GLYCEMIA_TARGET.max) + 10;
  const w = 100;
  const h = 36;
  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v.value - min) / (max - min)) * h;
    return { x, y, inTarget: v.inTarget };
  });
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  // target band
  const yMax = h - ((GLYCEMIA_TARGET.max - min) / (max - min)) * h;
  const yMin = h - ((GLYCEMIA_TARGET.min - min) / (max - min)) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full flex-1" preserveAspectRatio="none">
      <rect
        x={0}
        y={yMax}
        width={w}
        height={Math.max(0, yMin - yMax)}
        fill="rgba(52, 211, 153, 0.12)"
      />
      <path d={d} fill="none" stroke="rgb(244, 114, 182)" strokeWidth="1.5" />
      {coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={1.8}
          fill={c.inTarget === false ? "rgb(251, 191, 36)" : "rgb(244, 114, 182)"}
        />
      ))}
    </svg>
  );
}

function SleepBars({
  days,
}: {
  days: { hours: number; quality: number; hasData: boolean }[];
}) {
  const maxH = 10;
  return (
    <div className="flex-1 flex items-end justify-between gap-0.5 px-0.5">
      {days.map((d, i) => {
        const h = d.hasData ? Math.min(1, d.hours / maxH) : 0.08;
        const q = d.quality || 1;
        const opacity = d.hasData ? 0.35 + q * 0.12 : 0.15;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm bg-pink-400"
            style={{ height: `${Math.max(8, h * 100)}%`, opacity }}
            title={d.hasData ? `${d.hours}h q${d.quality}` : "—"}
          />
        );
      })}
    </div>
  );
}

function PhaseRing({ pct, complete }: { pct: number; complete: boolean }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, pct)));

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="rgb(30, 41, 59)"
        strokeWidth="4"
      />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={complete ? "rgb(52, 211, 153)" : "rgb(244, 114, 182)"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
        className="transition-all duration-700"
      />
      <text
        x="24"
        y="26"
        textAnchor="middle"
        className="fill-pink-100"
        style={{ fontSize: "9px", fontWeight: 600 }}
      >
        {complete ? "★" : `${Math.round(pct * 100)}`}
      </text>
    </svg>
  );
}
