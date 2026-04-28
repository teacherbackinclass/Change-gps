import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '../../components/AppState';

const SCENARIOS = [
  {
    id: 'S1',
    prompt: 'When change is first announced, your immediate instinct is to…',
    options: [
      { value: 'MOVE',     label: 'Jump in and start figuring out how to adapt.' },
      { value: 'MINIMIZE', label: 'Assume it won\'t affect you much and carry on.' },
      { value: 'WAIT',     label: 'Wait and see how it develops before doing anything.' },
      { value: 'RESIST',   label: 'Look for what\'s wrong with the decision.' },
      { value: 'QUIT',     label: 'Start thinking about whether this is still the right place for you.' },
    ],
  },
  {
    id: 'S2',
    prompt: 'When communication is unclear or vague, you tend to…',
    options: [
      { value: 'MOVE',     label: 'Ask directly for the information you need.' },
      { value: 'MINIMIZE', label: 'Assume it\'ll get clearer eventually and not worry about it.' },
      { value: 'WAIT',     label: 'Hold off until you hear something official.' },
      { value: 'RESIST',   label: 'Get frustrated and tell others about the poor communication.' },
      { value: 'QUIT',     label: 'Take the silence as a bad sign about the organization.' },
    ],
  },
  {
    id: 'S3',
    prompt: 'When you\'re asked to change a process you\'re good at, your reaction is…',
    options: [
      { value: 'MOVE',     label: 'Curiosity — what might work better?' },
      { value: 'MINIMIZE', label: 'Mild skepticism — "I\'ll do it but I doubt it helps."' },
      { value: 'WAIT',     label: 'Reluctance — "Let me see it work for others first."' },
      { value: 'RESIST',   label: 'Frustration — "We finally got this right and now we\'re changing it."' },
      { value: 'QUIT',     label: 'Fatigue — "This is the third process change this year."' },
    ],
  },
  {
    id: 'S4',
    prompt: 'When you hit a setback in the middle of a change, you…',
    options: [
      { value: 'MOVE',     label: 'Treat it as data and adjust.' },
      { value: 'MINIMIZE', label: 'Hope it resolves on its own.' },
      { value: 'WAIT',     label: 'Pause and see if leadership addresses it.' },
      { value: 'RESIST',   label: 'Use it as evidence the change was a bad idea.' },
      { value: 'QUIT',     label: 'Lose confidence that it will ever work.' },
    ],
  },
];

const PROFILES = {
  MOVE: {
    label:       'Mover / Early adapter',
    summary:     'You lean into change early. Your instinct is to act, learn, and adjust. This is a strength — but watch for moving so fast you leave others behind.',
    recommend:   'Use your energy to bring others along. Ask: "Who\'s struggling that I could help?" Share what\'s working rather than rushing ahead.',
    route:       'NORMAL',
    color:       'bg-teal-50 border-teal-200 text-teal-900',
  },
  MINIMIZE: {
    label:       'Minimizer',
    summary:     'You tend to underestimate how much a change affects you — or hope it will pass. This can protect you from anxiety short-term, but leaves you exposed later.',
    recommend:   'Ask yourself: "If this change sticks, what do I actually need to do differently?" Name one concrete impact so you can prepare.',
    route:       'NORMAL',
    color:       'bg-sky-50 border-sky-200 text-sky-900',
  },
  WAIT: {
    label:       'Waiter / Proof-seeker',
    summary:     'You prefer to see evidence before committing. This reduces risk — but can mean you\'re the last to benefit from something that works.',
    recommend:   'Find one small low-stakes way to try it. Ask: "What would I need to see to feel comfortable moving forward?"',
    route:       'NORMAL',
    color:       'bg-indigo-50 border-indigo-200 text-indigo-900',
  },
  RESIST: {
    label:       'Resistor',
    summary:     'You\'re skeptical and vocal. You surface concerns others miss — that\'s valuable. But resistance without action can become a pattern that isolates you.',
    recommend:   'Channel your skepticism into questions, not statements. "What would make this better?" is more useful than "This won\'t work." Try the Regulate tool if you\'re feeling charged.',
    route:       'REGULATE_FIRST',
    color:       'bg-amber-50 border-amber-200 text-amber-900',
  },
  QUIT: {
    label:       'Withdrawn / Checked out',
    summary:     'You\'re carrying a lot. Withdrawal is often a sign of accumulated change fatigue, broken trust, or unaddressed loss — not weakness.',
    recommend:   'Start with Regulate, not action. Then use the Focus & Influence Sort to identify what\'s within your control. One small safe step is enough.',
    route:       'REGULATE_FIRST',
    color:       'bg-rose-50 border-rose-200 text-rose-900',
  },
};

function scoreAnswers(answers) {
  const counts = { MOVE: 0, MINIMIZE: 0, WAIT: 0, RESIST: 0, QUIT: 0 };
  for (const v of Object.values(answers)) counts[v] = (counts[v] || 0) + 1;
  const max = Math.max(...Object.values(counts));
  // tie-break priority
  const priority = ['MOVE', 'WAIT', 'MINIMIZE', 'RESIST', 'QUIT'];
  return priority.find(p => counts[p] === max) || 'MOVE';
}

export default function ReactionProfile({ topic, role }) {
  const { dispatch }     = useAppState();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saved,     setSaved]     = useState(false);

  const answered = Object.keys(answers).length;
  const canSubmit = answered >= SCENARIOS.length;
  const profile   = useMemo(() => submitted ? PROFILES[scoreAnswers(answers)] : null, [submitted, answers]);

  const handleSave = () => {
    if (!profile) return;
    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key:   `REACTION_PROFILE_${Date.now()}`,
        value: {
          id:        `REACTION_PROFILE_${Date.now()}`,
          title:     `Reaction profile: ${profile.label}`,
          why:       profile.summary,
          steps:     [profile.recommend],
          source:    'TOOL_INTERACTIVE',
          toolId:    'TOOL_REACTION_PROFILE',
          outputs:   { REACTION_PROFILE: { profileType: scoreAnswers(answers), summary: profile.summary, recommendedRoute: profile.route } },
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSaved(true);
  };

  if (submitted && profile) {
    return (
      <div className="space-y-4">
        <div className={`p-5 rounded-2xl border ${profile.color}`}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1">Your profile</div>
          <h3 className="text-lg font-bold">{profile.label}</h3>
          <p className="text-sm mt-2 leading-relaxed">{profile.summary}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm">
          <div className="font-semibold text-slate-800 mb-1">Recommended next move</div>
          <p className="text-slate-700 leading-relaxed">{profile.recommend}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" /> {saved ? 'Saved' : 'Save to Plan'}
          </button>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false); setSaved(false); }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
        {role === 'PEOPLE_LEADER'
          ? 'Answer as yourself. Then use the profile types to think about where your team members might be.'
          : 'Answer honestly. This isn\'t a verdict — it\'s a starting point for choosing your next move.'}
      </div>

      {SCENARIOS.map((sc, i) => (
        <div key={sc.id}>
          <p className="text-sm font-semibold text-slate-800 mb-2.5">{i + 1}. {sc.prompt}</p>
          <div className="space-y-2">
            {sc.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setAnswers(prev => ({ ...prev, [sc.id]: opt.value })); setSaved(false); }}
                aria-pressed={answers[sc.id] === opt.value}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  answers[sc.id] === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => setSubmitted(true)}
        disabled={!canSubmit}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      >
        {canSubmit ? 'See my profile' : `Answer all ${SCENARIOS.length} scenarios to continue (${answered}/${SCENARIOS.length})`}
      </button>
    </div>
  );
}
