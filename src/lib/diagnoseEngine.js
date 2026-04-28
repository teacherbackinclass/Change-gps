// Full deterministic scoring engine — mirrors 01_diagnose_module_config.json exactly.

// ─── helpers ────────────────────────────────────────────────────────────────

function dimMean(responses, itemIds) {
  const answered = itemIds.filter(id => responses[id] != null);
  if (answered.length === 0) return null;
  return answered.reduce((s, id) => s + responses[id], 0) / answered.length;
}

// ─── ADKAR_BARRIER ──────────────────────────────────────────────────────────

const ADKAR_DIMS = {
  AWARENESS:     ['ADKAR_A1',  'ADKAR_A2'],
  DESIRE:        ['ADKAR_D1',  'ADKAR_D2'],
  KNOWLEDGE:     ['ADKAR_K1',  'ADKAR_K2'],
  ABILITY:       ['ADKAR_AB1', 'ADKAR_AB2'],
  REINFORCEMENT: ['ADKAR_R1',  'ADKAR_R2'],
};
const ADKAR_TIE_BREAK = ['AWARENESS', 'DESIRE', 'KNOWLEDGE', 'ABILITY', 'REINFORCEMENT'];

export function scoreADKAR(responses) {
  const means = {};
  for (const [dim, ids] of Object.entries(ADKAR_DIMS)) {
    means[dim] = dimMean(responses, ids);
  }

  let lowestDim = null;
  let lowestMean = Infinity;
  for (const dim of ADKAR_TIE_BREAK) {
    if (means[dim] != null && means[dim] < lowestMean) {
      lowestMean = means[dim];
      lowestDim = dim;
    }
  }

  const nonNull = Object.values(means).filter(m => m != null);
  const allAbove2 = nonNull.length > 0 && nonNull.every(m => m > 2.0);

  return {
    adkar_barrier:         allAbove2 ? 'UNKNOWN' : (lowestDim || 'UNKNOWN'),
    barrier_tag:           lowestDim || 'AWARENESS', // fallback_if_unknown: lowest_dimension_anyway
    ability_mean_0_4:      means.ABILITY,
    reinforcement_mean_0_4: means.REINFORCEMENT,
    _dimension_means:      means,
  };
}

// ─── CHANGE_LOAD ─────────────────────────────────────────────────────────────

const LOAD_ITEMS = [
  { id: 'LOAD_L1', reverse: false },
  { id: 'LOAD_L2', reverse: false },
  { id: 'LOAD_L3', reverse: true  },
  { id: 'LOAD_L4', reverse: false },
  { id: 'LOAD_L5', reverse: true  },
  { id: 'LOAD_L6', reverse: true  },
];

export function scoreChangeLoad(responses) {
  const answered = LOAD_ITEMS.filter(item => responses[item.id] != null);
  if (answered.length === 0) return { load_score_0_4: 0, route_hint: 'NORMAL' };

  const sum = answered.reduce((acc, item) => {
    const raw = responses[item.id];
    return acc + (item.reverse ? (4 - raw) : raw);
  }, 0);
  const mean = sum / answered.length;

  let route_hint = 'NORMAL';
  if (mean >= 3.0)      route_hint = 'REGULATE_FIRST';
  else if (mean >= 2.0) route_hint = 'MICRO_MOVE_ONLY';

  return { load_score_0_4: mean, route_hint };
}

// ─── GOVERNANCE_CLARITY ──────────────────────────────────────────────────────

const GOV_ITEMS = ['GOV_G1', 'GOV_G2', 'GOV_G3', 'GOV_G4', 'GOV_G5', 'GOV_G6'];

export function scoreGovernanceClarity(responses) {
  const answered = GOV_ITEMS.filter(id => responses[id] != null);
  if (answered.length === 0) {
    return { gov_clarity_mean_0_4: 0, signals_clarity_0_5: 0, gov_clarity_band: 'SEVERE_UNCERTAINTY' };
  }

  const mean = answered.reduce((s, id) => s + responses[id], 0) / answered.length;
  const clarity = Math.max(0, Math.min(5, Math.round((mean / 4) * 5)));

  let gov_clarity_band = 'CLEAR_ENOUGH';
  if (mean <= 1.5)      gov_clarity_band = 'SEVERE_UNCERTAINTY';
  else if (mean <= 2.5) gov_clarity_band = 'SOME_UNCERTAINTY';

  return { gov_clarity_mean_0_4: mean, signals_clarity_0_5: clarity, gov_clarity_band };
}

