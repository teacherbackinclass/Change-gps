import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '../components/AppState';
import {
  STAGES,
  adoptionCurveY,
  buildCurvePath,
  clamp01,
  curveY,
  positionFromDiagnosis,
  stageFromPosition,
} from '../lib/changeCurve';

// ─── constants ────────────────────────────────────────────────────────────────

const W  = 800;
const H  = 280;
const TOP   = 50;
const DEPTH = 170;

const mainCurve   = (x) => curveY(x, TOP, DEPTH);
const bumpyCurve  = (x) => adoptionCurveY(x, TOP, DEPTH);
const truth2      = (x) => curveY(x, TOP + 20, DEPTH - 40);
const truth3      = (x) => curveY(x, TOP - 10, DEPTH - 60);

// ─── guidance table (stage × role) ───────────────────────────────────────────

const GUIDANCE = {
  STATUS_QUO: {
    INDIVIDUAL: {
      whatHelps:       'Understanding what\'s actually changing — and what isn\'t — before disruption hits.',
      recommendedMove: 'Name the change in one sentence and share it with one person.',
      supports:        ['Ask what "not changing" looks like', 'Find one ally who already knows the details'],
    },
    PEOPLE_LEADER: {
      whatHelps:       'Creating early awareness before disruption hits. Most leaders under-communicate early.',
      recommendedMove: 'Communicate what\'s changing, what\'s staying, and why now — in plain language.',
      supports:        ['Identify your early adopters now', 'Set a regular update cadence'],
    },
  },
  DISRUPTION: {
    INDIVIDUAL: {
      whatHelps:       'Naming the specific thing that feels hardest right now. Vague anxiety is harder to act on than a named problem.',
      recommendedMove: 'Write down your top friction point and who could address it.',
      supports:        ['Use the Friction Log tool', 'Ask for one clear expectation this week'],
    },
    PEOPLE_LEADER: {
      whatHelps:       'Reducing ambiguity and protecting your team\'s capacity to adapt.',
      recommendedMove: 'Run a 10-minute huddle with one clear weekly standard.',
      supports:        ['Remove one blocker visibly this week', 'Acknowledge the difficulty directly — don\'t minimize it'],
    },
  },
  ADAPTATION: {
    INDIVIDUAL: {
      whatHelps:       'Staying consistent in messy conditions. The dip feels permanent — it isn\'t.',
      recommendedMove: 'Pick one behavior to practice this week, even imperfectly.',
      supports:        ['Use the Next Step Builder tool', 'Find one peer to practice alongside'],
    },
    PEOPLE_LEADER: {
      whatHelps:       'Coaching on the actual behavior, not just setting expectations and waiting.',
      recommendedMove: 'Give specific behavioral feedback to one person this week.',
      supports:        ['Use the Stakeholder Map to prioritize coaching', 'Name what "good enough for now" looks like concretely'],
    },
  },
  ADOPTION: {
    INDIVIDUAL: {
      whatHelps:       'Reinforcing your own new habits before pressure makes you revert.',
      recommendedMove: 'Name one routine that anchors the new way for you personally.',
      supports:        ['Share what\'s working with a peer', 'Ask for recognition when you do it well'],
    },
    PEOPLE_LEADER: {
      whatHelps:       'Embedding the change before your team reverts under the next pressure.',
      recommendedMove: 'Celebrate a specific example of the new behavior publicly.',
      supports:        ['Use the Stakeholder Map to identify champions', 'Schedule a 30-day reinforcement check-in'],
    },
  },
  INNOVATION: {
    INDIVIDUAL: {
      whatHelps:       'Building on what\'s working and sharing it with others who are still in the dip.',
      recommendedMove: 'Document one improvement you\'ve made and offer to share it with your team.',
      supports:        ['Ask your leader what to tackle next', 'Pair with someone who\'s still in Disruption'],
    },
    PEOPLE_LEADER: {
      whatHelps:       'Scaling what works and developing the people who got here first into change champions.',
      recommendedMove: 'Identify one person ready to grow as a change champion.',
      supports:        ['Systematize the improvement so it\'s not personal to one person', 'Apply the approach to the next change early'],
    },
  },
};

function getGuidance(stageId, role) {
  return GUIDANCE[stageId]?.[role] || GUIDANCE.DISRUPTION.INDIVIDUAL;
}

// ─── SVG curve helper ─────────────────────────────────────────────────────────

