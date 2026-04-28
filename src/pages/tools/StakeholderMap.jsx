import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppState } from '../../components/AppState';

const INFLUENCE_OPTS = ['HIGH', 'MED', 'LOW'];
const IMPACT_OPTS    = ['HIGH', 'MED', 'LOW'];
const SUPPORT_OPTS   = [
  { value: 'CHAMPION',  label: 'Champion',  color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { value: 'NEUTRAL',   label: 'Neutral',   color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'RESISTANT', label: 'Resistant', color: 'bg-rose-100 text-rose-800 border-rose-200' },
];

const CADENCE_MAP = {
  HIGH_CHAMPION:  'Weekly 1:1 or direct update. Leverage as a visible champion.',
  HIGH_NEUTRAL:   'Bi-weekly update. Invest in their "why" — they can become a champion.',
  HIGH_RESISTANT: 'Weekly 1:1. Listen first. Address their specific concern. Don\'t skip.',
  MED_CHAMPION:   'Monthly check-in. Keep them informed and energized.',
  MED_NEUTRAL:    'Monthly group update. No special effort needed yet.',
  MED_RESISTANT:  'Bi-weekly touch. Find their specific concern and address it directly.',
  LOW_CHAMPION:   'Quarterly. Thank them occasionally — they\'re self-sustaining.',
  LOW_NEUTRAL:    'Quarterly group communication.',
  LOW_RESISTANT:  'Monthly. Monitor for contagion — low-influence resistance can still spread.',
};

function getCadence(influence, support) {
  const key = `${influence}_${support}`;
  return CADENCE_MAP[key] || 'Check in as needed.';
}

function newRow() {
  return { id: Date.now(), name: '', influence: 'MED', impact: 'MED', support: 'NEUTRAL', access: '' };
}

export default function StakeholderMap({ topic, role }) {
  const { dispatch }       = useAppState();
  const [rows, setRows]    = useState([newRow()]);
  const [saved, setSaved]  = useState(false);

  const addRow    = () => { setRows(r => [...r, newRow()]); setSaved(false); };
  const removeRow = (id) => setRows(r => r.filter(x => x.id !== id));
  const updateRow = (id, field, val) => {
    setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x));
    setSaved(false);
  };

  const handleSave = () => {
    const stakeholders = rows
      .filter(r => r.name.trim() || r.access.trim())
      .map(r => ({ ...r, cadenceSuggestion: getCadence(r.influence, r.support) }));

    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key:   `STAKEHOLDER_MAP_${Date.now()}`,
        value: {
          id:        `STAKEHOLDER_MAP_${Date.now()}`,
          title:     'Stakeholder map',
          why:       `${stakeholders.length} stakeholder(s) mapped.`,
          steps:     stakeholders.map(s =>
            `${s.name || '(unnamed)'} — Influence: ${s.influence}, Support: ${s.support}. ${s.cadenceSuggestion}`
          ),
          source:    'TOOL_INTERACTIVE',
          toolId:    'TOOL_STAKEHOLDER_MAP',
          outputs:   { STAKEHOLDER_MAP: { stakeholders } },
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
        {role === 'PEOPLE_LEADER'
          ? 'Map who matters for this change. High influence + resistant = your most important conversation.'
          : 'Name the people who can unblock or support you. No PII required — use roles or initials if preferred.'}
      </div>

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={row.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Stakeholder {idx + 1}
              </span>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove row"
                  className="text-slate-300 hover:text-rose-500 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Name / Role (optional)</label>
                <input
                  value={row.name}
                  onChange={e => updateRow(row.id, 'name', e.target.value)}
                  placeholder="e.g., Finance Director or 'Finance lead'"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Access / How to reach</label>
                <input
                  value={row.access}
                  onChange={e => updateRow(row.id, 'access', e.target.value)}
                  placeholder="e.g., weekly all-hands, direct message"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Influence</label>
                <select
                  value={row.influence}
                  onChange={e => updateRow(row.id, 'influence', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  {INFLUENCE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Impact on you</label>
                <select
                  value={row.impact}
                  onChange={e => updateRow(row.id, 'impact', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  {IMPACT_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Support level</label>
                <select
                  value={row.support}
                  onChange={e => updateRow(row.id, 'support', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  {SUPPORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* cadence suggestion */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Suggested cadence: </span>
              {getCadence(row.influence, row.support)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" /> Add stakeholder
        </button>
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" /> {saved ? 'Saved to Plan' : 'Save to Plan'}
        </button>
      </div>
    </div>
  );
}
