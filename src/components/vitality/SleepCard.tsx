"use client";

import { useState } from "react";

interface Props {
  hours?: number;
  quality?: 1 | 2 | 3 | 4 | 5;
  onLog: (hours: number, quality: 1 | 2 | 3 | 4 | 5) => void;
}

export default function SleepCard({ hours, quality, onLog }: Props) {
  const [h, setH] = useState(hours?.toString() ?? "");
  const [q, setQ] = useState<1 | 2 | 3 | 4 | 5>(quality ?? 3);
  const logged = hours != null;

  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/60 p-4 space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-pink-400/60">
          Quest
        </p>
        <h2 className="text-sm font-medium text-pink-100">Sleep</h2>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder="0"
          value={h}
          onChange={(e) => setH(e.target.value)}
          className="w-20 rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-pink-500/50"
        />
        <span className="text-xs text-slate-500">hours</span>
      </div>

      <div className="flex gap-1.5">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            onClick={() => setQ(n)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              q === n
                ? "bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                : "bg-slate-800/80 text-slate-500 hover:bg-slate-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-center text-slate-500">Quality rating</p>

      <button
        onClick={() => {
          const n = parseFloat(h);
          if (Number.isNaN(n) || n <= 0) return;
          onLog(n, q);
        }}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-700 to-pink-500 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:brightness-110 active:scale-[0.98] transition"
      >
        {logged ? "Update sleep" : "Claim XP"}
      </button>
    </section>
  );
}
