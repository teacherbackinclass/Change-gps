import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../components/AppState';

const MOVE_LIBRARY = {
  AWARENESS: {
    id: 'MOVE_DEFINE_CHANGE_1_SENTENCE',
    title: 'Name the change (one sentence)',
    why: 'Clarity comes first. A simple statement reduces confusion and rumor cycles.',
    steps: [
      'Write the change in one plain sentence.',
      'Say what is NOT changing in one sentence.',
      'Share it and ask: “What’s unclear?”'
    ],
    artifact: { artifact_type: 'Statement card', fields: { change_sentence: '', not_changing: '' } }
  },
  DESIRE: {
    id: 'MOVE_WIIFM_MAP',
    title: 'Build a WIIFM map',
    why: 'People commit when they can name a personal and team benefit.',
    steps: [
      'List 2 benefits for the team.',
      'List 2 benefits for customers/business.',
      'Name 1 fear and address it directly.'
    ],
    artifact: { artifact_type: 'Table', fields: { team_benefits: [], org_benefits: [], concerns: [] } }
  },
  KNOWLEDGE: {
    id: 'MOVE_KNOWLEDGE_MICROTRAIN',
    title: 'Run one micro-training (15 minutes)',
    why: 'If know-how is the barrier, short, targeted practice beats big training decks.',
    steps: [
      'Pick one critical step people keep missing.',
      'Create a 15-minute demo + try-it-now.',
      'Capture the top 3 questions and answer them once.'
    ],
    artifact: { artifact_type: 'Checklist', fields: { topic: '', demo_link: '', top_questions: [] } }
  },
  ABILITY: {
    id: 'MOVE_PROCESS_FRICTION_LOG',
    title: 'Start a friction log',
    why: 'If ability is the barrier, the workflow is fighting people. Turn pain into fixable data.',
    steps: [
      'Write the exact step that breaks or slows you down.',
      'Record what you tried and what happened.',
      'Route each issue to an owner and date.'
    ],
    artifact: { artifact_type: 'Log entry', fields: { friction_points: [] } }
  }
};

export default function DoNextPage() {
  const { state, dispatch } = useAppState();
  const [done, setDone] = useState(false);

  const barrier = state.currentDiagnosis?.input_echo?.signals?.barrier_tag || 'AWARENESS';

  const rec = useMemo(() => {
    return MOVE_LIBRARY[barrier] || MOVE_LIBRARY.AWARENESS;
  }, [barrier]);

  const routeHint = state.currentDiagnosis?._internal?.final_route_hint || null;

  return (
    <div className="max-w-3xl mx-auto mt-6 animate-in space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Next Best Move</h1>
        <p className="text-slate-600 mt-2">One move now. Three steps to start.</p>

        <div className="mt-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
          <div className="text-sm font-bold text-indigo-700">{rec.title}</div>
          <div className="text-slate-700 mt-2">{rec.why}</div>

          <ol className="mt-4 space-y-2 list-decimal pl-5 text-slate-800">
            {rec.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => {
                dispatch({
                  type: 'SAVE_PLAN_ITEM',
                  payload: {
                    key: rec.id,
                    value: {
                      id: rec.id,
                      title: rec.title,
                      why: rec.why,
                      steps: rec.steps,
                      artifact: rec.artifact,
                      createdAt: new Date().toISOString(),
                      source: 'DO_NEXT'
                    }
                  }
                });
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Add to Plan
            </button>

            <button
              onClick={() => setDone(!done)}
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-50"
            >
              {done ? 'Marked done' : 'Mark as done'}
            </button>

            <Link to="/plan" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">
              View Plan
            </Link>
          </div>

          {routeHint === 'REGULATE_FIRST' && (
            <div className="mt-4 p-3 rounded-xl bg-white border border-indigo-100 text-indigo-900">
              High load detected. Consider <Link className="underline" to="/regulate">Regulate</Link> first.
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-slate-500">Directional, not absolute. Pick what fits today.</div>
      </div>
    </div>
  );
}
