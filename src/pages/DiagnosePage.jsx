import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../components/AppState';

const QUESTIONS = {
  valence: {
    label_individual: 'How are you feeling about this change overall?',
    label_leader: 'How is your team feeling about this change overall?',
    options: [
      { label: 'Mostly positive — I see the upside.', value: 'POSITIVE' },
      { label: 'Mixed — some good, some hard.', value: 'MIXED' },
      { label: 'Mostly negative — this feels like a loss or a risk.', value: 'NEGATIVE' },
      { label: 'Not sure yet — I need more information.', value: 'UNCERTAIN' }
    ]
  },
  barrier: {
    label_individual: 'What would help you most right now?',
    label_leader: 'What is your team needing most right now?',
    options: [
      { label: 'Clarity: what’s changing and why.', value: 'AWARENESS' },
      { label: 'Motivation: reasons to commit / prioritize this.', value: 'DESIRE' },
      { label: 'Know-how: training, steps, examples.', value: 'KNOWLEDGE' },
      { label: 'Practice/support: help making it work in real life.', value: 'ABILITY' }
    ]
  },
  bridge: {
    label_individual: 'Where are you in the transition?',
    label_leader: 'Where is the team in the transition?',
    options: [
      { label: 'Letting go of the old way.', value: 'ENDINGS' },
      { label: 'In the messy middle.', value: 'NEUTRAL_ZONE' },
      { label: 'Starting to build the new way.', value: 'NEW_BEGINNING' }
    ]
  }
};

export default function DiagnosePage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const isLeader = state.role === 'PEOPLE_LEADER';

  const steps = ['valence', 'barrier', 'bridge'];
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const stepKey = steps[stepIdx];
  const q = QUESTIONS[stepKey];

  const handlePick = (value) => {
    const nextAnswers = { ...answers, [stepKey]: value };
    setAnswers(nextAnswers);

    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
      return;
    }

    // Build a Mode-A-aligned minimal diagnosis packet
    const clarity = nextAnswers.barrier === 'AWARENESS' ? 2 : 3;
    const confidence = nextAnswers.barrier === 'ABILITY' ? 2 : 3;

    const diagnosis = {
      input_echo: {
        role: state.role,
        signals: {
          clarity,
          confidence,
          barrier_tag: nextAnswers.barrier,
          action_completed: false
        }
      },
      coach: {
        where_you_likely_are: {
          adkar_barrier: nextAnswers.barrier,
          bridges_phase: nextAnswers.bridge,
          zones_of_change: 'ADAPTATION',
          confidence_note: 'Signals are directional, not absolute.'
        }
      },
      _internal: {
        valence: nextAnswers.valence
      }
    };

    dispatch({ type: 'SAVE_DIAGNOSIS', payload: diagnosis });
    navigate('/do-next');
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 animate-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-sm font-semibold text-indigo-600 mb-2">Question {stepIdx + 1} of 3</p>
        <h1 className="text-2xl font-bold text-slate-900">{isLeader ? q.label_leader : q.label_individual}</h1>

        <div className="mt-6 space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePick(opt.value)}
              className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400 transition-all shadow-sm"
            >
              <span className="text-slate-800 font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 text-xs text-slate-500">
          This is a directional read. Not a label.
        </div>
      </div>
    </div>
  );
}
