import React, { useMemo } from 'react';
import { useAppState } from '../components/AppState';

export default function PlanPage() {
  const { state, dispatch } = useAppState();

  const items = useMemo(() => Object.values(state.savedPlan || {}), [state.savedPlan]);
  const sorted = useMemo(() => items.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')), [items]);

  return (
    <div className="max-w-3xl mx-auto mt-6 animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Plan Builder</h1>
            <p className="text-slate-600 mt-2">A simple list of your saved moves (beta).</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold"
          >
            Export PDF
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">
            No items saved yet. Add one from Next Best Move.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {sorted.map((it) => (
              <div key={it.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900">{it.title}</div>
                <div className="text-slate-600 text-sm mt-1">{it.why}</div>
                <ol className="mt-3 list-decimal pl-5 space-y-1 text-slate-800">
                  {(it.steps || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <div className="mt-3 text-xs text-slate-500">Saved: {it.createdAt}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => dispatch({ type: 'RESET_PLAN' })}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
          >
            Clear plan
          </button>
        </div>
      </div>
    </div>
  );
}
