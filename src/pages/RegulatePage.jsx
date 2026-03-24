import React, { useEffect, useMemo, useState } from 'react';
import { Wind, Play, Pause } from 'lucide-react';
import RoleMirrorHeader from '../components/RoleMirrorHeader';

const PHASES = [
  { id: 'INHALE', label: 'Inhale', seconds: 4 },
  { id: 'HOLD_1', label: 'Hold', seconds: 4 },
  { id: 'EXHALE', label: 'Exhale', seconds: 4 },
  { id: 'HOLD_2', label: 'Hold', seconds: 4 }
];

export default function RegulatePage({ state }) {
  const reduceMotion = !!state?.settings?.reduceMotion;
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(PHASES[0].seconds);

  const phase = useMemo(() => PHASES[phaseIndex], [phaseIndex]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setPhaseIndex(i => (i + 1) % PHASES.length);
          return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, phaseIndex]);

  useEffect(() => {
    // When phase changes, reset countdown.
    setRemaining(PHASES[phaseIndex].seconds);
  }, [phaseIndex]);

  const orbScale = useMemo(() => {
    if (reduceMotion) return 1;
    if (phase.id === 'INHALE') return 1.15;
    if (phase.id === 'EXHALE') return 0.90;
    return 1.0;
  }, [phase.id, reduceMotion]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <RoleMirrorHeader
        role={state.role}
        title="Regulate"
        subtitle="A simple box-breathing tool to reduce overwhelm and improve focus."
      />

      <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-bold">
              <Wind className="w-4 h-4 text-indigo-600" /> Box breathing
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{phase.label}</h2>
            <p className="text-slate-600">Follow the timer. Repeat for 60–90 seconds to calm your body and sharpen attention.</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setRunning(r => !r)}
                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 ${running ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : 'Start'}
              </button>
              <div className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">{remaining}</span>s
                {reduceMotion ? <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">Reduced motion</span> : null}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700">
              <p className="font-bold">How to do it</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Inhale for 4 seconds</li>
                <li>Hold for 4 seconds</li>
                <li>Exhale for 4 seconds</li>
                <li>Hold for 4 seconds</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              className="relative w-64 h-64"
              aria-hidden="true"
            >
              <div className="absolute inset-0 rounded-full bg-indigo-200/40 blur-2xl" />
              <div
                className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl"
                style={{
                  transform: `scale(${orbScale})`,
                  transition: reduceMotion ? 'none' : 'transform 900ms ease-in-out'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/90 text-xs font-bold uppercase tracking-widest">{phase.label}</p>
                  <p className="text-white text-4xl font-black mt-1">{remaining}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
