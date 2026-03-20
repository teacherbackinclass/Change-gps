import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadRuntimeConfig } from './loadConfig';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await loadRuntimeConfig();
      setConfig(next);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ config, reload, loading, error }), [config, loading, error]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-slate-900">Config failed to load</h1>
          <p className="text-slate-600 mt-2">Check <code className="bg-slate-100 px-1 rounded">/public/configs</code> and <code className="bg-slate-100 px-1 rounded">manifest.json</code>.</p>
          <pre className="mt-4 text-xs bg-slate-50 border rounded-lg p-3 overflow-auto">{String(error?.message || error)}</pre>
          <button onClick={reload} className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading config…</div>
    );
  }

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
