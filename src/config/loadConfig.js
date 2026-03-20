async function fetchJson(url, { timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function deepMerge(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const out = { ...a };
    for (const k of Object.keys(b)) {
      out[k] = k in out ? deepMerge(out[k], b[k]) : b[k];
    }
    return out;
  }
  return b ?? a;
}

function normalizeConfig(cfg) {
  // Fix mojibake if present
  const tpl = cfg.ui?.templates?.TPL_MIRRORED_ROLE_TOPIC_PAGE;
  if (tpl?.bridge_banner?.fallbacks?.INDIVIDUAL) {
    tpl.bridge_banner.fallbacks.INDIVIDUAL = tpl.bridge_banner.fallbacks.INDIVIDUAL
      .replace('arenâ€™t', 'aren’t');
  }

  // Alias rerender block name to match template naming
  const rerender = cfg.ui?.global_layout?.top_bar?.role_toggle?.behavior?.rerender_on_toggle;
  if (Array.isArray(rerender)) {
    cfg.ui.global_layout.top_bar.role_toggle.behavior.rerender_on_toggle =
      rerender.map(x => (x === 'role_specific_tools_actions' ? 'role_specific_actions' : x));
  }

  // Fix ZONES_OF_CHANGE mapping keys if needed
  const zones = cfg.logic?.diagnose?.modules?.find(m => m.id === 'ZONES_OF_CHANGE');
  if (zones?.scoring?.mapping) {
    const m = zones.scoring.mapping;
    if (m.Z1 && !m.ZONE_Z1) { m.ZONE_Z1 = m.Z1; delete m.Z1; }
    if (m.Z2 && !m.ZONE_Z2) { m.ZONE_Z2 = m.Z2; delete m.Z2; }
    if (m.Z4 && !m.ZONE_Z4) { m.ZONE_Z4 = m.Z4; delete m.Z4; }
  }

  return cfg;
}

function validateMinimal(cfg) {
  const nav = cfg.ui?.global_layout?.navigation?.items;
  if (!Array.isArray(nav) || nav.length === 0) throw new Error('Missing nav items in ui base config');
  const tpl = cfg.ui?.templates?.TPL_MIRRORED_ROLE_TOPIC_PAGE;
  if (!tpl) throw new Error('Missing template: TPL_MIRRORED_ROLE_TOPIC_PAGE');
  if (!Array.isArray(cfg.logic?.diagnose?.modules)) throw new Error('Missing diagnose modules[]');
}

export async function loadRuntimeConfig() {
  const manifest = await fetchJson('/configs/manifest.json');
  const files = manifest.files;

  const [uiBase, uiTools, uiShared, diagnose, toolsTopics, coachLibrary] = await Promise.all([
    fetchJson(files.ui_base),
    fetchJson(files.ui_tools),
    fetchJson(files.ui_shared),
    fetchJson(files.diagnose_logic),
    fetchJson(files.tools_topics),
    fetchJson(files.coach_library)
  ]);

  const merged = {
    meta: { manifest },
    ui: deepMerge(uiBase, {
      templates: uiShared.templates || {},
      pages: [ ...(uiBase.pages || []), ...(uiTools.pages || []) ],
      applies_to_routes: uiShared.applies_to_routes || [],
      route_bindings: uiShared.route_bindings || {}
    }),
    logic: { diagnose },
    content: { toolsTopics, coachLibrary }
  };

  const normalized = normalizeConfig(merged);
  validateMinimal(normalized);
  return normalized;
}
