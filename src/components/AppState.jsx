import React, { createContext, useContext, useReducer } from 'react';

export const AppStateContext = createContext(null);

const initialState = {
  role: 'PEOPLE_LEADER',
  hasProfile: false,
  profileData: { name: '', department: '' },
  currentDiagnosis: null,
  savedPlan: {},
  signals: { clarity: 0, confidence: 0, barrier_tag: 'AWARENESS', action_completed: false }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'SET_PROFILE_ENABLED':
      return { ...state, hasProfile: !!action.payload };
    case 'SAVE_DIAGNOSIS':
      return { ...state, currentDiagnosis: action.payload, signals: action.payload?.input_echo?.signals || state.signals };
    case 'SAVE_PLAN_ITEM': {
      const { key, value } = action.payload;
      return { ...state, savedPlan: { ...state.savedPlan, [key]: value } };
    }
    case 'RESET_PLAN':
      return { ...state, savedPlan: {} };
    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
