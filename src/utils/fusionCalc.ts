import { FusionChart, PersonaData, SpecialFusions } from '../types/persona';

export type FissionTable = Record<string, Record<string, string[]>>;

export function buildFissionTable(chart: FusionChart, isTriangular: boolean): FissionTable {
  const fissionTable: FissionTable = {};
  if (!chart || !chart.races || !chart.table) return fissionTable;

  const { races, table } = chart;

  if (isTriangular) {
    for (let idxA = 0; idxA < races.length; idxA++) {
      const raceA = races[idxA];
      const row = table[idxA];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        if (c === idxA) continue;
        const raceB = races[c];
        const raceR = row[c];
        if (!raceR || raceR === '-') continue;
        if (!fissionTable[raceR]) fissionTable[raceR] = {};
        if (!fissionTable[raceR][raceA]) fissionTable[raceR][raceA] = [];
        if (!fissionTable[raceR][raceA].includes(raceB)) {
          fissionTable[raceR][raceA].push(raceB);
        }
      }
    }
  } else {
    for (let idxA = 0; idxA < races.length; idxA++) {
      const raceA = races[idxA];
      const row = table[idxA];
      if (!row) continue;
      for (let idxB = idxA; idxB < races.length; idxB++) {
        if (idxB === idxA) continue;
        const raceB = races[idxB];
        const raceR = row[idxB];
        if (!raceR || raceR === '-') continue;
        if (!fissionTable[raceR]) fissionTable[raceR] = {};
        if (!fissionTable[raceR][raceA]) fissionTable[raceR][raceA] = [];
        if (!fissionTable[raceR][raceA].includes(raceB)) {
          fissionTable[raceR][raceA].push(raceB);
        }
      }
    }
  }

  return fissionTable;
}

export function getResultArcana(arc1: string, arc2: string, chart: FusionChart, isTriangular: boolean): string | null {
  if (!chart || !chart.races || !chart.table) return null;
  const { races, table } = chart;
  const idx1 = races.indexOf(arc1);
  const idx2 = races.indexOf(arc2);
  if (idx1 < 0 || idx2 < 0) return null;

  if (isTriangular) {
    const r = Math.max(idx1, idx2);
    const c = Math.min(idx1, idx2);
    return table[r] && table[r][c] ? table[r][c] : null;
  } else {
    const r = Math.min(idx1, idx2);
    const c = Math.max(idx1, idx2);
    return table[r] && table[r][c] ? table[r][c] : null;
  }
}

