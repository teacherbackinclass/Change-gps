import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Plus } from 'lucide-react';
import { useAppState } from '../components/AppState';

// ─── move library ─────────────────────────────────────────────────────────────

const MOVES = {
  AWARENESS: {
    id: 'MOVE_DEFINE_CHANGE_1_SENTENCE',
    title: 'Name the change in one sentence',
    why: 'Clarity comes first. A single plain statement cuts through rumor and confusion.',
    steps: [
      'Write the change in one sentence: "We are changing ___ so that ___ by ___."',
      'Write what is NOT changing in one sentence.',
      'Share it with one person and ask: "What\'s unclear?"',
    ],
    role_framing: {
      INDIVIDUAL:    'Use this when you\'re not sure what\'s actually changing — before you can act, you need a clear picture.',
      PEOPLE_LEADER: 'Use this when your team is filling silence with rumors. A clear one-liner stops the speculation loop.',
    },
    sourcedExample: { exists: false },
    artifact: { artifact_type: 'Statement card', fields: { change_sentence: '', not_changing: '' } },
  },
  DESIRE: {
    id: 'MOVE_WIIFM_MAP',
    title: 'Build a WIIFM map',
    why: 'People commit when they can name a personal benefit — not just a business case.',
    steps: [
      'List 2 benefits for the team.',
      'List 2 benefits for customers or the organization.',
      'Name 1 fear and address it directly.',
    ],
    role_framing: {
      INDIVIDUAL:    'Use this when you\'re not sure why you should care. Finding your own "why" is what turns compliance into commitment.',
      PEOPLE_LEADER: 'Use this to move your team from passive agreement to active buy-in. Help them find their personal stake.',
    },
    sourcedExample: { exists: false },
    artifact: { artifact_type: 'Table', fields: { team_benefits: [], org_benefits: [], concerns: [] } },
  },
  KNOWLEDGE: {
    id: 'MOVE_KNOWLEDGE_MICROTRAIN',
    title: 'Run one micro-training (15 minutes)',
    why: 'If know-how is the barrier, short targeted practice beats big training decks.',
    steps: [
      'Pick the one critical step people keep missing or avoiding.',
      'Create a 15-minute demo + one try-it-now exercise.',
      'Capture the top 3 questions raised and answer them once, clearly.',
    ],
    role_framing: {
      INDIVIDUAL:    'Use this when you know what to do but haven\'t practiced it yet. Doing beats reading.',
      PEOPLE_LEADER: 'Use this when your team keeps reverting because they haven\'t built the muscle. Make practice the default.',
    },
    sourcedExample: { exists: false },
    artifact: { artifact_type: 'Checklist', fields: { topic: '', demo_link: '', top_questions: [] } },
  },
  ABILITY: {
    id: 'MOVE_PROCESS_FRICTION_LOG',
    title: 'Start a friction log',
    why: 'When ability is the barrier, the workflow is fighting people. Turn pain into fixable data.',
    steps: [
      'Write the exact step that breaks down or slows you (or your team) down.',
      'Record what you tried and what happened.',
      'Route each item to an owner and a date.',
    ],
    role_framing: {
      INDIVIDUAL:    'Use this when you\'re willing but something keeps blocking you. Naming it precisely is the first step to removing it.',
      PEOPLE_LEADER: 'Use this when your team is stuck not because of attitude but because of process friction. Data beats assumptions.',
    },
    sourcedExample: { exists: false },
    artifact: { artifact_type: 'Log entry', fields: { friction_points: [] } },
  },
  REINFORCEMENT: {
    id: 'MOVE_REINFORCE_BEHAVIOR',
    title: 'Create a reinforcement loop',
    why: 'Without reinforcement, people drift back. The old way is easier until the new way becomes automatic.',
    steps: [
      'Name one behavior that\'s slipping back to the old way.',
      'Name who or what catches the slip (metric, check-in, peer cue).',
      'Build one visible recognition or reminder into the regular workflow.',
    ],
    role_framing: {
      INDIVIDUAL:    'Ask yourself: what makes the old habit easier than the new one? Remove that friction. Add a cue.',
      PEOPLE_LEADER: 'Identify the one behavior you want to become automatic, and design recognition around it publicly.',
    },
    sourcedExample: { exists: false },
    artifact: { artifact_type: 'Loop card', fields: { behavior: '', catcher: '', reward_or_reminder: '' } },
  },
};

const HINT_BANNER = {
  REGULATE_FIRST: {
    color: 'bg-rose-50 border-rose-200 text-rose-900',
    msg:   'High load detected.',
    link:  'Consider starting with a Regulate session.',
  },
  MICRO_MOVE_ONLY: {
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    msg:   'Capacity is stretched.',
    link:  'Focus on the smallest step. Skip anything optional today.',
  },
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DoNextPage() {
  const { state, dispatch } = useAppState();
  const [saved, setSaved]   = useState(false);

  const role    = state.role;
  const barrier = state.currentDiagnosis?.input_echo?.signals?.barrier_tag || 'AWARENESS';
  const hint    = state.currentDiagnosis?._internal?.final_route_hint || 'NORMAL';

  const rec = useMemo(() => MOVES[barrier] || MOVES.AWARENESS, [barrier]);

  const framing = rec.role_framing?.[role] || '';

  const handleSave = () => {
    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key: rec.id,
        value: {
          id:        rec.id,
          title:     rec.title,
          why:       rec.why,
          steps:     rec.steps,
          artifact:  rec.artifact,
          source:    'DO_NEXT',
          role,
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSaved(true);
  };

  const banner = HINT_BANNER[hint];

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4 animate-in">
      {/* route-hint banner */}
      {banner && (
        <div className={`p-4 rounded-xl border ${banner.color} text-sm font-medium flex flex-wrap items-center gap-2`}>
          <span>{banner.msg}</span>
          {hint === 'REGULATE_FIRST'
            ? <Link to="/regulate" className="underline font-semibold">{banner.link}</Link>
            : <span>{banner.link}</span>
          }
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
          Barrier: {barrier.charAt(0) + barrier.slice(1).toLowerCase()}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Next Best Move</h1>
        <p className="text-slate-500 mt-1 text-sm">One move. Three steps. Start today.</p>

        {/* role framing */}
        {framing && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 italic">
            {framing}
          </div>
        )}

        {/* the move */}
        <div className="mt-5 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
          <div className="text-base font-bold text-indigo-900">{rec.title}</div>
          <p className="text-slate-700 mt-2 text-sm leading-relaxed">{rec.why}</p>

          <ol className="mt-4 space-y-2 text-slate-800 text-sm">
            {rec.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* sourced example */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
          <div className="font-semibold text-slate-700 mb-1">Sourced example</div>
          {rec.sourcedExample?.exists ? (
            <>
              <p className="text-slate-800">{rec.sourcedExample.text}</p>
              {rec.sourcedExample.citation && (
                <p className="text-xs text-slate-500 mt-2">
                  Source: <a className="underline" href={rec.sourcedExample.citation.url} target="_blank" rel="noreferrer">{rec.sourcedExample.citation.title}</a>
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-500 italic">No sourced example found for this pattern yet.</p>
          )}
        </div>

        {/* actions */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" />
            {saved ? 'Saved to plan' : 'Add to Plan'}
          </button>
          <Link
            to="/plan"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            View Plan
          </Link>
          <Link
            to="/map"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            See on Map
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-400">Directional, not absolute. Take what fits today.</p>
      </div>
    </div>
  );
}
