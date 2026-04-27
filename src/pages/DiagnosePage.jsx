import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Zap, ClipboardList } from 'lucide-react';
import { useAppState } from '../components/AppState';
import { scoreDiagnose } from '../lib/diagnoseEngine';

// ─── module definitions (mirrors 01_diagnose_module_config.json) ─────────────

const LIKERT_LABELS = ['Strongly\nDisagree', 'Disagree', 'Mixed', 'Agree', 'Strongly\nAgree'];

const MODULES = [
  {
    id: 'ADKAR_BARRIER', required: true, type: 'likert',
    title: 'What feels hardest?',
    subtitle: 'Rate each statement honestly. The lowest-scoring area is your current barrier.',
    items: [
      { id: 'ADKAR_A1',  prompt: 'I understand why this change is happening.' },
      { id: 'ADKAR_A2',  prompt: 'I understand what problem the change is trying to solve.' },
      { id: 'ADKAR_D1',  prompt: 'I want to support this change (even if I don\'t love it).' },
      { id: 'ADKAR_D2',  prompt: 'I can name a personal benefit that matters to me.' },
      { id: 'ADKAR_K1',  prompt: 'I know what I\'m supposed to do differently.' },
      { id: 'ADKAR_K2',  prompt: 'I know where to find guidance (docs, training, examples).' },
      { id: 'ADKAR_AB1', prompt: 'I can perform the new behavior with minimal help.' },
      { id: 'ADKAR_AB2', prompt: 'I have the time, tools, and access to work the new way.' },
      { id: 'ADKAR_R1',  prompt: 'I get feedback or recognition that reinforces the new behavior.' },
      { id: 'ADKAR_R2',  prompt: 'When I slip back, something or someone catches it.' },
    ],
  },
  {
    id: 'CHANGE_LOAD', required: true, type: 'likert',
    title: 'How much are you carrying?',
    subtitle: 'Load affects what\'s possible. Be honest about your current capacity.',
    items: [
      { id: 'LOAD_L1', prompt: 'My workload has increased because of this change.' },
      { id: 'LOAD_L2', prompt: 'I feel stressed or mentally overloaded right now.' },
      { id: 'LOAD_L3', prompt: 'I have enough time to learn and practice the new way.' },
      { id: 'LOAD_L4', prompt: 'I\'m dealing with multiple changes at once.' },
      { id: 'LOAD_L5', prompt: 'I have the energy to handle setbacks while learning.' },
      { id: 'LOAD_L6', prompt: 'I can focus without constant interruptions or fire drills.' },
    ],
  },
  {
    id: 'GOVERNANCE_CLARITY', required: true, type: 'likert',
    title: 'How clear is the path?',
    subtitle: 'Clarity = knowing who decides what, and where to get answers.',
    items: [
      { id: 'GOV_G1', prompt: 'I know who owns final decisions when there\'s disagreement.' },
      { id: 'GOV_G2', prompt: 'I know what I can decide vs. what must be escalated.' },
      { id: 'GOV_G3', prompt: 'I know where the source of truth lives for this change.' },
      { id: 'GOV_G4', prompt: 'When I ask a question, I get a clear answer quickly.' },
      { id: 'GOV_G5', prompt: 'I know the timeline and what\'s expected of me by when.' },
      { id: 'GOV_G6', prompt: 'There is a clear way to raise issues and see progress on fixes.' },
    ],
  },
  {
    id: 'ZONES_OF_CHANGE', required: true, type: 'likert',
    title: 'Where are you right now?',
    subtitle: 'Rate how much each statement describes your current experience.',
    items: [
      { id: 'ZONE_Z1', prompt: 'The change hasn\'t really affected my day-to-day work yet.' },
      { id: 'ZONE_Z2', prompt: 'My normal routines and results are disrupted right now.' },
      { id: 'ZONE_Z3', prompt: 'I\'m trying new ways of working and learning what works (it\'s messy).' },
      { id: 'ZONE_Z4', prompt: 'The change feels normal and I\'m improving beyond the original plan.' },
    ],
  },
  {
    id: 'BRIDGES_PHASE', required: true, type: 'likert',
    title: 'Where is your mind?',
    subtitle: 'Transitions have emotional phases. Which resonates most right now?',
    items: [
      { id: 'BRIDGES_E1',  prompt: 'I\'m still letting go of how things used to work.' },
      { id: 'BRIDGES_E2',  prompt: 'I feel a sense of loss or frustration about what\'s being left behind.' },
      { id: 'BRIDGES_NZ1', prompt: 'Things feel unclear or in-between — I\'m not sure what the new normal is.' },
      { id: 'BRIDGES_NZ2', prompt: 'I\'m experimenting, but consistency isn\'t there yet.' },
      { id: 'BRIDGES_NB1', prompt: 'I can see how the new way helps and I\'m bought in.' },
      { id: 'BRIDGES_NB2', prompt: 'I\'m acting with confidence in the new way and helping it stick.' },
    ],
  },
  {
    id: 'PERSONA_CLASSIFIER', required: false, type: 'forced_choice',
    title: 'How do you tend to respond?',
    subtitle: 'Optional — 8 quick questions about your default patterns.',
    items: [
      { id: 'PERS_P1', prompt: 'When change is announced, I usually…', options: { 1:'Jump in early and try it', 2:'Wait until it\'s proven', 3:'Focus on what might break or go wrong', 4:'Disengage because it feels pointless' } },
      { id: 'PERS_P2', prompt: 'In ambiguity, I prefer…', options: { 1:'Experimenting', 2:'Getting clear rules first', 3:'Escalating to authority quickly', 4:'Staying quiet and doing my own workaround' } },
      { id: 'PERS_P3', prompt: 'When others resist, I…', options: { 1:'Persuade and help them see possibilities', 2:'Let them come around over time', 3:'Get frustrated and push compliance', 4:'Avoid the conflict' } },
      { id: 'PERS_P4', prompt: 'My default stress response is…', options: { 1:'Action', 2:'Analysis', 3:'Control', 4:'Withdrawal' } },
      { id: 'PERS_P5', prompt: 'If the change is messy, I…', options: { 1:'Tolerate mess if progress is happening', 2:'Need a stable plan before I commit', 3:'Demand immediate clarity or structure', 4:'Assume it will fail' } },
      { id: 'PERS_P6', prompt: 'When learning a new process, I…', options: { 1:'Learn by doing', 2:'Read or watch first', 3:'Want live guided support', 4:'Procrastinate until forced' } },
      { id: 'PERS_P7', prompt: 'My relationship to new tools is…', options: { 1:'Excited', 2:'Cautious', 3:'Skeptical', 4:'Avoidant' } },
      { id: 'PERS_P8', prompt: 'If leadership messages are vague, I…', options: { 1:'Ask questions', 2:'Wait', 3:'Fill in the blanks and tell others', 4:'Tune out' } },
    ],
  },
  {
    id: 'POINT_OF_DECISION', required: false, type: 'likert',
    title: 'How close are you to committing?',
    subtitle: 'Optional — 3 questions about your readiness to act.',
    items: [
      { id: 'POD_P1', prompt: 'I feel clear enough to try the change this week.' },
      { id: 'POD_P2', prompt: 'Even if I don\'t love everything, I\'m willing to take the next step.' },
      { id: 'POD_P3', prompt: 'I\'m spending more energy on how to make it work than on questioning why.' },
    ],
  },
];

