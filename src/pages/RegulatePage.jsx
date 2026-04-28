import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Wind } from 'lucide-react';
import { useAppState } from '../components/AppState';

const PHASES = [
  { id: 'INHALE',  label: 'Inhale',  seconds: 4 },
  { id: 'HOLD_1',  label: 'Hold',    seconds: 4 },
  { id: 'EXHALE',  label: 'Exhale',  seconds: 4 },
  { id: 'HOLD_2',  label: 'Hold',    seconds: 4 },
];

export default function RegulatePage() {
  const { state }      = useAppState();
  const reduceMotion   = state.reduceMotion;
  const role           = state.role;

  const [running,    setRunning]    = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining,  setRemaining]  = useState(PHASES[0].seconds);

  const phase = useMemo(() => PHASES[phaseIndex], [phaseIndex]);

  // countdown timer
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setPhaseIndex(i => {
            const next = (i + 1) % PHASES.length;
            setRemaining(PHASES[next].seconds);
            return next;
          });
          return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex]);

  useEffect(() => {
    setRemaining(PHASES[phaseIndex].seconds);
  }, [phaseIndex]);

  const orbScale = useMemo(() => {
    if (reduceMotion) return 1;
    if (phase.id === 'INHALE') return 1.18;
    if (phase.id === 'EXHALE') return 0.88;
    return 1.0;
  }, [phase.id, reduceMotion]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          <Wind className="w-4 h-4" />
          <span>View as: {role === 'PEOPLE_LEADER' ? 'People Leader' : 'Individual'}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Regulate</h1>
        <p className="text-slate-600 mt-1">
          {role === 'PEOPLE_LEADER'
            ? 'Clarity starts with a calm nervous system. 60–90 seconds is enough.'
            : 'A simple box-breathing tool to reduce overwhelm and restore focus.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* left: controls */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-bold text-sm">
              <Wind className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              Box breathing · 4-4-4-4
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900" aria-live="polite" aria-atomic="true">
                {phase.label}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {running
                  ? `${remaining} second${remaining !== 1 ? 's' : ''} remaining`
                  : 'Press Start to begin.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setRunning(r => !r)}
                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  running
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                aria-pressed={running}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : 'Start'}
              </button>
              {reduceMotion && (
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                  Reduced motion
                </span>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700">
              <p className="font-bold text-slate-800">4-4-4-4 pattern</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-600">
                <li>Inhale for 4 seconds</li>
                <li>Hold for 4 seconds</li>
                <li>Exhale for 4 seconds</li>
                <li>Hold for 4 seconds</li>
              </ol>
              <p className="mt-3 text-xs text-slate-400">
                Repeat 3–4 times. Works best before difficult conversations or when feeling overwhelmed.
              </p>
            </div>
          </div>

          {/* right: orb */}
          <div className="flex items-center justify-center" aria-hidden="true">
            <div className="relative w-56 h-56 md:w-64 md:h-64">
              {/* glow */}
              <div className="absolute inset-0 rounded-full bg-indigo-200/40 blur-2xl" />
              {/* orb */}
              {reduceMotion ? (
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{phase.label}</p>
                    <p className="text-white text-4xl font-black mt-1">{remaining}</p>
                  </div>
                </div>
              ) : (
                <div
                  className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl flex items-center justify-center"
                  style={{
                    transform:  `scale(${orbScale})`,
                    transition: 'transform 900ms ease-in-out',
                  }}
                >
                  <div className="text-center">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{phase.label}</p>
                    <p className="text-white text-4xl font-black mt-1">{remaining}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
