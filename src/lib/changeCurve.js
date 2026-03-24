export const STAGES = [
  { id: 'STATUS_QUO', label: 'Status Quo', verb: 'Prepare', range: [0.0, 0.25] },
  { id: 'DISRUPTION', label: 'Disruption', verb: 'Clarify', range: [0.25, 0.5] },
  { id: 'ADAPTATION', label: 'Adaptation', verb: 'Persist', range: [0.5, 0.75] },
  { id: 'INNOVATION', label: 'Innovation', verb: 'Explore', range: [0.75, 1.0] }
];

export function curveY(xN, top = 44, depth = 120) {
  const x = Math.max(0, Math.min(1, xN));
  const term = 1 - 4 * Math.pow(x - 0.5, 2);
  return top + depth * Math.max(0, term);
}
export function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export function positionFromDiagnosis(diagnosis) {
  if (!diagnosis) return 0.15; // Default to Status Quo
  // Maps 0-4 signal average to 0.0-1.0 curve position
  return clamp01(diagnosis.avg / 4);
}

export function formatStage(stageId) {
  const stage = STAGES.find(s => s.id === stageId);
  return stage ? stage.label : 'Unknown';
}
export function stageFromPosition(xN) {
  const x = clamp01(xN);
  // Find the stage where x falls within the range [min, max]
  const stage = STAGES.find(s => x >= s.range[0] && x <= s.range[1]);
  return stage || STAGES[0]; // Fallback to first stage if somehow out of bounds
}
