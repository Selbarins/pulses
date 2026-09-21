"use client";

import { useState } from "react";
import { GLYCEMIA_TARGET } from "@/lib/vitality";

interface Props {
  value?: number;
  inTarget?: boolean;
  onLog: (glycemia: number, inTarget: boolean) => void;
}

export default function GlycemiaCard({ value, inTarget, onLog }: Props) {
  const [input, setInput] = useState(value?.toString() ?? "");
  const logged = value != null;

  const handleClaim = () => {
    const n = parseFloat(input);
    if (Number.isNaN(n) || n <= 0) return;
    const target = n >= GLYCEMIA_TARGET.min && n <= GLYCEMIA_TARGET.max;
    onLog(n, target);
  };

  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-pink-400/60">
            Quest
          </p>
          <h2 className="text-sm font-medium text-pink-100">Morning Glycemia</h2>
        </div>
        {logged && (
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
              inTarget
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/25"
            }`}
          >
            {inTarget ? "In range ★" : "Off range"}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder={`${GLYCEMIA_TARGET.min}–${GLYCEMIA_TARGET.max}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50"
        />
        <span className="self-center text-[10px] text-slate-500 w-10">
          {GLYCEMIA_TARGET.unit}
        </span>
      </div>

      <button
        onClick={handleClaim}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-700 to-pink-500 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:brightness-110 active:scale-[0.98] transition"
      >
        {logged ? "Update reading" : "Claim XP"}
      </button>
    </section>
  );
}