export function calcReverseRecipes(
  targetName: string,
  personaMap: Record<string, PersonaData>,
  chart: FusionChart,
  fissionTable: FissionTable,
  specialData: SpecialFusions
): { ingredients: PersonaData[]; isSpecial?: boolean; cost: number }[] {
  const recipes: { ingredients: PersonaData[]; isSpecial?: boolean; cost: number }[] = [];
  const target = personaMap[targetName];
  if (!target) return recipes;

  // 1. Check special fusions first
  const special = specialData[targetName];
  if (special && special.length) {
    for (const combo of special) {
      const ingredients = combo
        .map((n) => personaMap[n])
        .filter((p): p is PersonaData => Boolean(p));
      if (ingredients.length === combo.length) {
        const cost = ingredients.reduce((sum, p) => sum + p.level, 0);
        recipes.push({ ingredients, isSpecial: true, cost });
      }
    }
    return recipes;
  }

  const targetArcana = target.arcana;
  const targetLevel = target.level;
  if (!targetArcana || !chart) return recipes;

  // Group personas by Arcana excluding special fusions
  const byArcana: Record<string, PersonaData[]> = {};
  for (const p of Object.values(personaMap)) {
    if (specialData[p.name]) continue;
    if (['party', 'accident', 'special'].includes(p.fusion || '')) continue;
    if (!byArcana[p.arcana]) byArcana[p.arcana] = [];
    byArcana[p.arcana].push(p);
  }
  for (const list of Object.values(byArcana)) {
    list.sort((a, b) => a.level - b.level);
  }

  const resultLvls = (byArcana[targetArcana] || []).map((p) => p.level);
  const targetLvlIndex = resultLvls.indexOf(targetLevel);
  if (targetLvlIndex < 0) return recipes;

  // Same Arcana combination (downgrade)
  const sameArcanaList = byArcana[targetArcana] || [];
  for (let i = 0; i < sameArcanaList.length; i++) {
    for (let j = i + 1; j < sameArcanaList.length; j++) {
      const p1 = sameArcanaList[i];
      const p2 = sameArcanaList[j];
      const avgLvl = (p1.level + p2.level) / 2;
      const lowerRank = sameArcanaList
        .filter((p) => p.level < avgLvl && p.name !== p1.name && p.name !== p2.name)
        .sort((a, b) => b.level - a.level)[0];
      if (lowerRank && lowerRank.name === targetName) {
        recipes.push({
          ingredients: [p1, p2],
          cost: p1.level + p2.level
        });
      }
    }
  }

  // Cross Arcana combinations
  const arcanaPairs = fissionTable[targetArcana] || {};
  const minLvl = targetLvlIndex === 0 ? 0 : (resultLvls[targetLvlIndex - 1] - 1) * 2;
  const maxLvl = (targetLevel - 1) * 2;

  for (const [arcA, listB] of Object.entries(arcanaPairs)) {
    const listA = byArcana[arcA] || [];
    for (const arcB of listB) {
      const bList = byArcana[arcB] || [];
      for (const pA of listA) {
        const lvlA = pA.level;
        for (const pB of bList) {
          const lvlB = pB.level;
          const sum = lvlA + lvlB;
          if (sum > minLvl && sum <= maxLvl) {
            recipes.push({
              ingredients: [pA, pB],
              cost: lvlA + lvlB
            });
          }
        }
      }
    }
  }

  // Deduplicate and sort by level cost
  const seen = new Set<string>();
  const uniqueRecipes = recipes.filter((r) => {
    const key = r.ingredients.map((p) => p.name).sort().join('+');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueRecipes.sort((a, b) => a.cost - b.cost);
}

export function calcForwardFusion(
  names: string[],
  personaMap: Record<string, PersonaData>,
  chart: FusionChart,
  specialData: SpecialFusions,
  isTriangular: boolean
): { result: PersonaData; isSpecial?: boolean } | null {
  const validNames = names.filter(Boolean);
  if (validNames.length < 2) return null;

  // 1. Check special fusions first
  const sortedInput = [...validNames].sort();
  for (const [specialResult, recipes] of Object.entries(specialData || {})) {
    for (const recipe of recipes) {
      if (recipe.length === validNames.length) {
        const sortedRecipe = [...recipe].sort();
        if (sortedRecipe.every((n, i) => n === sortedInput[i])) {
          const res = personaMap[specialResult];
          if (res) return { result: res, isSpecial: true };
        }
      }
    }
  }

  // Group by arcana
  const byArcana: Record<string, PersonaData[]> = {};
  for (const p of Object.values(personaMap)) {
    if (specialData[p.name]) continue;
    if (['party', 'accident', 'special'].includes(p.fusion || '')) continue;
    if (!byArcana[p.arcana]) byArcana[p.arcana] = [];
    byArcana[p.arcana].push(p);
  }
  for (const list of Object.values(byArcana)) {
    list.sort((a, b) => a.level - b.level);
  }

  // 2. Triangle fusion (3 personas)
  if (validNames.length === 3) {
    const [p1, p2, p3] = validNames.map((n) => personaMap[n]);
    if (!p1 || !p2 || !p3) return null;

    const sorted = [p1, p2, p3].sort((a, b) => a.level - b.level);
    const [lowest, middle, highest] = sorted;

    let intermediateArc: string | null = null;
    if (lowest.arcana === middle.arcana) {
      intermediateArc = lowest.arcana;
    } else {
      intermediateArc = getResultArcana(lowest.arcana, middle.arcana, chart, isTriangular);
    }
    if (!intermediateArc || intermediateArc === '-') return null;

    const finalArc = getResultArcana(intermediateArc, highest.arcana, chart, isTriangular);
    if (!finalArc || finalArc === '-') return null;

    const targetLvl = Math.floor((lowest.level + middle.level + highest.level) / 3) + 5;
    const candidates = (byArcana[finalArc] || [])
      .filter((p) => !validNames.includes(p.name))
      .sort((a, b) => a.level - b.level);

    const match = candidates.find((p) => p.level >= targetLvl);
    if (match) return { result: match, isSpecial: false };
    if (candidates.length) return { result: candidates[candidates.length - 1], isSpecial: false };
    return null;
  }

  // 3. Normal 2-Persona fusion
  if (validNames.length === 2) {
    const p1 = personaMap[validNames[0]];
    const p2 = personaMap[validNames[1]];
    if (!p1 || !p2) return null;

    if (p1.arcana === p2.arcana) {
      // Same arcana -> lower level
      const avgLvl = (p1.level + p2.level) / 2;
      const candidates = (byArcana[p1.arcana] || [])
        .filter((p) => !validNames.includes(p.name) && p.level < avgLvl)
        .sort((a, b) => b.level - a.level);
      if (candidates.length) return { result: candidates[0], isSpecial: false };
      return null;
    } else {
      const resArc = getResultArcana(p1.arcana, p2.arcana, chart, isTriangular);
      if (!resArc || resArc === '-') return null;
      const targetLvl = Math.floor((p1.level + p2.level) / 2) + 1;
      const candidates = (byArcana[resArc] || [])
        .filter((p) => !validNames.includes(p.name))
        .sort((a, b) => a.level - b.level);
      const match = candidates.find((p) => p.level >= targetLvl);
      if (match) return { result: match, isSpecial: false };
      return null;
    }
  }

  return null;
}
