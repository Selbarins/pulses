"use client";

import { useState } from "react";
import type { PracticeId, TrainingProgress } from "@/lib/vitality";
import { PHASE1_PRACTICES, PHASE1_RULES, practiceById } from "@/lib/vitality";

interface Props {
  practicesToday: PracticeId[];
  training: TrainingProgress;
  onToggle: (id: PracticeId) => void;
}

export default function TrainingCard({
  practicesToday,
  training,
  onToggle,
}: Props) {
  const [detailId, setDetailId] = useState<PracticeId | null>(null);
  const totalLogs = Object.values(training.practiceCounts).reduce(
    (a, b) => a + b,
    0
  );
  const progressPct = Math.min(
    100,
    Math.round((totalLogs / PHASE1_RULES.minPracticeLogs) * 100)
  );
  const detail = detailId ? practiceById(detailId) : null;

  return (
    <>
      <section className="rounded-2xl border border-pink-500/20 bg-gradient-to-b from-pink-950/30 to-slate-900/80 p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-pink-400/70">
              Campaign · Phase 1
            </p>
            <h2 className="text-base font-semibold text-pink-50">Initiation</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No equipment · 5 patterns
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
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                  doneToday
                    ? "border-pink-500/40 bg-pink-500/15"
                    : "border-slate-700/60 bg-slate-950/50"
                }`}
              >
                <button
                  onClick={() => onToggle(p.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-pink-100">
                      {p.name}
                    </span>
                    {mastered && (
                      <span className="text-[9px] text-emerald-400">
                        MASTERED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">{p.pattern}</p>
                </button>

                <div className="text-right shrink-0">
                  <p className="text-xs text-pink-300/80 tabular-nums">
                    ×{count}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {doneToday ? "Undo" : `+${p.xp}`}
                  </p>
                </div>

                <button
                  onClick={() => setDetailId(p.id)}
                  className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-pink-300 hover:bg-slate-700 shrink-0"
                  aria-label="Details"
                >
                  ?
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-center text-slate-500">
          Sessions {training.sessionsCompleted}/{PHASE1_RULES.minSessions} ·{" "}
          {PHASE1_RULES.minPerPractice}× each practice to clear phase
        </p>
      </section>

      {/* Details modal */}
      {detail && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDetailId(null)}
          />
          <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-2xl bg-[#0f1218] border border-pink-500/20 p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-pink-400/70">
                  {detail.pattern}
                </p>
                <h3 className="text-lg font-semibold text-pink-50">
                  {detail.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailId(null)}
                className="h-8 w-8 rounded-full bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {detail.howTo}
            </p>
            <p className="text-xs text-pink-300/80">+{detail.xp} XP per practice</p>
            <button
              onClick={() => {
                onToggle(detail.id);
                setDetailId(null);
              }}
              className="w-full py-2.5 rounded-xl bg-pink-600 text-sm font-semibold text-white"
            >
              {practicesToday.includes(detail.id)
                ? "Undo practice"
                : "Mark practiced"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
