import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useConfig } from '../config/ConfigContext';
import { useAppState } from './AppState';

import DiagnosePage from '../pages/DiagnosePage';
import DoNextPage from '../pages/DoNextPage';
import ToolsListPage from '../pages/ToolsListPage';
import ToolDetailPage from '../pages/ToolDetailPage';
import RegulatePage from '../pages/RegulatePage';
import SimulatorPage from '../pages/SimulatorPage';
import CoachPage from '../pages/CoachPage';
import PlanPage from '../pages/PlanPage';

function AmbientBackground({ mode }) {
  const opacity = mode === 'Focus' ? 0.40 : mode === 'Reflection' ? 0.90 : 1.0;
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 transition-opacity duration-700" style={{ opacity }}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-indigo-50/50 to-slate-100" />
      <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply" />
      <div className="absolute top-32 -right-32 w-[520px] h-[520px] bg-violet-200/30 rounded-full blur-3xl mix-blend-multiply" />
      <div className="absolute bottom-[-160px] left-1/3 w-[620px] h-[620px] bg-sky-200/30 rounded-full blur-3xl mix-blend-multiply" />
    </div>
  );
}

export default function AppShell() {
  const { config, reload, loading } = useConfig();
  const { state, dispatch } = useAppState();

  const navItems = config.ui?.global_layout?.navigation?.items || [];

  const roleOptions = config.ui?.global_layout?.top_bar?.role_toggle?.options || [];

  const modeByRoute = useMemo(() => {
    // Simple mode mapping for beta: Regulate => Reflection, Diagnose/DoNext/Tools/Coach => Focus, otherwise Default
    return {
      '/regulate': 'Reflection',
      '/diagnose': 'Focus',
      '/do-next': 'Focus',
      '/tools': 'Default',
      '/coach': 'Default',
      '/plan': 'Focus',
      '/simulator': 'Default'
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans text-slate-900 flex flex-col relative overflow-hidden bg-slate-50">
        <AmbientBackground mode={'Default'} />

        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="font-black text-xl tracking-tight text-slate-900">Change GPS (Beta)</div>

            <div className="flex items-center gap-3">
              {/* Role Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                {roleOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => dispatch({ type: 'SET_ROLE', payload: opt.value })}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${state.role === opt.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Config reload */}
              <button
                onClick={reload}
                className="px-3 py-1.5 text-sm font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100"
              >
                {loading ? 'Reloading…' : 'Reload config'}
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          <nav className="w-64 bg-white border-r border-slate-200 shadow-none">
            <div className="p-4 flex flex-col gap-2 h-full">
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2 mt-2 px-2">Navigation</div>
              {navItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.route}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-auto mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">Profile Mode</span>
                  <input
                    type="checkbox"
                    checked={state.hasProfile}
                    onChange={(e) => dispatch({ type: 'SET_PROFILE_ENABLED', payload: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Stateless by default. Turn on Profile to save trendlines locally.</p>
              </div>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <Routes>
              <Route path="/" element={<Navigate to="/diagnose" replace />} />
              <Route path="/diagnose" element={<DiagnosePage />} />
              <Route path="/do-next" element={<DoNextPage />} />
              <Route path="/tools" element={<ToolsListPage />} />
              <Route path="/tools/:toolSlug" element={<ToolDetailPage />} />
              <Route path="/regulate" element={<RegulatePage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/coach" element={<CoachPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="*" element={<div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border">Not found.</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
