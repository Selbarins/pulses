"use client";

import type { PracticeId, TrainingProgress } from "@/lib/vitality";
import {
  PHASE1_PRACTICES,
  PHASE1_RULES,
} from "@/lib/vitality";

interface Props {
  practicesToday: PracticeId[];
  training: TrainingProgress;
  onPractice: (id: PracticeId) => void;
}

export default function TrainingCard({
  practicesToday,
  training,
  onPractice,
}: Props) {
  const totalLogs = Object.values(training.practiceCounts).reduce((a, b) => a + b, 0);
  const progressPct = Math.min(
    100,
    Math.round((totalLogs / PHASE1_RULES.minPracticeLogs) * 100)
  );

  return (
    <section className="rounded-2xl border border-pink-500/20 bg-gradient-to-b from-pink-950/30 to-slate-900/80 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-pink-400/70">
            Campaign · Phase 1
          </p>
          <h2 className="text-base font-semibold text-pink-50">Initiation</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            No equipment · Learn the 5 patterns
          </p>
        </div>
        {training.phase1Complete ? (
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Complete ★
          </span>
        ) : (
          <span className="text-[10px] px-2 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/25">
            {totalLogs}/{PHASE1_RULES.minPracticeLogs}
          </span>
        )}
      </div>

      {/* Phase progress bar */}
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-2">
        {PHASE1_PRACTICES.map((p) => {
          const count = training.practiceCounts[p.id] ?? 0;
          const doneToday = practicesToday.includes(p.id);
          const mastered = count >= PHASE1_RULES.minPerPractice;

          return (
            <button
              key={p.id}
              onClick={() => onPractice(p.id)}
              disabled={doneToday}
              className={`w-full text-left rounded-xl border p-3 transition active:scale-[0.98] ${
                doneToday
                  ? "border-pink-500/40 bg-pink-500/15"
                  : "border-slate-700/60 bg-slate-950/50 hover:border-pink-500/30 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-pink-100">
                      {p.name}
                    </span>
                    {mastered && (
                      <span className="text-[9px] text-emerald-400">MASTERED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    {p.pattern} · {p.howTo.slice(0, 42)}…
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-pink-300/80 tabular-nums">
                    ×{count}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {doneToday ? "Done" : `+${p.xp} XP`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-slate-500">
        Sessions {training.sessionsCompleted}/{PHASE1_RULES.minSessions}
        {" · "}
        Hit each practice {PHASE1_RULES.minPerPractice}× to clear the phase
      </p>
    </section>
  );
}
