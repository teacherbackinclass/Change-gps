// Plan ID generation and theme utilities.

export function generatePlanId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function themeVariant(planId) {
  if (!planId) return 0;
  let hash = 0;
  for (let i = 0; i < planId.length; i++) {
    hash = (Math.imul(hash, 31) + planId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 6;
}

// Six subtle accent palettes — deterministic from planId hash.
const ACCENTS = [
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-600', ring: 'ring-indigo-300' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-600', ring: 'ring-violet-300' },
  { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   badge: 'bg-teal-600',   ring: 'ring-teal-300'   },
  { bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    badge: 'bg-sky-600',    ring: 'ring-sky-300'    },
  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-600',  ring: 'ring-amber-300'  },
  { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-600',   ring: 'ring-rose-300'   },
];

export function getPlanTheme(planId) {
  return ACCENTS[themeVariant(planId)];
}
