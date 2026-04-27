import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '../../components/AppState';

export default function NextStepBuilder({ topic, role }) {
  const { dispatch } = useAppState();
  const [action,  setAction]  = useState('');
  const [date,    setDate]    = useState('');
  const [signal,  setSignal]  = useState('');
  const [saved,   setSaved]   = useState(false);

  const isLeader = role === 'PEOPLE_LEADER';
  const canSave  = action.trim() && date.trim() && signal.trim();

  const handleSave = () => {
    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key:   `NEXT_STEP_${Date.now()}`,
        value: {
          id:        `NEXT_STEP_${Date.now()}`,
          title:     'Next step',
          why:       action,
          steps:     [
            `Check-in date: ${date}`,
            `Success signal: ${signal}`,
          ],
          source:    'TOOL_INTERACTIVE',
          toolId:    'TOOL_NEXT_STEP_BUILDER',
          outputs:   { NEXT_STEP: { action, checkInDate: date, successSignal: signal } },
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
        {isLeader
          ? 'Close every change conversation with a clear next step. Ambiguity is the enemy of momentum.'
          : 'A specific action with a date is five times more likely to happen than a vague intention.'}
      </div>

      <div>
        <label className="text-sm font-bold text-slate-800 block mb-1">
          {isLeader ? 'One action (with owner)' : 'One action'}
        </label>
        <p className="text-xs text-slate-400 mb-1.5">
          {isLeader
            ? 'Be specific. Include who will do it, not just what.'
            : 'Make it small enough to do this week. Vague = not done.'}
        </p>
        <textarea
          rows={2}
          value={action}
          onChange={e => { setAction(e.target.value); setSaved(false); }}
          placeholder={isLeader ? 'e.g., "Sarah will update the process doc and share with the team by Friday."' : 'e.g., "Complete the first module of the training by Wednesday."'}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-800 block mb-1">Check-in date</label>
        <p className="text-xs text-slate-400 mb-1.5">When will you (or your team) review whether this happened?</p>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setSaved(false); }}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-800 block mb-1">Success signal</label>
        <p className="text-xs text-slate-400 mb-1.5">
          How will you know it happened? Not feelings — a concrete, observable output.
        </p>
        <input
          value={signal}
          onChange={e => { setSignal(e.target.value); setSaved(false); }}
          placeholder={isLeader ? 'e.g., "Team can describe the process without the doc in front of them."' : 'e.g., "I can do the new process in under 5 minutes without looking anything up."'}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
        />
      </div>

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