const MAIN_PATH   = buildCurvePath(mainCurve, W, 140);
const BUMPY_PATH  = buildCurvePath(bumpyCurve, W, 140);
const TRUTH2_PATH = buildCurvePath(truth2, W, 140);
const TRUTH3_PATH = buildCurvePath(truth3, W, 140);

// ─── view modes ───────────────────────────────────────────────────────────────

const VIEW_MODES = [
  { id: 'NORMAL',   label: 'Normal',   desc: 'The classic change curve — disruption leads to adaptation.' },
  { id: 'ADOPTION', label: 'Adoption', desc: 'Change is non-linear. Ups and downs are normal on the way to adoption.' },
  { id: 'TRUTH',    label: 'Truth',    desc: 'Most people navigate multiple changes at once. Each has its own curve.' },
];

// ─── draggable marker ────────────────────────────────────────────────────────

function Marker({ xN, yVal, dragging }) {
  return (
    <g transform={`translate(${(xN * W).toFixed(1)}, ${yVal.toFixed(1)})`} role="presentation">
      {/* pulse ring */}
      <circle r="18" fill="#6366f1" opacity={dragging ? 0.25 : 0.15} className={dragging ? '' : 'animate-ping'} style={{ animationDuration: '2s' }} />
      <circle r="10" fill="#6366f1" stroke="white" strokeWidth="2.5" />
      {/* pin head */}
      <circle cx="0" cy="-26" r="8" fill="#6366f1" />
      <line x1="0" y1="-18" x2="0" y2="-10" stroke="#6366f1" strokeWidth="3" />
    </g>
  );
}

// ─── stage labels ─────────────────────────────────────────────────────────────

