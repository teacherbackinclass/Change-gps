import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '../../components/AppState';

const FIELDS = [
  { key: 'standard', label: 'Standard', placeholder: 'What is the one behavior or practice we need to do consistently?', hint: 'Keep it to one sentence. This is the anchor.' },
  { key: 'example',  label: 'Example',  placeholder: 'What does "good" look like in practice? Describe a specific scenario.', hint: 'Concrete beats abstract every time.' },
  { key: 'mistake',  label: 'Mistake to avoid', placeholder: 'What is the most common error or shortcut people take that undermines this?', hint: 'Name the trap before people fall into it.' },
  { key: 'practice', label: 'Practice this week', placeholder: 'What is the one thing people should try or practice this week?', hint: 'Small and specific. One action beats a list.' },
  { key: 'blocker',  label: 'Top blocker', placeholder: 'What is the most common thing that gets in the way? How do you want to handle it?', hint: 'Address the blocker before someone raises it.' },
];

export default function TenMinuteScriptBuilder({ topic, role }) {
  const { dispatch } = useAppState();
  const [values, setValues] = useState({ standard: '', example: '', mistake: '', practice: '', blocker: '' });
  const [saved,  setSaved]  = useState(false);

  const filled    = Object.values(values).filter(v => v.trim()).length;
  const canSave   = filled >= 3;

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key:   `TEN_MIN_SCRIPT_${Date.now()}`,
        value: {
          id:        `TEN_MIN_SCRIPT_${Date.now()}`,
          title:     'Ten-minute script',
          why:       `Standard: ${values.standard}`,
          steps:     [
            values.example  && `Example: ${values.example}`,
            values.mistake  && `Mistake to avoid: ${values.mistake}`,
            values.practice && `Practice this week: ${values.practice}`,
            values.blocker  && `Top blocker: ${values.blocker}`,
          ].filter(Boolean),
          source:    'TOOL_INTERACTIVE',
          toolId:    'TOOL_TEN_MIN_SCRIPT_BUILDER',
          outputs:   { TEN_MIN_SCRIPT: { ...values } },
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSaved(true);
  };

  const handleCopy = () => {
    const text = FIELDS
      .map(f => values[f.key] ? `${f.label}:\n${values[f.key]}` : null)
      .filter(Boolean)
      .join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
        {role === 'PEOPLE_LEADER'
          ? 'Fill five fields to build a structured team script. You can use the output in a huddle, email, or Slack message.'
          : 'Fill what you know. This gives you language to prepare for a conversation with your manager or team.'}
      </div>

      {FIELDS.map(f => (
        <div key={f.key}>
          <label className="block text-sm font-bold text-slate-800 mb-1">
            {f.label}
          </label>
          <p className="text-xs text-slate-400 mb-1.5">{f.hint}</p>
          <textarea
            rows={2}
            value={values[f.key]}
            onChange={e => handleChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
          />
        </div>
      ))}

      <div className="flex gap-3 flex-wrap pt-2">
        <button
          onClick={handleSave}
          disabled={!canSave || saved}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" /> {saved ? 'Saved to Plan' : 'Save to Plan'}
        </button>
        <button
          onClick={handleCopy}
          disabled={filled === 0}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          Copy script
        </button>
      </div>
      {!canSave && filled > 0 && (
        <p className="text-xs text-slate-400">Fill at least 3 fields to save.</p>
      )}
    </div>
  );
}
