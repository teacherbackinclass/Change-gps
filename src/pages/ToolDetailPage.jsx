import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from '../components/AppState';

export default function ToolDetailPage() {
  const { toolSlug } = useParams();
  const { config } = useConfig();
  const { state } = useAppState();
  const role = state.role;

  const tpl = config.ui?.templates?.TPL_MIRRORED_ROLE_TOPIC_PAGE;
  const topics = config.content?.toolsTopics?.topics || [];

  const topic = useMemo(() => topics.find(t => t.slug === toolSlug), [topics, toolSlug]);

  const topRef = useRef(null);
  useEffect(() => {
    // preserve scroll position is handled by router; but ensure focus/announce can be added later
    if (topRef.current) topRef.current.focus();
  }, [role]);

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-xl font-bold">Tool not found</h1>
        <p className="text-slate-600 mt-2">Try another tool from Tools & Scripts.</p>
      </div>
    );
  }

  const bridge = topic.bridge_messages?.[role] || tpl?.bridge_banner?.fallbacks?.[role];
  const framing = topic.role_specific_framing?.[role] || (role === 'INDIVIDUAL'
    ? 'Use this tool to reduce uncertainty and take one next step.'
    : 'Use this tool to make the next step obvious and remove friction for your team.');

  const actions = topic.role_specific_actions?.[role] || [];
  const scripts = topic.scripts?.[role] || [];

  return (
    <div className="max-w-5xl mx-auto mt-6 animate-in space-y-4">
      <div
        ref={topRef}
        tabIndex={-1}
        className="outline-none"
        aria-live="polite"
      />

      {/* Bridge banner always visible */}
      <div className="rounded-full px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-900">
        <strong>Bridge:</strong> {bridge}
      </div>

      <header className="bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
        <p className="text-slate-600">{topic.subtitle}</p>
        <p className="text-xs text-slate-500 mt-2">Switch roles to see the same tool from the other side.</p>
      </header>

      <section className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold">Framing</h2>
        <p className="text-slate-700 mt-2">{framing}</p>
        <p className="text-xs text-slate-500 mt-2">Use what fits. Skip what doesn’t.</p>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold">Do this</h2>
        {actions.length === 0 ? (
          <p className="text-slate-600 mt-2">No actions for this role yet.</p>
        ) : (
          <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-800">
            {actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        )}
      </section>

      <section className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold">What to say</h2>
        <p className="text-slate-600 text-sm mt-1">Copy/paste language. Make it your own.</p>
        <div className="mt-3 space-y-3">
          {scripts.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-sm font-semibold text-slate-800">{s.label}</div>
              <div className="mt-2 text-slate-800 whitespace-pre-wrap">{s.text}</div>
              <button
                className="mt-3 text-sm font-semibold text-indigo-700"
                onClick={() => navigator.clipboard.writeText(s.text)}
              >
                Copy
              </button>
            </div>
          ))}
          {scripts.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              No scripts for this role yet.
            </div>
          )}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold">Templates</h2>
        <p className="text-slate-600 text-sm mt-1">Downloadable or fill-in assets (if available).</p>
        {(topic.assets || []).length === 0 ? (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            No templates for this tool yet.
          </div>
        ) : (
          <div className="mt-3">(assets rendering stub)</div>
        )}
      </section>

      {/* Screen reader announce rule stub */}
      <div className="sr-only" aria-live="polite">
        {tpl?.rerender_on_role_toggle?.announce_for_screen_readers?.enabled
          ? tpl.rerender_on_role_toggle.announce_for_screen_readers.message_template.replace('{role}', role)
          : ''}
      </div>
    </div>
  );
}
