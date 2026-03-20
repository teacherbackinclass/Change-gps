import React, { useEffect, useState } from 'react';

export default function RegulatePage() {
  const [phase, setPhase] = useState('Ready');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) { setPhase('Ready'); return; }
    const sequence = ['Inhale…', 'Hold (top)…', 'Exhale…', 'Hold (bottom)…'];
    let i = 0;
    setPhase(sequence[0]);
    const interval = setInterval(() => {
      i = (i + 1) % sequence.length;
      setPhase(sequence[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isActive]);

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const stepIsGrow = phase === 'Inhale…' || phase === 'Hold (top)…';
  const scaleValue = prefersReducedMotion ? 'scale(1)' : (stepIsGrow ? 'scale(1.3)' : 'scale(1)');

  return (
    <div className="max-w-xl mx-auto mt-10 text-center animate-in">
      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <h1 className="text-3xl font-black text-slate-800">Regulate</h1>
        <p className="text-slate-600 mt-2">Get grounded. Lower the noise.</p>

        <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-10">
          <div
            className="absolute inset-0 bg-indigo-100 rounded-full transition-all duration-[4000ms] ease-in-out"
            style={{ transform: scaleValue, opacity: isActive ? 0.8 : 0.3 }}
          />
          <div className="relative z-10 text-2xl font-bold text-indigo-900 tracking-wide">{phase}</div>
        </div>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm ${isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'}`}
        >
          {isActive ? 'Stop' : 'Begin 4-Second Cycle'}
        </button>

        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
          <div className="text-sm font-bold text-slate-800">After you breathe</div>
          <div className="text-slate-700 mt-1">What is one thing you can control today?</div>
        </div>
      </div>
    </div>
  );
}
