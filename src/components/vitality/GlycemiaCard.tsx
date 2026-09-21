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

  const handleLog = () => {
    const n = parseFloat(input);
    if (Number.isNaN(n) || n <= 0) return;
    const target =
      n >= GLYCEMIA_TARGET.min && n <= GLYCEMIA_TARGET.max;
    onLog(n, target);
  };

  const logged = value != null;

  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-pink-300">Morning Glycemia</h2>
        {logged && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              inTarget
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {inTarget ? "In target" : "Off target"}
          </span>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          inputMode="decimal"
          placeholder={`${GLYCEMIA_TARGET.min}–${GLYCEMIA_TARGET.max}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50"
        />
        <span className="text-xs text-slate-500 shrink-0">
          {GLYCEMIA_TARGET.unit}
        </span>
        <button
          onClick={handleLog}
          className="px-4 py-2 rounded-xl bg-pink-600/80 hover:bg-pink-500 text-sm font-medium text-white transition"
        >
          {logged ? "Update" : "Log"}
        </button>
      </div>

      {logged && (
        <p className="text-xs text-slate-400">
          Logged: {value} {GLYCEMIA_TARGET.unit}
        </p>
      )}
    </section>
  );
}