// ─── ZONES_OF_CHANGE ─────────────────────────────────────────────────────────

const ZONE_STATIC = { ZONE_Z1: 'STATUS_QUO', ZONE_Z2: 'DISRUPTION', ZONE_Z4: 'INNOVATION' };

export function scoreZones(responses, ability_mean, reinforcement_mean) {
  const items = ['ZONE_Z1', 'ZONE_Z2', 'ZONE_Z3', 'ZONE_Z4'];
  const answered = items.filter(id => responses[id] != null);
  if (answered.length === 0) return { zones_of_change: 'UNKNOWN', zone_confidence_0_1: 0 };

  let maxId = null, maxScore = -1, secondScore = -1;
  for (const id of items) {
    if (responses[id] == null) continue;
    const v = responses[id];
    if (v > maxScore)        { secondScore = maxScore; maxScore = v; maxId = id; }
    else if (v > secondScore) { secondScore = v; }
  }

  const zone_confidence_0_1 = (maxScore - Math.max(0, secondScore)) / 4;
  if (zone_confidence_0_1 < 0.15) return { zones_of_change: 'UNKNOWN', zone_confidence_0_1 };

  let zone;
  if (ZONE_STATIC[maxId]) {
    zone = ZONE_STATIC[maxId];
  } else if (maxId === 'ZONE_Z3') {
    const abilityOk       = ability_mean != null       && ability_mean >= 2.5;
    const reinforceOk     = reinforcement_mean != null && reinforcement_mean >= 2.0;
    zone = (abilityOk && reinforceOk) ? 'ADOPTION' : 'ADAPTATION';
  } else {
    zone = 'UNKNOWN';
  }

  return { zones_of_change: zone, zone_confidence_0_1 };
}

// ─── BRIDGES_PHASE ───────────────────────────────────────────────────────────

const BRIDGES_DIMS = {
  ENDINGS:       ['BRIDGES_E1',  'BRIDGES_E2'],
  NEUTRAL_ZONE:  ['BRIDGES_NZ1', 'BRIDGES_NZ2'],
  NEW_BEGINNING: ['BRIDGES_NB1', 'BRIDGES_NB2'],
};
const BRIDGES_TIE_BREAK = ['NEUTRAL_ZONE', 'ENDINGS', 'NEW_BEGINNING'];

export function scoreBridges(responses) {
  const means = {};
  for (const [dim, ids] of Object.entries(BRIDGES_DIMS)) {
    means[dim] = dimMean(responses, ids);
  }

  let highestDim = null, highestMean = -1, secondMean = -1;
  for (const dim of BRIDGES_TIE_BREAK) {
    if (means[dim] != null) {
      if (means[dim] > highestMean)       { secondMean = highestMean; highestMean = means[dim]; highestDim = dim; }
      else if (means[dim] > secondMean)   { secondMean = means[dim]; }
    }
  }

  const confidence = highestMean >= 0 ? (highestMean - Math.max(0, secondMean)) / 4 : 0;
  const bridges_phase = (confidence < 0.15 || !highestDim) ? 'UNKNOWN' : highestDim;

  return { bridges_phase, bridges_confidence_0_1: confidence };
}

// ─── PERSONA_CLASSIFIER (optional) ───────────────────────────────────────────

const PERSONA_ITEMS    = ['PERS_P1','PERS_P2','PERS_P3','PERS_P4','PERS_P5','PERS_P6','PERS_P7','PERS_P8'];
const PERSONA_TIE_BREAK = [2, 3, 1, 4];
const PERSONA_MAP = { 1:'MOVER_EARLY_ADAPTER', 2:'WAITER_PROOF_SEEKER', 3:'CONTROLLER_RISK_SENTINEL', 4:'WITHDRAWN_CHECKED_OUT' };

