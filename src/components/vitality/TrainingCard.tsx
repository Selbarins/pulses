"use client";

import type { TrainingType } from "@/lib/vitality";

interface Props {
  trained?: boolean;
  trainingType?: TrainingType;
  onLog: (trained: boolean, type: TrainingType) => void;
}

export default function TrainingCard({ trained, trainingType, onLog }: Props) {
  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-sm font-medium text-pink-300">Training</h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onLog(true, "strength")}
          className={`py-3 rounded-xl text-sm font-medium transition ${
            trained && trainingType === "strength"
              ? "bg-pink-600/80 text-white ring-2 ring-pink-400/50"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Strength
        </button>
        <button
          onClick={() => onLog(true, "other")}
          className={`py-3 rounded-xl text-sm font-medium transition ${
            trained && trainingType === "other"
              ? "bg-pink-600/80 text-white ring-2 ring-pink-400/50"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Other
        </button>
      </div>

      {trained && (
        <button
          onClick={() => onLog(false, "other")}
          className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Clear
        </button>
      )}
    </section>
  );
}
