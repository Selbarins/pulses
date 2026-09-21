"use client";

interface Props {
  proteinOk?: boolean;
  onLog: (ok: boolean) => void;
}

export default function ProteinCard({ proteinOk, onLog }: Props) {
  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-sm font-medium text-pink-300">Protein / Nutrition</h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onLog(true)}
          className={`py-3 rounded-xl text-sm font-medium transition ${
            proteinOk === true
              ? "bg-emerald-600/80 text-white ring-2 ring-emerald-400/40"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Hit target
        </button>
        <button
          onClick={() => onLog(false)}
          className={`py-3 rounded-xl text-sm font-medium transition ${
            proteinOk === false
              ? "bg-slate-700 text-slate-300 ring-2 ring-slate-500/40"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Missed
        </button>
      </div>
    </section>
  );
}
