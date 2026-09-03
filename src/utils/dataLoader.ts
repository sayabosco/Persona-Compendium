import { GameId, GameInfo, PersonaData, FusionChart, SpecialFusions, BossGuide, EnemyData, ItemData, MonthGuide } from '../types/persona';

export const SUPPORTED_GAMES: GameInfo[] = [
  {
    id: 'p5r',
    title: 'Persona 5 Royal',
    series: 'p5',
    shortTitle: 'P5 Royal',
    color: '#f43f5e',
    accentColor: '#e11d48',
    bgGradient: 'from-rose-950/40 via-zinc-950 to-zinc-950',
    badge: 'Phantom Thieves',
    sub: 'Shujin Academy & The Metaverse',
    logo: '/assets/p5r_logo.png',
    slogan: 'Take Your Heart',
    tagline: 'Phantom Thieves of Hearts'
  },
  {
    id: 'p4g',
    title: 'Persona 4 Golden',
    series: 'p4',
    shortTitle: 'P4 Golden',
    color: '#eab308',
    accentColor: '#ca8a04',
    bgGradient: 'from-yellow-950/30 via-zinc-950 to-zinc-950',
    badge: 'Investigation Team',
    sub: 'Inaba & The Midnight Channel',
    logo: '/assets/p4g_logo.png',
    slogan: 'Reach Out to the Truth',
    tagline: 'Inaba Investigation Team'
  },
  {
    id: 'p3r',
    title: 'Persona 3 Reload',
    series: 'p3',
    shortTitle: 'P3 Reload',
    color: '#38bdf8',
    accentColor: '#0284c7',
    bgGradient: 'from-sky-950/40 via-zinc-950 to-zinc-950',
    badge: 'S.E.E.S.',
    sub: 'Tatsumi Port Island & Tartarus',
    logo: '/assets/p3r_logo.png',
    slogan: 'Memento Mori',
    tagline: 'Specialized Extracurricular Execution Squad'
  },
  {
    id: 'p3p',
    title: 'Persona 3 Portable',
    series: 'p3',
    shortTitle: 'P3 Portable',
    color: '#06b6d4',
    accentColor: '#0891b2',
    bgGradient: 'from-cyan-950/40 via-zinc-950 to-zinc-950',
    badge: 'FeMC / Male Route',
    sub: 'Classic Portable Edition',
    logo: '/assets/p3r_logo.png',
    slogan: 'Memento Mori',
    tagline: 'Portable FeMC Edition'
  }
];

// Elements order per game series
export const GAME_ELEMENTS: Record<'p3' | 'p4' | 'p5', { key: string; name: string; iconKey: string; color: string }[]> = {
  p5: [
    { key: 'phy', name: 'Phys', iconKey: 'phys', color: '#f87171' },
    { key: 'gun', name: 'Gun', iconKey: 'gun', color: '#fb923c' },
    { key: 'fir', name: 'Fire', iconKey: 'fire', color: '#ef4444' },
    { key: 'ice', name: 'Ice', iconKey: 'ice', color: '#38bdf8' },
    { key: 'ele', name: 'Elec', iconKey: 'elec', color: '#facc15' },
    { key: 'win', name: 'Wind', iconKey: 'wind', color: '#4ade80' },
    { key: 'psy', name: 'Psy', iconKey: 'psy', color: '#ec4899' },
    { key: 'nuk', name: 'Nuke', iconKey: 'nuke', color: '#06b6d4' },
    { key: 'ble', name: 'Bless', iconKey: 'bless', color: '#fef08a' },
    { key: 'cur', name: 'Curse', iconKey: 'curse', color: '#a855f7' }
  ],
  p4: [
    { key: 'phy', name: 'Phys', iconKey: 'phys', color: '#f87171' },
    { key: 'fir', name: 'Fire', iconKey: 'fire', color: '#ef4444' },
    { key: 'ice', name: 'Ice', iconKey: 'ice', color: '#38bdf8' },
    { key: 'ele', name: 'Elec', iconKey: 'elec', color: '#facc15' },
    { key: 'win', name: 'Wind', iconKey: 'wind', color: '#4ade80' },
    { key: 'lig', name: 'Light', iconKey: 'light', color: '#fef08a' },
    { key: 'dar', name: 'Dark', iconKey: 'dark', color: '#a855f7' },
    { key: 'alm', name: 'Almighty', iconKey: 'almighty', color: '#c084fc' }
  ],
  p3: [
    { key: 'sla', name: 'Slash', iconKey: 'slash', color: '#f87171' },
    { key: 'str', name: 'Strike', iconKey: 'strike', color: '#fb923c' },
    { key: 'pie', name: 'Pierce', iconKey: 'pierce', color: '#e879f9' },
    { key: 'fir', name: 'Fire', iconKey: 'fire', color: '#ef4444' },
    { key: 'ice', name: 'Ice', iconKey: 'ice', color: '#38bdf8' },
    { key: 'ele', name: 'Elec', iconKey: 'elec', color: '#facc15' },
    { key: 'win', name: 'Wind', iconKey: 'wind', color: '#4ade80' },
    { key: 'lig', name: 'Light', iconKey: 'light', color: '#fef08a' },
    { key: 'dar', name: 'Dark', iconKey: 'dark', color: '#a855f7' },
    { key: 'alm', name: 'Almighty', iconKey: 'almighty', color: '#c084fc' }
  ]
};

