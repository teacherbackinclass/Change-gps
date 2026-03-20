import React, { useMemo, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from '../components/AppState';

export default function CoachPage() {
  const { config } = useConfig();
  const { state } = useAppState();
  const [query, setQuery] = useState('');

  const items = config.content?.coachLibrary?.items || [];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(it => {
        const roleOK = (it.role_tags || []).includes('BOTH') || (it.role_tags || []).includes(state.role);
        const textOK = !q || (it.title || '').toLowerCase().includes(q) || (it.summary || '').toLowerCase().includes(q);
        return roleOK && textOK;
      })
      .slice(0, 5);
  }, [items, query, state.role]);

  return (
    <div className="max-w-3xl mx-auto mt-6 animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mode A Coach</h1>
        <p className="text-slate-600 mt-2">Deterministic retrieval from curated library (beta).</p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (e.g., ‘rumors’, ‘resistance’)"
          className="w-full mt-6 p-4 rounded-xl border border-slate-300 bg-slate-50"
        />

        <div className="mt-6 space-y-3">
          {matches.map(m => (
            <div key={m.id} className="p-4 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-900">{m.title}</div>
              <div className="text-slate-600 text-sm mt-1">{m.summary}</div>
              <div className="mt-3 text-sm">
                <a className="text-indigo-700 font-semibold" href={m.url} target="_blank" rel="noreferrer">Open source</a>
              </div>
              {(m.citations || []).length > 0 && (
                <div className="mt-3 text-xs text-slate-500">
                  Sources: {m.citations.map((c, i) => (
                    <span key={i}>
                      <a className="underline" href={c.url} target="_blank" rel="noreferrer">{c.title}</a>{i < m.citations.length - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {matches.length === 0 && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">No matches found. Try a broader term.</div>
          )}
        </div>
      </div>
    </div>
  );
}
