import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from '../components/AppState';

export default function CoachTopicPage() {
  const { topicSlug }    = useParams();
  const { config }       = useConfig();
  const { state }        = useAppState();
  const role             = state.role;

  const items = config.content?.coachLibrary?.items || [];
  const item  = items.find(it => it.slug === topicSlug);

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Topic not found</h1>
        <p className="text-slate-600 mt-2">
          <Link to="/coach" className="text-indigo-700 underline">Back to Coach</Link>
        </p>
      </div>
    );
  }

  const framing = item.role_specific_framing?.[role];
  const bridge  = item.bridge_messages?.[role];
  const tplFallbacks = {
    INDIVIDUAL:    'Even great leaders aren\'t mind readers. Be specific about what you need.',
    PEOPLE_LEADER: 'Reduce uncertainty: what changes, what stays, where to ask, what to do next.',
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4 animate-in">
      {/* bridge banner */}
      <div className="px-4 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-sm">
        <strong>Bridge:</strong> {bridge || tplFallbacks[role]}
      </div>

      {/* header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.type}</div>
        <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{item.summary}</p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-indigo-700 underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
          >
            Open original source ↗
          </a>
        )}
      </div>

      {/* role framing */}
      {framing && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
            {role === 'PEOPLE_LEADER' ? 'People Leader framing' : 'Individual framing'}
          </h2>
          <p className="text-slate-800 text-sm leading-relaxed">{framing}</p>
        </div>
      )}

      {/* citations */}
      {(item.citations || []).length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Sources</h2>
          <ul className="space-y-2">
            {item.citations.map((c, i) => (
              <li key={i} className="flex gap-2 items-start text-sm">
                <span className="text-slate-300 mt-0.5">–</span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                >
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm">
        <Link to="/coach" className="text-slate-500 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded">
          ← Back to Coach
        </Link>
      </div>

      {/* sr announce */}
      <div className="sr-only" aria-live="polite">
        Showing {role === 'PEOPLE_LEADER' ? 'People Leader' : 'Individual'} view for the same page.
      </div>
    </div>
  );
}
