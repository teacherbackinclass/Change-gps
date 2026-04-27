import React, { useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useAppState } from '../components/AppState';

// ─── Branching Scenarios ──────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: 'SC_ANNOUNCE',
    title: 'The big announcement',
    setup_individual: 'Your organization just announced a major process change with limited details. Your team looks to you for clarity.',
    setup_leader:     'You\'ve just received word of a major change that affects your team. You have partial information and need to respond.',
    prompt_individual: 'What do you do first?',
    prompt_leader:     'What do you do first?',
    choices: [
      {
        id: 'A', label_individual: 'Wait until I have all the details before saying anything.',
        label_leader: 'Wait until I have the full picture before communicating.',
        feedback_individual: 'Waiting feels safe, but silence creates a vacuum — and people fill it with rumors. A brief "Here\'s what I know and when I\'ll know more" beats silence every time.',
        feedback_leader:     'Delaying communication increases anxiety. Even partial information with a clear next-update date is better than silence.',
        score: 1,
      },
      {
        id: 'B', label_individual: 'Ask my manager directly: what does this mean for my specific role?',
        label_leader: 'Tell the team what I know, what I don\'t know, and when I\'ll have more.',
        feedback_individual: 'Good instinct. Specificity reduces anxiety. Asking about your role turns a vague threat into a manageable question.',
        feedback_leader:     'Naming uncertainty directly builds trust. "I don\'t know yet" with a date is more honest and useful than false reassurance.',
        score: 4,
      },
      {
        id: 'C', label_individual: 'Tell coworkers my concerns and theories.',
        label_leader: 'Tell the team everything will be fine and not to worry.',
        feedback_individual: 'Venting can feel good short-term, but it can amplify anxiety and spread misinformation. Save it for a trusted peer, not the group channel.',
        feedback_leader:     'Overstatement erodes trust when the hard parts hit. People remember "don\'t worry" when things do get hard.',
        score: 2,
      },
      {
        id: 'D', label_individual: 'Start updating my resume just in case.',
        label_leader: 'Forward the announcement and ask the team to read it.',
        feedback_individual: 'That\'s a personal choice — but consider whether you have enough information yet to judge the risk. A premature exit can close doors unnecessarily.',
        feedback_leader:     'Forwarding without framing makes people feel abandoned. They need context, not just information.',
        score: 1,
      },
    ],
    learning_key: 'BRANCHING_SC_ANNOUNCE',
  },
  {
    id: 'SC_RESIST',
    title: 'The resistant team member',
    setup_individual: 'A trusted colleague tells you privately: "I don\'t see the point of this change. It\'s just more work for no reason."',
    setup_leader:     'A team member comes to you and says: "I don\'t see the point of this change."',
    prompt_individual: 'How do you respond?',
    prompt_leader:     'What do you do?',
    choices: [
      {
        id: 'A', label_individual: 'Explain the business case in detail.',
        label_leader: 'Explain the business case again in detail.',
        feedback_individual: 'Logic rarely moves emotion first. They may already know the business case — what they need is to feel heard.',
        feedback_leader:     'If they\'ve heard the case before and still resist, more data won\'t move them. Listening first does.',
        score: 2,
      },
      {
        id: 'B', label_individual: 'Ask what specifically feels wrong or pointless to them.',
        label_leader: 'Ask them what specifically feels wrong or unclear.',
        feedback_individual: 'Discovery before prescription. You might learn something real — and they\'ll feel heard either way.',
        feedback_leader:     'Understanding their specific concern gives you something to actually address. It\'s also a sign of respect.',
        score: 4,
      },
      {
        id: 'C', label_individual: 'Tell them compliance is required and move on.',
        label_leader: 'Tell them compliance is required.',
        feedback_individual: 'Shutting down a concern can breed resentment. You don\'t have to solve it, but dismissing it makes things worse.',
        feedback_leader:     'Compliance without desire creates minimum performance and quiet resentment. People will technically comply but won\'t bring their effort.',
        score: 1,
      },
      {
        id: 'D', label_individual: 'Acknowledge their frustration and share your personal "why".',
        label_leader: 'Acknowledge their frustration and share your personal "why" for supporting the change.',
        feedback_individual: 'Human connection before information. This builds trust and may help them find their own reason to engage.',
        feedback_leader:     'A leader who shares their genuine perspective — not just the party line — creates space for honest conversation.',
        score: 4,
      },
    ],
    learning_key: 'BRANCHING_SC_RESIST',
  },
];