// Affinity code to readable state
export const RESIST_MAP: Record<string, { label: string; badgeClass: string; color: string }> = {
  '-': { label: 'Normal', badgeClass: 'bg-zinc-800 text-zinc-400', color: '#71717a' },
  'w': { label: 'Weak', badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold', color: '#f43f5e' },
  's': { label: 'Resist', badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', color: '#60a5fa' },
  'n': { label: 'Null', badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', color: '#c084fc' },
  'd': { label: 'Drain', badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', color: '#34d399' },
  'r': { label: 'Repel', badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', color: '#fbbf24' }
};

const cache = new Map<string, any>();

export async function fetchJson<T>(url: string): Promise<T> {
  const baseUrl = (import.meta as any).env?.BASE_URL || '/';
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const resolvedUrl = url.startsWith('http')
    ? url
    : `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}${cleanUrl}`;

  if (cache.has(resolvedUrl)) {
    return cache.get(resolvedUrl) as T;
  }
  
  let response = await fetch(resolvedUrl).catch(() => null);
  if (!response || !response.ok) {
    // Fallback to absolute or direct path
    response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`);
    }
  }

  const data = await response.json();
  cache.set(resolvedUrl, data);
  return data as T;
}

export async function loadPersonas(game: GameId): Promise<PersonaData[]> {
  const pathMap: Record<GameId, string> = {
    p5r: '/data/persona5/royal_personas.json',
    p5: '/data/persona5/personas.json',
    p4g: '/data/persona4/golden_personas.json',
    p4: '/data/persona4/personas.json',
    p3r: '/data/persona3/reload_personas.json',
    p3p: '/data/persona3/portable_personas.json',
    p3fes: '/data/persona3/personas.json'
  };

  const raw = await fetchJson<Record<string, any>>(pathMap[game] || pathMap.p5r);
  const personas: PersonaData[] = [];

  for (const [name, p] of Object.entries(raw)) {
    personas.push({
      name,
      arcana: p.arcana || p.race || 'Unknown',
      level: p.level ?? p.lvl ?? 1,
      stats: p.stats || [1, 1, 1, 1, 1],
      skills: p.skills || {},
      resists: p.resists || '----------',
      trait: p.trait,
      item: p.item,
      itemr: p.itemr,
      inherits: p.inherits,
      fusion: p.fusion,
      isDlc: p.isDlc || false
    });
  }

  return personas.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

export async function loadFusionChart(game: GameId): Promise<FusionChart> {
  const chartMap: Record<GameId, string> = {
    p5r: '/data/fusion-charts/p5-fusion-chart.json',
    p5: '/data/fusion-charts/p5-fusion-chart.json',
    p4g: '/data/fusion-charts/p4-fusion-chart.json',
    p4: '/data/fusion-charts/p4-fusion-chart.json',
    p3r: '/data/fusion-charts/p3r-fusion-chart.json',
    p3p: '/data/fusion-charts/p3p-fusion-chart.json',
    p3fes: '/data/fusion-charts/p3-fusion-chart.json'
  };
  return fetchJson<FusionChart>(chartMap[game] || chartMap.p5r);
}

export async function loadSpecialFusions(game: GameId): Promise<SpecialFusions> {
  const specMap: Record<GameId, string> = {
    p5r: '/data/special-fusions/p5r-special.json',
    p5: '/data/special-fusions/p5-special.json',
    p4g: '/data/special-fusions/p4-special.json',
    p4: '/data/special-fusions/p4-special.json',
    p3r: '/data/special-fusions/p3r-special.json',
    p3p: '/data/special-fusions/p3-special.json',
    p3fes: '/data/special-fusions/p3-special.json'
  };
  return fetchJson<SpecialFusions>(specMap[game] || specMap.p5r).catch(() => ({}));
}

export async function loadClassroomAnswers(game: GameId): Promise<Record<string, any>> {
  const pathMap: Record<string, string> = {
    p5r: '/data/classroom/p5_classroom_answers.json',
    p5: '/data/classroom/p5_classroom_answers.json',
    p4g: '/data/classroom/p4_classroom_answers.json',
    p4: '/data/classroom/p4_classroom_answers.json',
    p3r: '/data/classroom/p3_classroom_answers.json',
    p3p: '/data/classroom/p3_classroom_answers.json',
    p3fes: '/data/classroom/p3_classroom_answers.json'
  };
  return fetchJson<Record<string, any>>(pathMap[game] || pathMap.p5r);
}

export async function loadSocialLinks(game: GameId): Promise<Record<string, any>> {
  const pathMap: Record<string, string> = {
    p5r: '/data/social-links/p5+p5r_social_links.json',
    p5: '/data/social-links/p5+p5r_social_links.json',
    p4g: '/data/social-links/p4+p4g_social_links.json',
    p4: '/data/social-links/p4+p4g_social_links.json',
    p3r: '/data/social-links/p3r_social_links.json',
    p3p: '/data/social-links/p3p_male_social_links.json',
    p3fes: '/data/social-links/p3fes_social_links.json'
  };
  return fetchJson<Record<string, any>>(pathMap[game] || pathMap.p5r);
}

export async function loadRequests(game: GameId): Promise<any[]> {
  const pathMap: Record<string, string> = {
    p5r: '/data/requests/p5r_requests.json',
    p5: '/data/requests/p5r_requests.json',
    p4g: '/data/requests/p4g_requests.json',
    p4: '/data/requests/p4_requests.json',
    p3r: '/data/requests/p3r_requests.json',
    p3p: '/data/requests/p3p_requests.json',
    p3fes: '/data/requests/p3fes_requests.json'
  };
  const raw = await fetchJson<any>(pathMap[game] || pathMap.p5r);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.requests)) return raw.requests;
    if (Array.isArray(raw.quests)) return raw.quests;
    return Object.values(raw);
  }
  return [];
}

export async function loadBossGuides(game: GameId): Promise<BossGuide[]> {
  const allGuides = await fetchJson<any[]>('/data/guides/boss_guides.json').catch(() => []);
  const seriesMap: Record<GameId, string> = {
    p5r: 'p5r',
    p5: 'p5',
    p4g: 'p4g',
    p4: 'p4',
    p3r: 'p3r',
    p3p: 'p3p',
    p3fes: 'p3fes'
  };
  const targetId = seriesMap[game] || 'p5r';
  const group = allGuides.find((g) => g.gameId === targetId || g.gameId === game);
  if (group && group.bosses) {
    return group.bosses;
  }
  // Fallback to first available if specific game bosses not found
  return allGuides[0]?.bosses || [];
}

export async function loadNegotiationData(): Promise<any> {
  return fetchJson<any>('/data/negotiation/negotiation_data.json').catch(() => null);
}

export async function loadSkills(game: GameId): Promise<any[]> {
  const pathMap: Record<string, string> = {
    p5r: '/data/skills/p5r_skills.json',
    p5: '/data/skills/p5_skills.json',
    p4g: '/data/skills/p4g_skills.json',
    p4: '/data/skills/p4_skills.json',
    p3r: '/data/skills/p3r_skills.json',
    p3p: '/data/skills/p3p_skills.json',
    p3fes: '/data/skills/p3fes_skills.json'
  };
  const raw = await fetchJson<any>(pathMap[game] || pathMap.p5r).catch(() => []);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    if (raw.skills && Array.isArray(raw.skills)) return raw.skills;
    return Object.entries(raw).map(([id, val]: [string, any]) => {
      const parts = val.a || [];
      const costs = val.b || [];
      const effects = val.c || [];
      return {
        name: parts[0] || id,
        element: parts[1] || 'Special',
        target: parts[2] || '-',
        cost: costs[7] ? (costs[1] >= 1000 ? `${costs[7]} SP` : `${costs[7]}% HP`) : '',
        effect: effects[0] || effects[1] || ''
      };
    });
  }
  return [];
}

export async function loadEnemies(game: GameId): Promise<EnemyData[]> {
  const pathMap: Record<string, string> = {
    p5r: '/data/enemies/p5r_enemies.json',
    p5: '/data/enemies/p5_enemies.json',
    p4g: '/data/enemies/p4g_enemies.json',
    p4: '/data/enemies/p4_enemies.json',
    p3r: '/data/enemies/p3r_enemies.json',
    p3p: '/data/enemies/p3p_enemies.json',
    p3fes: '/data/enemies/p3fes_enemies.json'
  };
  const raw = await fetchJson<any[]>(pathMap[game] || pathMap.p5r).catch(() => []);
  return Array.isArray(raw) ? raw : [];
}

export async function loadItems(game: GameId): Promise<ItemData[]> {
  const pathMap: Record<string, string> = {
    p5r: '/data/items/p5r_items.json',
    p5: '/data/items/p5_items.json',
    p4g: '/data/items/p4g_items.json',
    p4: '/data/items/p4_items.json',
    p3r: '/data/items/p3r_items.json',
    p3p: '/data/items/p3p_items.json',
    p3fes: '/data/items/p3fes_items.json'
  };
  const raw = await fetchJson<any>(pathMap[game] || pathMap.p5r).catch(() => ({ items: [] }));
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw)) return raw;
  return [];
}

export async function loadDayGuides(game: GameId): Promise<MonthGuide[]> {
  const allGuides = await fetchJson<any[]>('/data/guides/day_guides.json').catch(() => []);
  const seriesMap: Record<GameId, string> = {
    p5r: 'p5r',
    p5: 'p5',
    p4g: 'p4g',
    p4: 'p4',
    p3r: 'p3r',
    p3p: 'p3p',
    p3fes: 'p3fes'
  };
  const targetId = seriesMap[game] || 'p5r';
  const group = allGuides.find((g) => g.gameId === targetId || g.gameId === game);
  if (group && group.months) {
    return group.months;
  }
  return allGuides[0]?.months || [];
}

export async function loadQuestGuides(game: GameId): Promise<any[]> {
  const allQuests = await fetchJson<any[]>('/data/guides/quest_guides.json').catch(() => []);
  const seriesMap: Record<GameId, string> = {
    p5r: 'p5r',
    p5: 'p5',
    p4g: 'p4g',
    p4: 'p4',
    p3r: 'p3r',
    p3p: 'p3p',
    p3fes: 'p3fes'
  };
  const targetId = seriesMap[game] || 'p3r';
  const group = allQuests.find((q) => q.gameId === targetId || q.gameId === game);
  if (group && group.quests) {
    return group.quests;
  }
  return [];
}

