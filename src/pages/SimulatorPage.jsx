import React from 'react';
import { useAppState } from '../components/AppState';

export default function SimulatorPage() {
  const { state } = useAppState();
  return (
    <div className="max-w-3xl mx-auto mt-6 animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Simulator</h1>
        <p className="text-slate-600 mt-2">Safe practice scenarios (beta placeholder).</p>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-sm font-semibold">Viewing as: {state.role.replace('_', ' ')}</div>
          <p className="text-slate-700 mt-2">Next: we’ll add a branching scenario that matches your barrier and zone.</p>
        </div>
      </div>
    </div>
  );
}
