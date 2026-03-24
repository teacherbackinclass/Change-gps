import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, MoveRight, Plus, SlidersHorizontal } from 'lucide-react';
import RoleMirrorHeader from '../components/RoleMirrorHeader';
import { STAGES, clamp01, curveY, formatStage, positionFromDiagnosis, stageFromPosition } from '../lib/changeCurve';

const CURVE_MODES = [
  { id: 'SIMPLE', label: 'Simple' },
  { id: 'REAL_LIFE', label: 'Real Life' },
  { id: 'ADOPTION_LOOP', label: 'Adoption Loop' }
];

const REAL_LIFE_FEELS = [
  { id: 'SMOOTH', label: 'Smooth' },
  { id: 'BUMPY', label: 'Bumpy' },
  { id: 'STALLED', label: 'Stalled' }
];

const PERSIST_SUPPORT_MOVE = {
  id: 'MOVE_PERSIST_SUPPORT',
  title: 'Persist Support: Weekly Micro-Rhythm',
  why: 'Persistence is what turns change into a new standard. A small weekly rhythm prevents drift and reduces fatigue.',
  steps: [
    'Pick one 10-minute slot each week (same day/time).',
    'Ask: What worked? What is still hard? What do we try next?',
    'Capture one micro-adjustment and repeat for 7 days.'
  ]
};

function buildPath({ w, h, padX = 24, top = 44, depth = 120 }) {
  // Build an SVG path for the inverted bell curve (dip).
  const leftX = padX;
  const rightX = w - padX;
  const midX = w / 2;

  const yLeft = top;
  const yMid = top + depth;
  const yRight = top;

  // Quadratic Bezier from left -> mid, then mid -> right.
  const c1x = w * 0.25;
  const c2x = w * 0.75;

  return `M ${leftX} ${yLeft} Q ${c1x} ${yMid} ${midX} ${yMid} Q ${c2x} ${yMid} ${rightX} ${yRight}`;
}

function xyFromT(t, w, h, padX = 24, top = 44, depth = 120) {
  const x = padX + (w - 2 * padX) * clamp01(t);
  const xN = clamp01(t);
  const y = curveY(xN, top, depth);
  return { x, y, xN };
}

