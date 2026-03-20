import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from '../components/AppState';

export default function ToolsListPage() {
  const { config } = useConfig();
  const { state } = useAppState();
  const [query, setQuery] = useState('');

  const topics = config.content?.toolsTopics?.topics || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.subtitle || '').toLowerCase().includes(q) ||
      (t.best_for || '').toLowerCase().includes(q)
    );
  }, [topics, query]);

  return (
    <div className="max-w-5xl mx-auto mt-6 animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Tools & Scripts</h1>
        <p className="text-slate-600 mt-2">Pick a tool. Get language you can use today.</p>

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scripts, checklists, templates…"
            className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50"
          />
          <div className="text-sm text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-200">
            Viewing as <span className="font-semibold">{state.role.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(t => (
            <Link
              key={t.id}
              to={`/tools/${t.slug}`}
              className="block p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white transition"
            >
              <div className="font-bold text-slate-900">{t.title}</div>
              <div className="text-sm text-slate-600 mt-1">{t.subtitle}</div>
              <div className="mt-3 text-xs text-slate-500">Best for: {t.best_for} • Time: {t.estimated_time}</div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">No tools match that search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