const REQUIRED_MODULES = MODULES.filter(m => m.required);
const OPTIONAL_MODULES = MODULES.filter(m => !m.required);

// ─── quick mode questions (original 3-question flow) ─────────────────────────

const QUICK_QUESTIONS = [
  {
    key: 'valence', prompt_individual: 'How are you feeling about this change overall?', prompt_leader: 'How is your team feeling about this change overall?',
    options: [
      { label: 'Mostly positive — I see the upside.', value: 'POSITIVE' },
      { label: 'Mixed — some good, some hard.',       value: 'MIXED' },
      { label: 'Mostly negative — this feels like a loss or a risk.', value: 'NEGATIVE' },
      { label: 'Not sure yet — I need more information.', value: 'UNCERTAIN' },
    ],
  },
  {
    key: 'barrier', prompt_individual: 'What would help most right now?', prompt_leader: 'What is your team needing most right now?',
    options: [
      { label: 'Clarity: what\'s changing and why.', value: 'AWARENESS' },
      { label: 'Motivation: reasons to commit.',     value: 'DESIRE' },
      { label: 'Know-how: training, steps, examples.', value: 'KNOWLEDGE' },
      { label: 'Practice: help making it stick.',    value: 'ABILITY' },
      { label: 'Recognition: feedback on the new behavior.', value: 'REINFORCEMENT' },
    ],
  },
  {
    key: 'bridge', prompt_individual: 'Where are you in the transition?', prompt_leader: 'Where is your team in the transition?',
    options: [
      { label: 'Letting go of the old way.',         value: 'ENDINGS' },
      { label: 'In the messy middle.',               value: 'NEUTRAL_ZONE' },
      { label: 'Starting to build the new way.',     value: 'NEW_BEGINNING' },
    ],
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function LikertItem({ item, value, onChange }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0">
      <p className="text-sm text-slate-800 font-medium mb-2 leading-snug">{item.prompt}</p>
      <div className="flex gap-1.5" role="group" aria-label={item.prompt}>
        {[0,1,2,3,4].map(v => (
          <button
            key={v}
            onClick={() => onChange(item.id, v)}
            aria-pressed={value === v}
            aria-label={LIKERT_LABELS[v].replace('\n', ' ')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
              value === v
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-0.5 px-0.5">
        <span className="text-[10px] text-slate-400">Strongly disagree</span>
        <span className="text-[10px] text-slate-400">Strongly agree</span>
      </div>
    </div>
  );
}

function ForcedChoiceItem({ item, value, onChange }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0">
      <p className="text-sm text-slate-800 font-medium mb-2 leading-snug">{item.prompt}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5" role="group" aria-label={item.prompt}>
        {Object.entries(item.options).map(([k, label]) => (
          <button
            key={k}
            onClick={() => onChange(item.id, Number(k))}
            aria-pressed={value === Number(k)}
            className={`text-left px-3 py-2 rounded-lg text-sm border transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
              value === Number(k)
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── full diagnose mode ────────────────────────────────────────────────────────

function FullDiagnose({ role, onComplete }) {
  const allModules        = [...REQUIRED_MODULES, ...OPTIONAL_MODULES];
  const [moduleIdx, setModuleIdx] = useState(0);
  const [responses, setResponses]  = useState({});   // { moduleId: { itemId: value } }

  const current = allModules[moduleIdx];
  const moduleRes = responses[current.id] || {};

  const answeredCount = Object.keys(moduleRes).length;
  const threshold     = Math.ceil(current.items.length * 0.7);
  const canContinue   = !current.required || answeredCount >= threshold;

  const handleChange = (itemId, value) => {
    setResponses(prev => ({
      ...prev,
      [current.id]: { ...(prev[current.id] || {}), [itemId]: value },
    }));
  };

  const handleNext = () => {
    if (moduleIdx < allModules.length - 1) {
      setModuleIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(responses, 'FULL');
    }
  };

  const handleSkip = () => {
    if (moduleIdx < allModules.length - 1) {
      setModuleIdx(i => i + 1);
    } else {
      onComplete(responses, 'FULL');
    }
  };

  const isLast = moduleIdx === allModules.length - 1;
  const reqIdx  = REQUIRED_MODULES.findIndex(m => m.id === current.id);

  return (
    <div className="max-w-2xl mx-auto animate-in">
      {/* progress */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-1">
          {allModules.map((m, i) => (
            <div
              key={m.id}
              className={`h-1.5 rounded-full transition-all ${
                i < moduleIdx
                  ? 'bg-indigo-600'
                  : i === moduleIdx
                  ? 'bg-indigo-400'
                  : 'bg-slate-200'
              } ${m.required ? 'w-8' : 'w-5'}`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {current.required
            ? `Required ${reqIdx + 1} of ${REQUIRED_MODULES.length}`
            : 'Optional'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{current.title}</h2>
          <p className="text-slate-500 text-sm mt-1">{current.subtitle}</p>
          {current.required && (
            <p className="text-xs text-slate-400 mt-1">
              Answer at least {threshold} of {current.items.length} to continue.
            </p>
          )}
        </div>

        <div className="px-6 divide-y divide-slate-100">
          {current.type === 'likert'
            ? current.items.map(item => (
                <LikertItem
                  key={item.id}
                  item={item}
                  value={moduleRes[item.id] ?? null}
                  onChange={handleChange}
                />
              ))
            : current.items.map(item => (
                <ForcedChoiceItem
                  key={item.id}
                  item={item}
                  value={moduleRes[item.id] ?? null}
                  onChange={handleChange}
                />
              ))
          }
        </div>

        <div className="p-6 flex items-center gap-3 border-t border-slate-100">
          {moduleIdx > 0 && (
            <button
              onClick={() => setModuleIdx(i => i - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {!current.required && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold text-sm hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canContinue}
            className="ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            {isLast ? 'Get my read' : 'Continue'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── quick diagnose mode ──────────────────────────────────────────────────────

function QuickDiagnose({ role, onComplete }) {
  const isLeader = role === 'PEOPLE_LEADER';
  const [stepIdx,  setStepIdx]  = useState(0);
  const [answers,  setAnswers]  = useState({});

  const q = QUICK_QUESTIONS[stepIdx];

  const handlePick = (value) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (stepIdx < QUICK_QUESTIONS.length - 1) {
      setStepIdx(i => i + 1);
      return;
    }
    // Build a minimal module-response packet for the engine
    const moduleRes = {
      ADKAR_BARRIER: {},
      CHANGE_LOAD: {},
      GOVERNANCE_CLARITY: {},
      ZONES_OF_CHANGE: {},
      BRIDGES_PHASE: {},
    };
    // Map quick answers into the relevant module fields
    const barrierMap = { AWARENESS:'ADKAR_A1', DESIRE:'ADKAR_D1', KNOWLEDGE:'ADKAR_K1', ABILITY:'ADKAR_AB1', REINFORCEMENT:'ADKAR_R1' };
    if (next.barrier && barrierMap[next.barrier]) {
      moduleRes.ADKAR_BARRIER[barrierMap[next.barrier]] = 1; // below-average signal
    }
    const bridgeMap = { ENDINGS:'BRIDGES_E1', NEUTRAL_ZONE:'BRIDGES_NZ1', NEW_BEGINNING:'BRIDGES_NB1' };
    if (next.bridge && bridgeMap[next.bridge]) {
      moduleRes.BRIDGES_PHASE[bridgeMap[next.bridge]] = 3;
    }
    onComplete(moduleRes, 'QUICK', next.valence);
  };

  return (
    <div className="max-w-xl mx-auto animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-sm font-semibold text-indigo-600 mb-2">
          Question {stepIdx + 1} of {QUICK_QUESTIONS.length}
        </p>
        <h2 className="text-xl font-bold text-slate-900">
          {isLeader ? q.prompt_leader : q.prompt_individual}
        </h2>
        <div className="mt-5 space-y-2.5">
          {q.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => handlePick(opt.value)}
              className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400 transition-all shadow-sm text-slate-800 font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-400">Directional read. Not a label.</p>
      </div>
    </div>
  );
}

// ─── mode selector ────────────────────────────────────────────────────────────

function ModeSelector({ onSelect }) {
  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">Diagnose</h1>
        <p className="text-slate-500 mt-2">Get a read on where you are. Choose your depth.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('quick')}
          className="group text-left p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
            <Zap className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Quick Check</h2>
          <p className="text-sm text-slate-500 mt-1">3 questions · ~1 minute</p>
          <p className="text-sm text-slate-600 mt-3">Get a directional read fast. Good for a daily gut-check.</p>
        </button>
        <button
          onClick={() => onSelect('full')}
          className="group text-left p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Full Read</h2>
          <p className="text-sm text-slate-500 mt-1">5 required sections + 2 optional · ~10 minutes</p>
          <p className="text-sm text-slate-600 mt-3">Full picture. Feeds the Change Map, Coach, and Plan automatically.</p>
        </button>
      </div>
    </div>
  );
}

// ─── result summary ───────────────────────────────────────────────────────────

const BARRIER_LABELS = {
  AWARENESS:'Awareness', DESIRE:'Desire', KNOWLEDGE:'Knowledge',
  ABILITY:'Ability', REINFORCEMENT:'Reinforcement', UNKNOWN:'Unclear',
};
const PHASE_LABELS  = { ENDINGS:'Endings', NEUTRAL_ZONE:'Neutral Zone', NEW_BEGINNING:'New Beginning', UNKNOWN:'Unclear' };
const ZONE_LABELS   = { STATUS_QUO:'Status Quo', DISRUPTION:'Disruption', ADAPTATION:'Adaptation', ADOPTION:'Adoption', INNOVATION:'Innovation', UNKNOWN:'Unclear' };
const HINT_COPY     = {
  REGULATE_FIRST:  { label:'Regulate first', color:'text-rose-700 bg-rose-50 border-rose-200', note:'High load detected. Consider a short regulate session before taking action.' },
  MICRO_MOVE_ONLY: { label:'Micro moves only', color:'text-amber-700 bg-amber-50 border-amber-200', note:'Capacity is stretched. Focus on the smallest possible next step.' },
  NORMAL:          { label:'Ready to move', color:'text-teal-700 bg-teal-50 border-teal-200', note:'You have enough capacity to take a meaningful next step.' },
};

function ResultSummary({ diagnosis, onContinue }) {
  const where   = diagnosis?.coach?.where_you_likely_are || {};
  const hint    = diagnosis?._internal?.final_route_hint || 'NORMAL';
  const hintMeta = HINT_COPY[hint] || HINT_COPY.NORMAL;

  return (
    <div className="max-w-xl mx-auto animate-in space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Here's your read</h2>
      <p className="text-slate-500 text-sm">{where.confidence_note}</p>

      <div className={`p-4 rounded-2xl border ${hintMeta.color}`}>
        <div className="font-bold">{hintMeta.label}</div>
        <div className="text-sm mt-0.5">{hintMeta.note}</div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-500">Current barrier</div>
          <div className="font-bold text-slate-900">{BARRIER_LABELS[where.adkar_barrier] || '—'}</div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-500">Bridges phase</div>
          <div className="font-bold text-slate-900">{PHASE_LABELS[where.bridges_phase] || '—'}</div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-500">Zone of change</div>
          <div className="font-bold text-slate-900">{ZONE_LABELS[where.zones_of_change] || '—'}</div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-center gap-2"
      >
        See my next best move <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── page root ────────────────────────────────────────────────────────────────

export default function DiagnosePage() {
  const { state, dispatch } = useAppState();
  const navigate            = useNavigate();
  const [mode, setMode]     = useState(null);   // null | 'quick' | 'full'
  const [result, setResult] = useState(null);

  const handleComplete = (moduleResponses, diagMode, valence = null) => {
    const diagnosis = scoreDiagnose(moduleResponses, state.role, diagMode);
    if (valence) diagnosis._internal.valence = valence;
    dispatch({ type: 'SAVE_DIAGNOSIS', payload: diagnosis });
    if (diagMode === 'QUICK') {
      navigate('/do-next');
    } else {
      setResult(diagnosis);
    }
  };

  if (result) {
    return (
      <ResultSummary
        diagnosis={result}
        onContinue={() => navigate('/do-next')}
      />
    );
  }

  if (mode === 'quick') {
    return <QuickDiagnose role={state.role} onComplete={handleComplete} />;
  }
  if (mode === 'full') {
    return <FullDiagnose role={state.role} onComplete={handleComplete} />;
  }

  return <ModeSelector onSelect={setMode} />;
}