export function scorePersona(responses) {
  const freq = { 1:0, 2:0, 3:0, 4:0 };
  let hasAny = false;
  for (const id of PERSONA_ITEMS) {
    if (responses[id] != null) { freq[responses[id]] = (freq[responses[id]] || 0) + 1; hasAny = true; }
  }
  if (!hasAny) return { persona_label: null };

  let modeVal = null, modeCount = -1;
  for (const val of PERSONA_TIE_BREAK) {
    if ((freq[val] || 0) > modeCount) { modeCount = freq[val] || 0; modeVal = val; }
  }

  return { persona_label: PERSONA_MAP[modeVal] || null };
}

// ─── POINT_OF_DECISION (optional) ────────────────────────────────────────────

const POD_ITEMS = ['POD_P1', 'POD_P2', 'POD_P3'];

export function scorePOD(responses, load_score_0_4) {
  const answered = POD_ITEMS.filter(id => responses[id] != null);
  if (answered.length === 0) return { pod_mean_0_4: null, pod_route_override: null };

  const mean = answered.reduce((s, id) => s + responses[id], 0) / answered.length;
  const pod_route_override = (mean < 2.0 && load_score_0_4 >= 2.5) ? 'REGULATE_FIRST' : null;

  return { pod_mean_0_4: mean, pod_route_override };
}

// ─── aggregation helpers ─────────────────────────────────────────────────────

export function computeConfidence(ability_mean_0_4, pod_mean_0_4) {
  const a = ability_mean_0_4 ?? 2.0;
  const p = pod_mean_0_4 ?? 2.0;
  return Math.max(0, Math.min(5, Math.round(((0.7 * a + 0.3 * p) / 4) * 5)));
}

// ─── main entry point ────────────────────────────────────────────────────────

export function scoreDiagnose(moduleResponses, role, mode = 'FULL') {
  const {
    ADKAR_BARRIER:       adkarRes    = {},
    CHANGE_LOAD:         loadRes     = {},
    GOVERNANCE_CLARITY:  govRes      = {},
    ZONES_OF_CHANGE:     zonesRes    = {},
    BRIDGES_PHASE:       bridgesRes  = {},
    PERSONA_CLASSIFIER:  personaRes  = {},
    POINT_OF_DECISION:   podRes      = {},
  } = moduleResponses;

  const adkar   = scoreADKAR(adkarRes);
  const load    = scoreChangeLoad(loadRes);
  const gov     = scoreGovernanceClarity(govRes);
  const zones   = scoreZones(zonesRes, adkar.ability_mean_0_4, adkar.reinforcement_mean_0_4);
  const bridges = scoreBridges(bridgesRes);
  const persona = scorePersona(personaRes);
  const pod     = scorePOD(podRes, load.load_score_0_4);

  const confidence      = computeConfidence(adkar.ability_mean_0_4, pod.pod_mean_0_4);
  const final_route_hint = pod.pod_route_override || load.route_hint || 'NORMAL';

  let confidence_note = 'Signals are directional, not absolute.';
  if (!zones.zone_confidence_0_1 || zones.zone_confidence_0_1 < 0.15) {
    confidence_note = 'Low confidence: tied or near-tied signals.';
  }

  return {
    input_echo: {
      role,
      signals: {
        clarity:          gov.signals_clarity_0_5,
        confidence,
        barrier_tag:      adkar.barrier_tag,
        action_completed: false,
      },
    },
    coach: {
      where_you_likely_are: {
        adkar_barrier:    adkar.adkar_barrier,
        bridges_phase:    bridges.bridges_phase,
        zones_of_change:  zones.zones_of_change,
        confidence_note,
      },
    },
    _internal: {
      ability_mean_0_4:      adkar.ability_mean_0_4,
      reinforcement_mean_0_4: adkar.reinforcement_mean_0_4,
      load_score_0_4:        load.load_score_0_4,
      route_hint:            load.route_hint,
      gov_clarity_mean_0_4:  gov.gov_clarity_mean_0_4,
      gov_clarity_band:      gov.gov_clarity_band,
      zone_confidence_0_1:   zones.zone_confidence_0_1,
      bridges_confidence_0_1: bridges.bridges_confidence_0_1,
      pod_mean_0_4:          pod.pod_mean_0_4,
      pod_route_override:    pod.pod_route_override,
      persona_label:         persona.persona_label,
      valence:               null,
      final_route_hint,
      mode,
    },
  };
}