function StageLabels() {
  return (
    <>
      {STAGES.map(s => {
        const cx = ((s.range[0] + s.range[1]) / 2) * W;
        const y  = mainCurve((s.range[0] + s.range[1]) / 2);
        return (
          <g key={s.id}>
            <text x={cx} y={y - 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#94a3b8" fontFamily="system-ui">
              {s.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ChangeMapPage() {
  const { state, dispatch } = useAppState();
  const role                = state.role;
  const diagnosis           = state.currentDiagnosis;

  const [viewMode,  setViewMode]  = useState('NORMAL');
  const [position,  setPosition]  = useState(() => positionFromDiagnosis(diagnosis));
  const [dragging,  setDragging]  = useState(false);
  const [autoPlaced, setAutoPlaced] = useState(!!diagnosis);

  const svgRef  = useRef(null);
  const isDrag  = useRef(false);

  // Re-auto-place whenever diagnosis changes
  useEffect(() => {
    if (diagnosis) {
      setPosition(positionFromDiagnosis(diagnosis));
      setAutoPlaced(true);
    }
  }, [diagnosis]);

  // derive stage + guidance
  const stage    = useMemo(() => stageFromPosition(position), [position]);
  const guidance = useMemo(() => getGuidance(stage?.id, role), [stage?.id, role]);

  // ── drag logic ──────────────────────────────────────────────────────────────

  const svgXtoPosition = useCallback((clientX) => {
    if (!svgRef.current) return position;
    const rect = svgRef.current.getBoundingClientRect();
    return clamp01((clientX - rect.left) / rect.width);
  }, [position]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDrag.current = true;
    setDragging(true);
    setAutoPlaced(false);
    svgRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDrag.current) return;
    setPosition(svgXtoPosition(e.clientX));
  }, [svgXtoPosition]);

  const handlePointerUp = useCallback(() => {
    isDrag.current = false;
    setDragging(false);
  }, []);

  // click on the SVG background to reposition
  const handleSvgClick = (e) => {
    if (isDrag.current) return;
    setPosition(svgXtoPosition(e.clientX));
    setAutoPlaced(false);
  };

  // keyboard arrow support on the marker
  const handleMarkerKey = (e) => {
    if (e.key === 'ArrowLeft')  { setPosition(p => clamp01(p - 0.05)); setAutoPlaced(false); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPosition(p => clamp01(p + 0.05)); setAutoPlaced(false); e.preventDefault(); }
  };

  // active y
  const activeY = useMemo(() => {
    if (viewMode === 'ADOPTION') return bumpyCurve(position);
    return mainCurve(position);
  }, [position, viewMode]);

  // add to plan
  const handleAddToPlan = () => {
    dispatch({
      type: 'SAVE_PLAN_ITEM',
      payload: {
        key: `MAP_POSITION_${Date.now()}`,
        value: {
          id:        `MAP_POSITION_${Date.now()}`,
          title:     `Change Map: ${stage?.label || 'Unknown stage'}`,
          why:       guidance.whatHelps,
          steps:     [guidance.recommendedMove, ...(guidance.supports || [])],
          source:    'MAP',
          createdAt: new Date().toISOString(),
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in">
      {/* header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Change Map</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {autoPlaced && diagnosis
                ? 'Marker placed from your Diagnose results. Drag to adjust.'
                : 'Click or drag the curve to mark where you are.'}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            role === 'PEOPLE_LEADER'
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-teal-50 text-teal-700'
          }`}>
            {role === 'PEOPLE_LEADER' ? 'People Leader' : 'Individual'}
          </div>
        </div>

        {/* view mode tabs */}
        <div className="mt-4 flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {VIEW_MODES.map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              aria-pressed={viewMode === v.id}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                viewMode === v.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* view description */}
        <p className="mt-2 text-xs text-slate-400">
          {VIEW_MODES.find(v => v.id === viewMode)?.desc}
        </p>
      </div>

      {/* map */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto cursor-crosshair select-none touch-none"
          onClick={handleSvgClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          aria-label="Change curve. Use arrow keys to move the marker."
          role="img"
        >
          {/* ── Normal view ── */}
          {viewMode === 'NORMAL' && (
            <>
              <path d={MAIN_PATH} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
              <path d={MAIN_PATH} fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="8 8" opacity="0.6" />
              <StageLabels />
            </>
          )}

          {/* ── Adoption view ── */}
          {viewMode === 'ADOPTION' && (
            <>
              <path d={BUMPY_PATH} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
              <path d={BUMPY_PATH} fill="none" stroke="#7c3aed" strokeWidth="3" opacity="0.7" />
              <StageLabels />
            </>
          )}

          {/* ── Truth view ── */}
          {viewMode === 'TRUTH' && (
            <>
              <path d={MAIN_PATH}  fill="none" stroke="#6366f1" strokeWidth="3" opacity="0.9" />
              <path d={TRUTH2_PATH} fill="none" stroke="#0ea5e9" strokeWidth="2.5" opacity="0.6" strokeDasharray="6 4" />
              <path d={TRUTH3_PATH} fill="none" stroke="#10b981" strokeWidth="2.5" opacity="0.5" strokeDasharray="3 5" />
              <StageLabels />
              {/* legend */}
              <g transform="translate(620, 20)">
                <rect x="0" y="0" width="160" height="68" rx="8" fill="white" opacity="0.92" />
                <circle cx="12" cy="14" r="4" fill="#6366f1" />
                <text x="22" y="18" fontSize="9" fill="#475467" fontFamily="system-ui">Primary change</text>
                <circle cx="12" cy="34" r="4" fill="#0ea5e9" opacity="0.7" />
                <text x="22" y="38" fontSize="9" fill="#475467" fontFamily="system-ui">Side effect or dependency</text>
                <circle cx="12" cy="54" r="4" fill="#10b981" opacity="0.6" />
                <text x="22" y="58" fontSize="9" fill="#475467" fontFamily="system-ui">New opportunity emerging</text>
              </g>
            </>
          )}

          {/* ── draggable marker ── */}
          {viewMode !== 'TRUTH' && (
            <g
              onPointerDown={handlePointerDown}
              onKeyDown={handleMarkerKey}
              tabIndex={0}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(position * 100)}
              aria-label={`Position: ${stage?.label || 'Unknown'}. Use arrow keys to move.`}
              style={{ cursor: dragging ? 'grabbing' : 'grab', outline: 'none' }}
            >
              <Marker xN={position} yVal={activeY} dragging={dragging} />
            </g>
          )}
        </svg>
      </div>

      {/* guidance panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Stage</div>
          <div className="text-xl font-bold text-slate-900">{stage?.label}</div>
          <div className="text-sm text-indigo-600 font-semibold mt-0.5">{stage?.verb}</div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">What helps most right now</div>
            <p className="text-slate-800 text-sm leading-relaxed">{guidance.whatHelps}</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Recommended move</div>
            <p className="text-slate-900 font-medium text-sm">{guidance.recommendedMove}</p>
          </div>
          {guidance.supports?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Supports</div>
              <ul className="space-y-1">
                {guidance.supports.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-slate-300">–</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* add to plan */}
      <div className="flex justify-end">
        <button
          onClick={handleAddToPlan}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" /> Save to Plan
        </button>
      </div>
    </div>
  );
}
