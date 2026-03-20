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