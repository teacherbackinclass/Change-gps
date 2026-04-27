import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { generatePlanId } from '../lib/planUtils';

export const AppStateContext = createContext(null);

const STORAGE_KEY = 'change_gps_profile_v2';
const PERSIST_KEYS = ['role','hasProfile','profileData','currentDiagnosis','savedPlan','signals','planId','diagnoseHistory'];

const osReduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createBase() {
  return {
    role:             'PEOPLE_LEADER',
    hasProfile:       false,
    profileData:      { name: '', department: '' },
    currentDiagnosis: null,
    savedPlan:        {},
    signals:          { clarity: 0, confidence: 0, barrier_tag: 'AWARENESS', action_completed: false },
    planId:           generatePlanId(),
    reduceMotion:     osReduceMotion,
    diagnoseHistory:  [],
  };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  try {
    const sub = {};
    for (const k of PERSIST_KEYS) sub[k] = state[k];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
  } catch { /* ignore */ }
}

function reducer(state, action) {
  switch (action.type) {

    case 'SET_ROLE':
      return { ...state, role: action.payload };

    case 'SET_PROFILE_ENABLED': {
      const on = !!action.payload;
      if (!on) {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        return { ...createBase(), hasProfile: false };
      }
      return { ...state, hasProfile: true };
    }

    case 'SAVE_DIAGNOSIS': {
      const diag    = action.payload;
      const signals = diag?.input_echo?.signals || state.signals;
      const entry   = { ...diag, savedAt: new Date().toISOString() };
      return {
        ...state,
        currentDiagnosis: diag,
        signals,
        diagnoseHistory: [...(state.diagnoseHistory || []).slice(-9), entry],
      };
    }

    case 'SAVE_PLAN_ITEM': {
      const { key, value } = action.payload;
      return { ...state, savedPlan: { ...state.savedPlan, [key]: value } };
    }

    case 'REMOVE_PLAN_ITEM': {
      const next = { ...state.savedPlan };
      delete next[action.payload];
      return { ...state, savedPlan: next };
    }

    case 'RESET_PLAN':
      return { ...state, savedPlan: {}, planId: generatePlanId() };

    case 'SET_REDUCE_MOTION':
      return { ...state, reduceMotion: !!action.payload };

    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const stored  = loadFromStorage();
  const base    = createBase();
  const initial = stored
    ? { ...base, ...stored, reduceMotion: osReduceMotion }
    : base;

  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (state.hasProfile) saveToStorage(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
