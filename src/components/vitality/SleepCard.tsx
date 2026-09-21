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

  const handleLog = () => {
    const n = parseFloat(h);
    if (Number.isNaN(n) || n <= 0) return;
    onLog(n, q);
  };

  const logged = hours != null;

  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-sm font-medium text-pink-300">Sleep</h2>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder="Hours"
          value={h}
          onChange={(e) => setH(e.target.value)}
          className="w-24 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50"
        />
        <span className="text-xs text-slate-500">hours</span>
      </div>

      <div className="flex gap-1.5">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            onClick={() => setQ(n)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              q === n
                ? "bg-pink-600/80 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 text-center">Quality 1–5</p>

      <button
        onClick={handleLog}
        className="w-full py-2.5 rounded-xl bg-pink-600/80 hover:bg-pink-500 text-sm font-medium text-white transition"
      >
        {logged ? "Update" : "Log sleep"}
      </button>

      {logged && (
        <p className="text-xs text-slate-400">
          Logged: {hours}h · quality {quality}/5
        </p>
      )}
    </section>
  );
}
