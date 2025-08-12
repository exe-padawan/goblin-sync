"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

type Microtask = {
  id: string;
  date: string;
  title: string;
  detail?: string;
};

type PlanResponse = {
  task: string;
  startDate: string;
  days: number;
  microtasks: Microtask[];
};

export default function Home() {
  const todayIso = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [task, setTask] = useState("");
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState<string>(todayIso);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  async function generatePlan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, days, startDate }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate plan");
      setPlan(json as PlanResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">gobsync</h1>
            <p className="text-slate-600">Break any goal into daily, 1% microtasks.</p>
          </div>
        </header>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700">Your goal</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                rows={3}
                placeholder="e.g., Launch a personal portfolio website"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Days</label>
              <input
                type="number"
                min={7}
                max={120}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Start date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-3">
              <button
                onClick={generatePlan}
                disabled={loading || task.trim().length < 3}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2.5 font-medium shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Planning…" : "Generate plan"}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </section>

        {plan && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold">Daily microtasks</h2>
                <p className="text-slate-600 text-sm">{plan.days} days starting {plan.startDate}</p>
              </div>
              <button
                onClick={() => setPlan(null)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.microtasks.map((mt) => (
                <div
                  key={mt.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2"
                >
                  <div className="text-xs font-medium text-slate-500">{mt.date}</div>
                  <div className="font-medium">{mt.title}</div>
                  {mt.detail && <div className="text-sm text-slate-600">{mt.detail}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="py-8 text-center text-xs text-slate-500">
          Built with Next.js + Tailwind. Set OPENROUTER_API_KEY to enable AI planning via OpenRouter.
        </footer>
      </div>
    </div>
  );
}
