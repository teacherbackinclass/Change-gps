import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from '../components/AppState';

import TenMinuteScriptBuilder from './tools/TenMinuteScriptBuilder';
import StakeholderMap         from './tools/StakeholderMap';
import FocusInfluenceSort     from './tools/FocusInfluenceSort';
import NextStepBuilder        from './tools/NextStepBuilder';
import ReactionProfile        from './tools/ReactionProfile';

const TOOL_COMPONENTS = {
  TenMinuteScriptBuilder,
  StakeholderMap,
  FocusInfluenceSort,
  NextStepBuilder,
  ReactionProfile,
};

const TEMPLATE_FALLBACKS = {
  INDIVIDUAL:    'Even great leaders aren\'t mind readers. Be specific about what you need.',
  PEOPLE_LEADER: 'Reduce uncertainty: what changes, what stays, where to ask, what to do next.',
};

export default function ToolDetailPage() {
  const { toolSlug }    = useParams();
  const { config }      = useConfig();
  const { state }       = useAppState();
  const role            = state.role;

  const topics = config.content?.toolsTopics?.topics || [];
  const topic  = useMemo(() => topics.find(t => t.slug === toolSlug), [topics, toolSlug]);

  const topRef = useRef(null);
  useEffect(() => {
    if (topRef.current) topRef.current.focus();
  }, [role]);

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-xl font-bold">Tool not found</h1>
        <p className="text-slate-600 mt-2">Try another tool from Tools &amp; Scripts.</p>
      </div>
    );
  }

  const bridge   = topic.bridge_messages?.[role]        || TEMPLATE_FALLBACKS[role];
  const framing  = topic.role_specific_framing?.[role]  || 'Use what fits. Skip what doesn\'t.';
  const actions  = topic.role_specific_actions?.[role]  || [];
  const scripts  = topic.scripts?.[role]                || [];

  const InteractiveComponent = topic.tool_component ? TOOL_COMPONENTS[topic.tool_component] : null;

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-4 animate-in">
      {/* sr focus anchor + live announce */}
      <div ref={topRef} tabIndex={-1} className="outline-none" aria-live="polite" />
      <div className="sr-only" aria-live="polite">
        Showing {role === 'PEOPLE_LEADER' ? 'People Leader' : 'Individual'} view for the same page.
      </div>

      {/* bridge banner */}
      <div className="rounded-full px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-900 text-sm">
        <strong>Bridge:</strong> {bridge}
      </div>

      {/* header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{topic.subtitle}</p>
          </div>
          <div className="flex gap-2 text-xs text-slate-500 flex-wrap">
            {topic.estimated_time && (
              <span className="px-2 py-1 rounded-full bg-slate-100 font-medium">{topic.estimated_time}</span>
            )}
            {topic.format && (
              <span className="px-2 py-1 rounded-full bg-slate-100 font-medium">{topic.format}</span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">Toggle role at the top to see this tool from the other perspective.</p>
      </div>

      {/* framing */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Framing</h2>
        <p className="text-slate-800 text-sm leading-relaxed">{framing}</p>
      </div>

      {/* interactive tool — takes priority over static content */}
      {InteractiveComponent ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Interactive tool</h2>
          <InteractiveComponent topic={topic} role={role} />
        </div>
      ) : (
        <>
          {/* do this */}
          {actions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Do this</h2>
              <ul className="space-y-2">
                {actions.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-800">
                    <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* what to say */}
          {scripts.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">What to say</h2>
              <p className="text-xs text-slate-400 mb-3">Copy-paste language. Make it your own.</p>
              <div className="space-y-3">
                {scripts.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-sm font-semibold text-slate-800 mb-1">{s.label}</div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{s.text}</p>
                    <button
                      className="mt-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                      onClick={() => navigator.clipboard.writeText(s.text).catch(() => {})}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* assets */}
      {(topic.assets || []).length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Templates &amp; assets</h2>
          <p className="text-slate-500 text-sm">Asset rendering not yet implemented.</p>
        </div>
      )}
    </div>
  );
}
