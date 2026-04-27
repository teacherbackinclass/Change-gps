import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowRight, Clipboard, Map, MapPin, Repeat2, Sparkles, Waves, Wrench,
} from 'lucide-react';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from './AppState';

import DiagnosePage      from '../pages/DiagnosePage';
import DoNextPage        from '../pages/DoNextPage';
import ToolsListPage     from '../pages/ToolsListPage';
import ToolDetailPage    from '../pages/ToolDetailPage';
import ChangeMapPage     from '../pages/ChangeMapPage';
import RegulatePage      from '../pages/RegulatePage';
import SimulatorPage     from '../pages/SimulatorPage';
import CoachPage         from '../pages/CoachPage';
import CoachTopicPage    from '../pages/CoachTopicPage';
import PlanPage          from '../pages/PlanPage';

// ─── icon registry ───────────────────────────────────────────────────────────
const ICON_MAP = {
  'map-pin':   MapPin,
  'map':       Map,
  'arrow-right': ArrowRight,
  'tool':      Wrench,
  'wave':      Waves,
  'repeat':    Repeat2,
  'sparkle':   Sparkles,
  'clipboard': Clipboard,
};
function NavIcon({ id, className }) {
  const Comp = ICON_MAP[id];
  return Comp ? <Comp className={className} aria-hidden="true" /> : null;
}

// ─── ambient background ──────────────────────────────────────────────────────
const ROUTE_MODE = {
  '/regulate': 'Reflection',
  '/diagnose': 'Focus',
  '/do-next':  'Focus',
  '/map':      'Focus',
  '/plan':     'Focus',
  '/simulator':'Default',
  '/tools':    'Default',
  '/coach':    'Default',
};

function AmbientBackground({ reduceMotion }) {
  const location = useLocation();
  const [mode, setMode]         = useState('Default');
  const [rendered, setRendered] = useState('Default');
  const timerRef = useRef(null);

  useEffect(() => {
    const next = ROUTE_MODE[location.pathname] ||
      (location.pathname.startsWith('/tools/')  ? 'Default' :
       location.pathname.startsWith('/coach/')  ? 'Default' : 'Default');

    // hysteresis — don't flicker on fast navigation
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMode(next);
      setRendered(next);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  const base =
    rendered === 'Reflection'
      ? 'from-violet-100 via-indigo-50 to-slate-100'
      : rendered === 'Focus'
      ? 'from-indigo-50 via-slate-50 to-sky-50'
      : 'from-slate-100 via-indigo-50/40 to-slate-100';

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 transition-all duration-700">
      <div className={`absolute inset-0 bg-gradient-to-br ${base}`} />
      {!reduceMotion && (
        <>
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply transition-opacity duration-700" />
          <div className="absolute top-32 -right-32 w-[520px] h-[520px] bg-violet-200/25 rounded-full blur-3xl mix-blend-multiply" />
          <div className="absolute bottom-[-160px] left-1/3 w-[620px] h-[620px] bg-sky-200/20 rounded-full blur-3xl mix-blend-multiply" />
        </>
      )}
    </div>
  );
}

// ─── inner shell (needs Router context) ─────────────────────────────────────
function InnerShell() {
  const { config, reload, loading } = useConfig();
  const { state, dispatch }         = useAppState();

  const navItems    = config.ui?.global_layout?.navigation?.items || [];
  const roleOptions = config.ui?.global_layout?.top_bar?.role_toggle?.options || [];

  // aria-live announcement for screen readers on role change
  const [announcement, setAnnouncement] = useState('');
  const mainRef = useRef(null);

  const handleRoleToggle = useCallback((value) => {
    if (value === state.role) return;
    dispatch({ type: 'SET_ROLE', payload: value });
    const label = roleOptions.find(o => o.value === value)?.label || value;
    setAnnouncement(`Showing ${label} view for the same page.`);
    // preserve scroll position — do nothing (router keeps position by default in same route)
  }, [state.role, dispatch, roleOptions]);

  const roleMemo = useMemo(() => state.role, [state.role]);

  return (
    <div className="min-h-screen font-sans text-slate-900 flex flex-col relative overflow-hidden bg-slate-50">
      <AmbientBackground reduceMotion={state.reduceMotion} />

      {/* screen-reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-3">
          <div className="font-black text-xl tracking-tight text-slate-900 shrink-0">Change GPS</div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* role toggle */}
            <div
              role="group"
              aria-label="View as role"
              className="flex bg-slate-100 p-1 rounded-lg border border-slate-200"
            >
              {roleOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleRoleToggle(opt.value)}
                  aria-pressed={roleMemo === opt.value}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    roleMemo === opt.value
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* reduce motion toggle */}
            <button
              onClick={() => dispatch({ type: 'SET_REDUCE_MOTION', payload: !state.reduceMotion })}
              title={state.reduceMotion ? 'Motion off' : 'Motion on'}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-pressed={state.reduceMotion}
            >
              {state.reduceMotion ? 'Motion off' : 'Motion on'}
            </button>

            {/* reload config */}
            <button
              onClick={reload}
              className="px-3 py-1.5 text-sm font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Reload configuration"
            >
              {loading ? 'Reloading…' : 'Reload config'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── LEFT NAV ────────────────────────────────────────────────────── */}
        <nav aria-label="Main navigation" className="w-56 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col">
          <div className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
            <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2 mt-2 px-2">Navigate</div>
            {navItems.map(item => (
              <NavLink
                key={item.id}
                to={item.route}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <NavIcon id={item.icon} className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="mt-auto mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-sm font-semibold text-slate-800">Profile Mode</span>
                <input
                  type="checkbox"
                  checked={state.hasProfile}
                  onChange={(e) => dispatch({ type: 'SET_PROFILE_ENABLED', payload: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  aria-describedby="profile-desc"
                />
              </label>
              <p id="profile-desc" className="text-xs text-slate-500 leading-relaxed mt-1">
                Stateless by default. Turn on to save locally.
              </p>
            </div>
          </div>
        </nav>

        {/* ── MAIN ────────────────────────────────────────────────────────── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth" id="main-content">
          <Routes>
            <Route path="/"                  element={<Navigate to="/diagnose" replace />} />
            <Route path="/diagnose"          element={<DiagnosePage />} />
            <Route path="/do-next"           element={<DoNextPage />} />
            <Route path="/map"               element={<ChangeMapPage />} />
            <Route path="/tools"             element={<ToolsListPage />} />
            <Route path="/tools/:toolSlug"   element={<ToolDetailPage />} />
            <Route path="/regulate"          element={<RegulatePage />} />
            <Route path="/simulator"         element={<SimulatorPage />} />
            <Route path="/coach"             element={<CoachPage />} />
            <Route path="/coach/:topicSlug"  element={<CoachTopicPage />} />
            <Route path="/plan"              element={<PlanPage />} />
            <Route path="*"                  element={
              <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200">
                <h1 className="text-xl font-bold">Page not found</h1>
                <p className="text-slate-600 mt-2">Check the navigation.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <BrowserRouter>
      <InnerShell />
    </BrowserRouter>
  );
}
