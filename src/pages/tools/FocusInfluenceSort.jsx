import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAppState } from '../../components/AppState';

const BUCKETS = [
  { id: 'control',   label: 'I control this',    color: 'border-teal-200 bg-teal-50',   badge: 'bg-teal-100 text-teal-800'   },
  { id: 'influence', label: 'I can influence this', color: 'border-indigo-200 bg-indigo-50', badge: 'bg-indigo-100 text-indigo-800' },
  { id: 'help',      label: 'I need help with this', color: 'border-amber-200 bg-amber-50',  badge: 'bg-amber-100 text-amber-800'  },
];

export default function FocusInfluenceSort({ topic, role }) {
  const { dispatch } = useAppState();
  const [inputText,  setInputText]  = useState('');
  const [items,      setItems]      = useState([]);
  const [action,     setAction]     = useState('');
  const [need,       setNeed]       = useState('');
  const [saved,      setSaved]      = useState(false);

  const addItem = () => {
    const text = inputText.trim();
    if (!text) return;
    setItems(prev => [...prev, { id: Date.now(), text, bucket: null }]);
    setInputText('');
    setSaved(false);
  };

  const removeItem  = (id)         => setItems(prev => prev.filter(x => x.id !== id));
  const assignBucket = (id, bucket) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, bucket } : x));
    setSaved(false);
  };

  const unsorted = items.filter(x => !x.bucket);
  const sorted   = useMemo(() => ({
    control:   items.filter(x => x.bucket === 'control'),
    influence: items.filter(x => x.bucket === 'influence'),
    help:      items.filter(x => x.bucket === 'help'),
  }), [items]);

  const canSave = items.length > 0 && unsorted.length === 0 && action.trim();

  const handleSave = () => {
    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key:   `FOCUS_INFLUENCE_${Date.now()}`,
        value: {
          id:        `FOCUS_INFLUENCE_${Date.now()}`,
          title:     'Focus & influence sort',
          why:       `Prioritized action: ${action}`,
          steps:     [
            action && `Action: ${action}`,
            need   && `What I need: ${need}`,
            `I control (${sorted.control.length}): ${sorted.control.map(x => x.text).join(', ') || '—'}`,
            `I can influence (${sorted.influence.length}): ${sorted.influence.map(x => x.text).join(', ') || '—'}`,
            `Need help (${sorted.help.length}): ${sorted.help.map(x => x.text).join(', ') || '—'}`,
          ].filter(Boolean),
          source:    'TOOL_INTERACTIVE',
          toolId:    'TOOL_FOCUS_INFLUENCE',
          outputs:   { FOCUS_INFLUENCE: { iControl: sorted.control.map(x => x.text), iCanInfluence: sorted.influence.map(x => x.text), iNeedHelp: sorted.help.map(x => x.text), prioritizedAction: action, whatINeed: need } },
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
        {role === 'PEOPLE_LEADER'
          ? 'Sort what\'s in your team\'s way. Focus your energy on the levers you actually have.'
          : 'List what\'s on your mind. Sort each one. Focus on what you control first.'}
      </div>

      {/* add item */}
      <div className="flex gap-2">
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder="Add a concern, task, or blocker…"
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
        />
        <button
          onClick={addItem}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          Add
        </button>
      </div>

      {/* unsorted items */}
      {unsorted.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sort these ({unsorted.length})</p>
          <div className="space-y-2">
            {unsorted.map(item => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm text-slate-800">{item.text}</span>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {BUCKETS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => assignBucket(item.id, b.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${b.badge}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* sorted buckets */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUCKETS.map(b => (
            <div key={b.id} className={`p-3 rounded-xl border ${b.color} min-h-[80px]`}>
              <p className={`text-xs font-bold mb-2 px-2 py-0.5 rounded-full w-fit ${b.badge}`}>{b.label}</p>
              {sorted[b.id].length === 0
                ? <p className="text-xs text-slate-400 italic">None yet</p>
                : sorted[b.id].map(x => (
                    <div key={x.id} className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs text-slate-700 flex-1">{x.text}</span>
                      <button onClick={() => assignBucket(x.id, null)} className="text-slate-300 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
              }
            </div>
          ))}
        </div>
      )}

      {/* priority action + need */}
      {unsorted.length === 0 && items.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-bold text-slate-800 block mb-1">
              One prioritized action (from the "I control" bucket)
            </label>
            <input
              value={action}
              onChange={e => { setAction(e.target.value); setSaved(false); }}
              placeholder="e.g., 'Draft the clarification email by Friday'"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-800 block mb-1">
              What I need (from the "need help" bucket)
            </label>
            <input
              value={need}
              onChange={e => { setNeed(e.target.value); setSaved(false); }}
              placeholder="e.g., 'A decision from the steering group by Thursday'"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave || saved}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      >
        <Plus className="w-4 h-4" /> {saved ? 'Saved to Plan' : 'Save to Plan'}
      </button>
    </div>
  );
}
