import React, { useMemo, useState } from 'react';
import { ClipboardCopy, Plus, Filter, CheckCircle2 } from 'lucide-react';
import RoleMirrorHeader from '../components/RoleMirrorHeader';
import { STAGES, formatStage } from '../lib/changeCurve';

const TOOLS = [
  {
    id: 'TOOL_1_SENTENCE_CHANGE',
    title: 'Name the change in one sentence',
    stage: 'DISRUPTION',
    role: 'BOTH',
    why: 'Short, plain language reduces rumors and confusion.',
    script: 'In one sentence: “We are changing ____ so that ____ by ____.”\nWhat stays the same: ____.\nWhat changes first: ____.',
    steps: ['Write the sentence.', 'Share it with one person and ask: “What did you hear?”', 'Revise until it’s repeatable in 10 seconds.']
  },
  {
    id: 'TOOL_ASK_FOR_CLARITY',
    title: 'Ask for clarity (15-minute script)',
    stage: 'DISRUPTION',
    role: 'INDIVIDUAL',
    why: 'Clarifying the “why/what/this week” prevents wasted effort.',
    script: 'Quick clarity request:\n1) What is the goal this week?\n2) What does “good” look like?\n3) What should I stop doing to make room?\n4) Who decides when tradeoffs happen?',
    steps: ['List your top 3 unknowns.', 'Send the request (or ask live).', 'Write down the 1–2 decisions you now have.']
  },
  {
    id: 'TOOL_LEADER_CLARITY_BRIEF',
    title: 'Leader clarity brief (3 bullets)',
    stage: 'DISRUPTION',
    role: 'PEOPLE_LEADER',
    why: 'People need predictable, consistent messaging to regain confidence.',
    script: 'Leader brief (copy/paste):\n• What is changing: ____\n• Why now: ____\n• This week’s focus: ____\n\nIf you’re stuck, ask me for clarity—no penalty for questions.',
    steps: ['Fill the blanks.', 'Post in the same channel every week.', 'Repeat the same 3 bullets before adding new details.']
  },
  {
    id: 'TOOL_FRICTION_LOG',
    title: 'Friction log (2-minute capture)',
    stage: 'ADAPTATION',
    role: 'BOTH',
    why: 'Friction is data. Logging it reveals the one change that makes work easier.',
    script: 'Friction log:\nWhen did work feel harder than it should?\nCategory: Tool / Process / Decision\nImpact (1–5): __\nWhat would make it 1 point easier? __',
    steps: ['Capture 3 friction moments this week.', 'Pick the top 1 by impact.', 'Remove or reduce that one friction point.']
  },
  {
    id: 'TOOL_WEEKLY_RHYTHM',
    title: 'Weekly micro-rhythm',
    stage: 'ADAPTATION',
    role: 'PEOPLE_LEADER',
    why: 'Consistency builds trust and creates reinforcement.',
    script: 'Weekly 10-minute rhythm:\n1) One win\n2) One blocker\n3) One tweak for next week\nClose: “What do you need from me?”',
    steps: ['Schedule 10 minutes weekly.', 'Keep it the same 3 questions.', 'Track one tweak and revisit next week.']
  },
  {
    id: 'TOOL_EXPERIMENT_CARD',
    title: 'Experiment card (small safe test)',
    stage: 'INNOVATION',
    role: 'BOTH',
    why: 'Exploration turns adoption into improvement.',
    script: 'Experiment card:\nHypothesis: If we ____, then ____ will improve.\nTest for: 7 days\nMeasure: ____\nOwner: ____\nDecision: Keep / Change / Stop',
    steps: ['Define a small hypothesis.', 'Run for 7 days.', 'Decide keep/change/stop.']
  },
  {
    id: 'TOOL_PREPARE_MAP',
    title: 'Prepare map (what changes vs stays)',
    stage: 'STATUS_QUO',
    role: 'BOTH',
    why: 'Preparation lowers future disruption.',
    script: 'Prepare map:\nStays the same: ____\nChanges soon: ____\nNew skills needed: ____\nRisks: ____\nFirst small win: ____',
    steps: ['Fill the map.', 'Identify one skill to learn early.', 'Choose one small win you can deliver quickly.']
  }
];

function roleMatches(toolRole, userRole) {
  return toolRole === 'BOTH' || toolRole === userRole;
}

export default function ToolsPage({ state, dispatch }) {
  const [stageFilter, setStageFilter] = useState('ALL');

  const inferredStageId = useMemo(() => {
    // If user used the Change Map, we’d store stage; until then, infer from diagnosis avg.
    const avg = state?.diagnosis?.avg;
    if (typeof avg !== 'number') return null;
    if (avg < 1) return 'STATUS_QUO';
    if (avg < 2) return 'DISRUPTION';
    if (avg < 3) return 'ADAPTATION';
    return 'INNOVATION';
  }, [state?.diagnosis?.avg]);

  const stageOptions = useMemo(() => [{ id: 'ALL', label: 'All stages' }, ...STAGES.map(s => ({ id: s.id, label: formatStage(s) }))], []);

  const filtered = useMemo(() => {
    return TOOLS
      .filter(t => roleMatches(t.role, state.role))
      .filter(t => stageFilter === 'ALL' ? true : t.stage === stageFilter)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [stageFilter, state.role]);

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch (_) {
      // ignore
    }
  };

  const addToPlan = (tool) => {
    dispatch({
      type: 'ADD_TO_PLAN',
      payload: {
        id: tool.id,
        title: tool.title,
        why: tool.why,
        steps: tool.steps
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <RoleMirrorHeader
        role={state.role}
        title="Tools & Scripts"
        subtitle="Copy/paste scripts and add the ones you’ll use to your Plan."
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/80 border border-slate-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4" />
              <span>Suggested stage:</span>
              <span className="text-slate-900">{inferredStageId || '—'}</span>
            </div>
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Filter by stage</p>
            <p className="text-sm text-slate-600">Choose a stage to narrow down tools.</p>
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
          >
            {stageOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(tool => (
            <div key={tool.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{tool.stage}</p>
                  <h3 className="text-lg font-bold text-slate-900">{tool.title}</h3>
                  <p className="text-sm text-slate-600">{tool.why}</p>
                </div>
                <button
                  onClick={() => addToPlan(tool)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100"
                  title="Add to Plan"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Script</p>
                  <button
                    onClick={() => copy(tool.script)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <ClipboardCopy className="w-4 h-4" /> Copy
                  </button>
                </div>
                <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{tool.script}</pre>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Steps</p>
                <ul className="mt-2 space-y-2">
                  {tool.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-slate-300 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Next step</p>
            <p className="text-sm text-slate-600">Go to My Plan to print or save as PDF.</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', payload: '/plan' })}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
          >
            Open My Plan
          </button>
        </div>
      </div>
    </div>
  );
}
