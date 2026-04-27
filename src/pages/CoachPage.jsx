import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind } from 'lucide-react';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from '../components/AppState';

const REGULATE_KEYWORDS = ['overwhelmed','anxious','panic','angry','spinning','can\'t focus','stressed','can\'t think'];

function suggestRegulate(text) {
  const lower = text.toLowerCase();
  return REGULATE_KEYWORDS.some(k => lower.includes(k));
}

export default function CoachPage() {
  const { config }       = useConfig();
  const { state }        = useAppState();
  const [query, setQuery] = useState('');

  const items = config.content?.coachLibrary?.items || [];

  const showRegulateBanner = useMemo(() => suggestRegulate(query), [query]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const roleFiltered = items.filter(it =>
      (it.role_tags || []).includes('BOTH') || (it.role_tags || []).includes(state.role)
    );
    if (!q) return roleFiltered.slice(0, 8);
    const scored = roleFiltered.map(it => {
      const haystack = `${it.title} ${it.summary} ${(it.citations || []).map(c => c.title).join(' ')}`.toLowerCase();
      const score = q.split(' ').filter(Boolean).reduce((s, word) => s + (haystack.includes(word) ? 1 : 0), 0);
      return { ...it, _score: score };
    }).filter(it => it._score > 0).sort((a, b) => b._score - a._score);
    return scored.slice(0, 6);
  }, [items, query, state.role]);

  const noMatch = query.trim() && matches.length === 0;

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4 animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mode A Coach</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Deterministic retrieval from curated sources only. Every result cites its source.
        </p>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search (e.g., resistance, communication, adoption)"
          className="w-full mt-5 p-4 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
          aria-label="Search the coach library"
        />

        {/* regulate suggestion banner */}
        {showRegulateBanner && (
          <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-sm text-indigo-900">
            <Wind className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>
              Sounds like you might be overwhelmed. A quick regulate session can help clarify your thinking first.{' '}
              <Link to="/regulate" className="font-semibold underline">Try Regulate</Link>
            </span>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {noMatch ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm space-y-2">
              <p className="font-semibold text-slate-900">No sourced match found.</p>
              <p>No items in the curated library match this query for your role. Here are the closest related items:</p>
              <ul className="mt-3 space-y-1 list-disc pl-5">
                {items.slice(0, 3).map(it => (
                  <li key={it.id}><span className="font-medium">{it.title}</span> — {it.summary}</li>
                ))}
              </ul>
            </div>
          ) : (
            matches.map(m => (
              <div key={m.id} className="p-5 rounded-2xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900">{m.title}</div>
                <div className="text-slate-600 text-sm mt-1 leading-relaxed">{m.summary}</div>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                  {m.url && (
                    <a
                      className="text-indigo-700 font-semibold text-sm underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                      href={m.url} target="_blank" rel="noreferrer"
                    >
                      Open source ↗
                    </a>
                  )}
                  {m.slug && (
                    <Link
                      to={`/coach/${m.slug}`}
                      className="text-sm font-semibold text-slate-600 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                    >
                      Details →
                    </Link>
                  )}
                </div>
                {(m.citations || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-semibold">Sources:</span>{' '}
                    {m.citations.map((c, i) => (
                      <span key={i}>
                        <a className="underline" href={c.url} target="_blank" rel="noreferrer">{c.title}</a>
                        {i < m.citations.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {!query.trim() && items.length === 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
              Library is loading or empty. Try reloading config.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