function BranchingSection({ role, onSave }) {
  const isLeader = role === 'PEOPLE_LEADER';
  const [scIdx,    setScIdx]    = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [saved,    setSaved]    = useState(false);

  const sc = SCENARIOS[scIdx];
  const choice = chosen ? sc.choices.find(c => c.id === chosen) : null;

  const handleNext = () => {
    setChosen(null);
    setSaved(false);
    if (scIdx < SCENARIOS.length - 1) setScIdx(i => i + 1);
    else setScIdx(0);
  };

  const handleSave = () => {
    if (!choice) return;
    const label = isLeader ? choice.label_leader : choice.label_individual;
    const fb    = isLeader ? choice.feedback_leader : choice.feedback_individual;
    onSave({
      id:    sc.learning_key,
      title: `Scenario: ${sc.title}`,
      why:   `You chose: "${label}"`,
      steps: [fb, 'Reflect: what would you do differently next time?'],
      source:    'SIMULATOR_BRANCHING',
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Scenario {scIdx + 1} of {SCENARIOS.length}
        </div>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <RotateCcw className="w-3 h-3" /> Next scenario
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-900">{sc.title}</h3>
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
        {isLeader ? sc.setup_leader : sc.setup_individual}
      </div>
      <p className="font-semibold text-slate-800 text-sm">{isLeader ? sc.prompt_leader : sc.prompt_individual}</p>

      {!chosen ? (
        <div className="space-y-2">
          {sc.choices.map(c => (
            <button
              key={c.id}
              onClick={() => setChosen(c.id)}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 text-sm font-medium text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {isLeader ? c.label_leader : c.label_individual}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border text-sm ${
            choice.score >= 4 ? 'bg-teal-50 border-teal-200' :
            choice.score >= 2 ? 'bg-amber-50 border-amber-200' :
            'bg-rose-50 border-rose-200'
          }`}>
            <div className="font-bold mb-1">
              {choice.score >= 4 ? 'Strong choice' : choice.score >= 2 ? 'Partial — there\'s a better path' : 'Worth reconsidering'}
            </div>
            <p>{isLeader ? choice.feedback_leader : choice.feedback_individual}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" /> {saved ? 'Saved' : 'Save to Plan'}
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Try another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Role-Play Chat ───────────────────────────────────────────────────────────

const RP_KEYWORDS = [
  { keys: ['frustrated','angry','upset','annoyed'],         reply: 'I hear that. Let\'s separate what you can control from what you can\'t. What\'s the one thing that feels most within your reach right now?' },
  { keys: ['don\'t understand','unclear','confused','no idea'], reply: 'That\'s fair — clarity is missing for a lot of people. If you could get the answer to just one question today, what would it be?' },
  { keys: ['worried','anxious','scared','afraid','nervous'], reply: 'That\'s a normal response to uncertainty. Here\'s what I can tell you today: [what\'s confirmed]. What would make this feel more manageable?' },
  { keys: ['overwhelmed','too much','can\'t keep up','too many'], reply: 'You\'re carrying a lot. Let\'s reduce it. What\'s one thing you could stop doing this week to make room for the change?' },
  { keys: ['fine','ok','good','okay'],                       reply: 'Good to hear. What would make it even better for you right now?' },
  { keys: ['resist','won\'t','refuse','not doing'],          reply: 'I\'m not going to push compliance. What would need to be true for this to feel worth doing?' },
  { keys: ['why','reason','purpose','makes sense'],          reply: 'The "why" matters. From my perspective: [reason relevant to them]. Does that land, or is there a gap I\'m not seeing?' },
  { keys: ['help','support','need'],                         reply: 'Tell me specifically what would help most. Time, clarity, practice, or someone to think with?' },
];
const RP_DEFAULT = 'Tell me more about what\'s specifically hard right now. The more concrete you are, the more useful this conversation gets.';

function matchReply(text) {
  const lower = text.toLowerCase();
  for (const { keys, reply } of RP_KEYWORDS) {
    if (keys.some(k => lower.includes(k))) return reply;
  }
  return RP_DEFAULT;
}

const RP_SCENARIO_INDIVIDUAL = 'You\'re practicing responding to a concerned team member (or preparing for a tough conversation with your manager). Type what you\'d say — get feedback on your approach.';
const RP_SCENARIO_LEADER     = 'You\'re practicing a difficult conversation with a team member who is resistant or anxious. Type what you\'d say — the "team member" will respond.';

function RolePlaySection({ role, onSave }) {
  const isLeader = role === 'PEOPLE_LEADER';
  const [input,    setInput]    = useState('');
  const [transcript, setTranscript] = useState([]);
  const [saved,    setSaved]    = useState(false);
  const inputRef   = useRef(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const reply = matchReply(text);
    setTranscript(prev => [
      ...prev,
      { from: 'USER', text },
      { from: 'AI',   text: reply },
    ]);
    setInput('');
    setSaved(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = () => {
    onSave({
      id:        `ROLEPLAY_${Date.now()}`,
      title:     'Role-play practice session',
      why:       `${transcript.length / 2} exchange(s) completed.`,
      steps:     transcript.slice(-4).map(t => `${t.from === 'USER' ? 'You' : 'Other'}: ${t.text}`),
      source:    'SIMULATOR_ROLEPLAY',
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
        {isLeader ? RP_SCENARIO_LEADER : RP_SCENARIO_INDIVIDUAL}
      </div>

      {transcript.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {transcript.map((t, i) => (
            <div key={i} className={`flex ${t.from === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                t.from === 'USER'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}>
                {t.text}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={transcript.length === 0 ? 'Type what you\'d say…' : 'Continue the conversation…'}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
          aria-label="Type your message"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          Send
        </button>
      </div>

      {transcript.length >= 2 && (
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" /> {saved ? 'Saved to Plan' : 'Save session to Plan'}
        </button>
      )}
    </div>
  );
}

// ─── Curve Simulator ─────────────────────────────────────────────────────────

const CURVE_CHOICES = [
  {
    prompt: 'Your team is starting a new process change. What do you do first?',
    options: [
      { label: 'Hold a kickoff with a clear agenda and goals.',          deltas: { clarity: 15, adoption: 5,  morale: 10 } },
      { label: 'Send a detailed written brief for people to read.',      deltas: { clarity: 10, adoption: 0,  morale: 0  } },
      { label: 'Let people figure it out — they\'re capable.',          deltas: { clarity: -5, adoption: -5, morale: -10 } },
      { label: 'Focus on quick visible wins to build momentum.',         deltas: { clarity: 5,  adoption: 15, morale: 10 } },
    ],
  },
  {
    prompt: 'A team member says they\'re overwhelmed. You:',
    options: [
      { label: 'Acknowledge it and remove one task from their plate.',   deltas: { clarity: 5,  adoption: 5,  morale: 15 } },
      { label: 'Tell them to push through — it\'ll get easier.',         deltas: { clarity: 0,  adoption: -5, morale: -15 } },
      { label: 'Ask what specifically is hard and address that.',         deltas: { clarity: 10, adoption: 5,  morale: 10 } },
      { label: 'Share the bigger picture to help them see the point.',   deltas: { clarity: 5,  adoption: 5,  morale: 5  } },
    ],
  },
  {
    prompt: 'Two weeks in — some people are adopting, others aren\'t. You:',
    options: [
      { label: 'Celebrate early adopters publicly and specifically.',    deltas: { clarity: 5,  adoption: 20, morale: 10 } },
      { label: 'Focus coaching on the people who aren\'t yet onboard.',  deltas: { clarity: 5,  adoption: 10, morale: 5  } },
      { label: 'Add more training sessions.',                            deltas: { clarity: 10, adoption: 5,  morale: 0  } },
      { label: 'Set a hard deadline for full compliance.',               deltas: { clarity: 0,  adoption: 10, morale: -10 } },
    ],
  },
];

function MeterBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function CurveSimSection({ role, onSave }) {
  const [step,    setStep]    = useState(0);
  const [meters,  setMeters]  = useState({ clarity: 40, adoption: 30, morale: 50 });
  const [choices, setChoices] = useState([]);
  const [done,    setDone]    = useState(false);
  const [saved,   setSaved]   = useState(false);

  const current = CURVE_CHOICES[step];

  const handlePick = (opt) => {
    const next = {
      clarity:  Math.max(0, Math.min(100, meters.clarity  + opt.deltas.clarity)),
      adoption: Math.max(0, Math.min(100, meters.adoption + opt.deltas.adoption)),
      morale:   Math.max(0, Math.min(100, meters.morale   + opt.deltas.morale)),
    };
    setMeters(next);
    setChoices(prev => [...prev, { choice: opt.label, deltas: opt.deltas }]);
    if (step < CURVE_CHOICES.length - 1) setStep(s => s + 1);
    else setDone(true);
  };

  const handleReset = () => {
    setStep(0); setMeters({ clarity: 40, adoption: 30, morale: 50 });
    setChoices([]); setDone(false); setSaved(false);
  };

  const handleSave = () => {
    onSave({
      id:        `CURVE_SIM_${Date.now()}`,
      title:     'Curve Simulator result',
      why:       `Final: Clarity ${meters.clarity}%, Adoption ${meters.adoption}%, Morale ${meters.morale}%`,
      steps:     choices.map(c => `Choice: "${c.choice}" → Clarity ${c.deltas.clarity > 0 ? '+' : ''}${c.deltas.clarity}, Adoption ${c.deltas.adoption > 0 ? '+' : ''}${c.deltas.adoption}, Morale ${c.deltas.morale > 0 ? '+' : ''}${c.deltas.morale}`),
      source:    'SIMULATOR_CURVE',
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <MeterBar label="Clarity"   value={meters.clarity}  color="bg-indigo-500" />
        <MeterBar label="Adoption"  value={meters.adoption} color="bg-teal-500"   />
        <MeterBar label="Morale"    value={meters.morale}   color="bg-violet-500" />
      </div>

      {!done ? (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Decision {step + 1} of {CURVE_CHOICES.length}
          </div>
          <p className="font-semibold text-slate-800 text-sm">{current.prompt}</p>
          <div className="space-y-2">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handlePick(opt)}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 text-sm font-medium text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
            <div className="font-bold mb-1">Simulation complete</div>
            <p>Final state: Clarity {meters.clarity}% · Adoption {meters.adoption}% · Morale {meters.morale}%</p>
            <p className="mt-2 text-xs text-indigo-700">
              {meters.morale < 40
                ? 'Morale is low — people are burning out. Recovery starts with removing one burden and acknowledging the difficulty.'
                : meters.adoption < 50
                ? 'Adoption is lagging. Reinforcement and visible recognition are the next levers.'
                : 'Solid result. Keep the reinforcement rhythm going — adoption slips without it.'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" /> {saved ? 'Saved' : 'Save to Plan'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── page root ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'branching', label: 'Scenarios' },
  { id: 'roleplay',  label: 'Role-play' },
  { id: 'curve',     label: 'Curve Sim' },
];

export default function SimulatorPage() {
  const { state, dispatch } = useAppState();
  const [tab, setTab]       = useState('branching');

  const handleSave = (item) => {
    dispatch({ type: 'SAVE_PLAN_ITEM', payload: { key: item.id, value: item } });
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4 animate-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Simulator</h1>
        <p className="text-slate-500 text-sm mt-1">Safe practice before the real conversation.</p>

        {/* tabs */}
        <div className="mt-4 flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'branching' && <BranchingSection role={state.role} onSave={handleSave} />}
          {tab === 'roleplay'  && <RolePlaySection  role={state.role} onSave={handleSave} />}
          {tab === 'curve'     && <CurveSimSection  role={state.role} onSave={handleSave} />}
        </div>
      </div>
    </div>
  );
}
