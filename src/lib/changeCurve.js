// Change curve geometry — 5-stage model with Disruption valley.

export const STAGES = [
  { id: 'STATUS_QUO', label: 'Status Quo',  verb: 'Prepare',   range: [0.0, 0.2] },
  { id: 'DISRUPTION', label: 'Disruption',  verb: 'Clarify',   range: [0.2, 0.4] },
  { id: 'ADAPTATION', label: 'Adaptation',  verb: 'Persist',   range: [0.4, 0.6] },
  { id: 'ADOPTION',   label: 'Adoption',    verb: 'Reinforce', range: [0.6, 0.8] },
  { id: 'INNOVATION', label: 'Innovation',  verb: 'Explore',   range: [0.8, 1.0] },
];

// Map zones_of_change enum → canonical x position on the 0–1 curve.
const ZONE_X = {
  STATUS_QUO: 0.10,
  DISRUPTION: 0.30,
  ADAPTATION: 0.50,
  ADOPTION:   0.70,
  INNOVATION: 0.90,
  UNKNOWN:    0.15,
};

export function positionFromZone(zone) {
  return ZONE_X[zone] ?? 0.15;
}

// y(x) in SVG coords — dips to bottom at x=0.5.
// top  = y at the shoulders (x=0 and x=1)
// depth = how far down the curve dips at x=0.5
export function curveY(xN, top = 60, depth = 160) {
  const x = Math.max(0, Math.min(1, xN));
  const term = 1 - 4 * Math.pow(x - 0.5, 2);
  return top + depth * Math.max(0, term);
}

export function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

// Build an SVG "L" path by sampling the curve at N+1 points.
export function buildCurvePath(fn, W = 800, steps = 120) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    pts.push(`${(x * W).toFixed(1)},${fn(x).toFixed(1)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(' ')}`;
}

// Bumpy adoption curve: normal dip plus attenuated sinusoidal noise.
export function adoptionCurveY(xN, top = 60, depth = 160) {
  const base = curveY(xN, top, depth);
  const bump = 18 * Math.sin(xN * Math.PI * 5) * Math.sin(xN * Math.PI);
  return base + bump;
}

export function stageFromPosition(xN) {
  const x = clamp01(xN);
  return STAGES.find(s => x >= s.range[0] && x < s.range[1]) || STAGES[STAGES.length - 1];
}

export function positionFromDiagnosis(diagnosis) {
  const zone = diagnosis?.coach?.where_you_likely_are?.zones_of_change;
  if (zone) return positionFromZone(zone);
  return 0.15;
}

export function formatStage(stageOrId) {
  if (typeof stageOrId === 'string') {
    return STAGES.find(s => s.id === stageOrId)?.label ?? stageOrId;
  }
  return stageOrId?.label ?? '';
}