export default function ChangeMapPage({ state, dispatch }) {
  const svgRef = useRef(null);
  const [curveMode, setCurveMode] = useState('SIMPLE');
  const [realLifeFeel, setRealLifeFeel] = useState('SMOOTH');

  const initialT = useMemo(() => {
    const avg = state?.diagnosis?.avg;
    if (typeof avg === 'number') return positionFromDiagnosis(avg, 4);
    return 0.35;
  }, [state?.diagnosis?.avg]);

  const [t, setT] = useState(initialT);

  useEffect(() => {
    setT(initialT);
  }, [initialT]);

  const stage = useMemo(() => stageFromPosition(t), [t]);

  const dims = { w: 680, h: 220, padX: 24, top: 44, depth: 120 };
  const pathD = useMemo(() => buildPath(dims), [dims.w, dims.h]);
  const pos = useMemo(() => xyFromT(t, dims.w, dims.h, dims.padX, dims.top, dims.depth), [t]);

  const onPointer = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const tRaw = (x - dims.padX) / (dims.w - 2 * dims.padX);
    setT(clamp01(tRaw));
  };

  const onAddSupport = () => {
    dispatch({ type: 'ADD_TO_PLAN', payload: PERSIST_SUPPORT_MOVE });
  };

  useEffect(() => {
    // Adoption Loop: clicking segments should auto-add Persist support (per notes)
    if (curveMode === 'ADOPTION_LOOP' && stage?.id === 'ADAPTATION') {
      dispatch({ type: 'ADD_TO_PLAN', payload: PERSIST_SUPPORT_MOVE });
    }
  }, [curveMode, stage?.id]);

  const guidance = useMemo(() => {
    const base = stage?.description || 'Pick where you are on the curve.';
    if (curveMode === 'REAL_LIFE') {
      if (realLifeFeel === 'BUMPY') return `${base} Because it feels bumpy, focus on smaller wins and shorter feedback loops.`;
      if (realLifeFeel === 'STALLED') return `${base} Because it feels stalled, reduce scope and remove one blocker before pushing harder.`;
      return `${base} Because it feels smooth, protect the rhythm and communicate wins early.`;
    }
    if (curveMode === 'ADOPTION_LOOP') {
      return `${base} In Adoption Loop mode, the goal is behavior: pick one action that increases adoption this week.`;
    }
    return base;
  }, [stage?.description, curveMode, realLifeFeel]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <RoleMirrorHeader
        role={state.role}
        title="Change Map"
        subtitle="Find where you are on the curve. Drag the marker, or click a segment."
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/80 border border-slate-200 rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4" />
              <span>You are here: <span className="text-slate-900">{formatStage(stage)}</span></span>
            </div>
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Curve mode</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CURVE_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setCurveMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-colors ${curveMode === m.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {curveMode === 'REAL_LIFE' && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">How it feels</p>
            <div className="flex flex-wrap gap-2">
              {REAL_LIFE_FEELS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setRealLifeFeel(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-colors ${realLifeFeel === f.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr,320px] gap-6 items-start">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              {STAGES.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    const mid = (s.range[0] + s.range[1]) / 2;
                    setT(mid);
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors ${stage?.id === s.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}
                >
                  {s.label} <span className="opacity-60">({s.verb})</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${dims.w} ${dims.h}`}
                className="w-full h-auto"
                onPointerDown={onPointer}
                onPointerMove={(e) => {
                  if (e.buttons === 1) onPointer(e);
                }}
                style={{ touchAction: 'none' }}
              >
                <path d={pathD} fill="none" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round" />
                <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" opacity="0.9" />

                {/* Marker */}
                <g>
                  <circle cx={pos.x} cy={pos.y} r="12" fill="#111827" opacity="0.12" />
                  <circle cx={pos.x} cy={pos.y} r="9" fill="#4F46E5" />
                  <circle cx={pos.x} cy={pos.y} r="4" fill="#FFFFFF" />
                </g>

                {/* Small label bubble */}
                <g transform={`translate(${pos.x - 55}, ${pos.y - 40})`}>
                  <rect width="110" height="26" rx="13" fill="#111827" opacity="0.85" />
                  <text x="55" y="17" textAnchor="middle" fontSize="11" fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui">You are here</text>
                </g>
              </svg>

              <p className="mt-3 text-xs text-slate-500">
                Tip: drag the marker left/right, or click a segment label.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guidance</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{guidance}</p>
              {curveMode === 'ADOPTION_LOOP' && (
                <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                  <p className="text-sm font-bold text-indigo-900">Auto-support</p>
                  <p className="text-xs text-indigo-800 mt-1">In Adoption Loop mode, selecting <span className="font-bold">Adaptation (Persist)</span> adds a Persist support to your Plan.</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage action</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{formatStage(stage)}</p>
              <p className="mt-1 text-sm text-slate-600">Add a persistence support move to your Plan (works well for most stages, especially Adaptation).</p>
              <button
                onClick={onAddSupport}
                className="mt-4 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Persist Support
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Diagnose</p>
              {state?.diagnosis ? (
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  <p><span className="font-bold">Barrier:</span> {state.diagnosis.barrier}</p>
                  <p><span className="font-bold">Signal avg:</span> {Math.round(state.diagnosis.avg * 10) / 10} / 4</p>
                  <p className="text-xs text-slate-500">This is used to auto-place the marker (you can override it by dragging).</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Run Diagnose first to auto-place the marker.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Next step</p>
            <p className="text-sm text-slate-600">Use the map to pick your next best move, then add tools/scripts that match your stage.</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', payload: '/tools' })}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2"
          >
            Tools & Scripts <MoveRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
