import React, { useMemo } from 'react';
import { useAppState } from '../components/AppState';
import { getPlanTheme } from '../lib/planUtils';

// ─── label maps ──────────────────────────────────────────────────────────────

const BARRIER_LABELS = {
  AWARENESS:'Awareness', DESIRE:'Desire', KNOWLEDGE:'Knowledge',
  ABILITY:'Ability', REINFORCEMENT:'Reinforcement', UNKNOWN:'Unclear',
};
const PHASE_LABELS = {
  ENDINGS:'Endings', NEUTRAL_ZONE:'Neutral Zone', NEW_BEGINNING:'New Beginning', UNKNOWN:'Unclear',
};
const ZONE_LABELS = {
  STATUS_QUO:'Status Quo', DISRUPTION:'Disruption', ADAPTATION:'Adaptation',
  ADOPTION:'Adoption', INNOVATION:'Innovation', UNKNOWN:'Unclear',
};
const HINT_LABELS = {
  REGULATE_FIRST:'Regulate first', MICRO_MOVE_ONLY:'Micro moves only', NORMAL:'Ready to move',
};
const SOURCE_LABELS = {
  DO_NEXT:'Next Best Move', MAP:'Change Map', TOOL:'Tool',
  SIMULATOR_BRANCHING:'Simulator · Scenarios', SIMULATOR_ROLEPLAY:'Simulator · Role-play',
  SIMULATOR_CURVE:'Simulator · Curve', TOOL_INTERACTIVE:'Tool',
};

const REFLECTION_PROMPT =
  'What is one thing you will do differently this week because of what you\'ve worked through here?';

// ─── JSON export ──────────────────────────────────────────────────────────────

function buildExportBundle(state) {
  const diag  = state.currentDiagnosis;
  const where = diag?.coach?.where_you_likely_are || {};
  return {
    planId:        state.planId,
    generatedAt:   new Date().toISOString(),
    role:          state.role,
    diagnosisSummary: {
      adkar_barrier:  where.adkar_barrier  || null,
      bridges_phase:  where.bridges_phase  || null,
      zones_of_change: where.zones_of_change || null,
      confidence_note: where.confidence_note || null,
      route_hint:     diag?._internal?.final_route_hint || null,
    },
    savedItems:    Object.values(state.savedPlan || {}),
    reflectionPrompt: REFLECTION_PROMPT,
  };
}

function downloadJSON(bundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `change-gps-plan-${bundle.planId?.slice(0, 8) || 'export'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── diagnosis summary block ──────────────────────────────────────────────────

function DiagnosisSummary({ diagnosis, theme }) {
  if (!diagnosis) {
    return (
      <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} text-sm`}>
        <p className="font-semibold text-slate-700">No diagnosis yet.</p>
        <p className="text-slate-500 mt-1">Run Diagnose to populate this section.</p>
      </div>
    );
  }

  const where = diagnosis.coach?.where_you_likely_are || {};
  const hint  = diagnosis._internal?.final_route_hint || 'NORMAL';

  const rows = [
    { label: 'Current barrier',  value: BARRIER_LABELS[where.adkar_barrier]  || '—' },
    { label: 'Bridges phase',    value: PHASE_LABELS[where.bridges_phase]    || '—' },
    { label: 'Zone of change',   value: ZONE_LABELS[where.zones_of_change]   || '—' },
    { label: 'Capacity signal',  value: HINT_LABELS[hint]                    || '—' },
  ];

  return (
    <div className={`rounded-2xl border ${theme.border} overflow-hidden`}>
      {rows.map((r, i) => (
        <div key={i} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? theme.bg : 'bg-white'}`}>
          <span className="text-sm text-slate-500 font-medium">{r.label}</span>
          <span className="text-sm font-bold text-slate-900">{r.value}</span>
        </div>
      ))}
      {where.confidence_note && (
        <div className="px-4 py-2 bg-white border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">{where.confidence_note}</p>
        </div>
      )}
    </div>
  );
}

// ─── saved item card ──────────────────────────────────────────────────────────

function PlanItemCard({ item, onRemove }) {
  const sourceLabel = SOURCE_LABELS[item.source] || item.source || 'Saved';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{sourceLabel}</div>
          <h3 className="font-bold text-slate-900 mt-0.5">{item.title}</h3>
          {item.why && <p className="text-slate-600 text-sm mt-1 leading-relaxed">{item.why}</p>}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.title}`}
          className="text-slate-300 hover:text-rose-500 text-lg leading-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none rounded shrink-0"
        >
          ×
        </button>
      </div>
      {(item.steps || []).length > 0 && (
        <ol className="mt-3 space-y-1 list-decimal pl-5 text-sm text-slate-700">
          {item.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      )}
      <p className="mt-3 text-xs text-slate-400">Saved {new Date(item.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

// ─── page root ────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const { state, dispatch } = useAppState();
  const theme = useMemo(() => getPlanTheme(state.planId), [state.planId]);

  const items = useMemo(
    () => Object.values(state.savedPlan || {}).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    ),
    [state.savedPlan]
  );

  const handleRemove = (id) => dispatch({ type: 'REMOVE_PLAN_ITEM', payload: id });

  const handleExportJSON = () => downloadJSON(buildExportBundle(state));
  const handleExportPDF  = () => window.print();

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6 animate-in" id="plan-printable">

      {/* ── header ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Plan Builder</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Plan ID: {state.planId?.slice(0, 8)}…
            </p>
          </div>
          <div className="flex gap-2 flex-wrap print:hidden">
            <button
              onClick={handleExportPDF}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${theme.border} ${theme.bg} ${theme.text} hover:opacity-80 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`}
            >
              Export PDF
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Export JSON
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET_PLAN' })}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            >
              Clear plan
            </button>
          </div>
        </div>
      </div>

      {/* ── diagnosis summary ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          Diagnosis Summary
        </h2>
        <DiagnosisSummary diagnosis={state.currentDiagnosis} theme={theme} />
      </section>

      {/* ── saved items ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          Saved Items ({items.length})
        </h2>
        {items.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
            Nothing saved yet. Add moves from Next Best Move, Tools, Simulator, or the Change Map.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(it => (
              <PlanItemCard key={it.id} item={it} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </section>

      {/* ── reflection prompt ────────────────────────────────────────────── */}
      <section className={`p-5 rounded-2xl border ${theme.border} ${theme.bg}`}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
          Reflection
        </h2>
        <p className={`text-base font-semibold ${theme.text} italic`}>{REFLECTION_PROMPT}</p>
      </section>

    </div>
  );
}
