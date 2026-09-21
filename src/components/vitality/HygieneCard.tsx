"use client";

interface Props {
  done?: boolean;
  onLog: (done: boolean) => void;
}

export default function HygieneCard({ done, onLog }: Props) {
  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-sm font-medium text-pink-300">Hygiene & Recovery</h2>

      <button
        onClick={() => onLog(!done)}
        className={`w-full py-3 rounded-xl text-sm font-medium transition ${
          done
            ? "bg-emerald-600/80 text-white ring-2 ring-emerald-400/40"
            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
        }`}
      >
        {done ? "Done ✓" : "Mark as done"}
      </button>
    </section>
  );
}
