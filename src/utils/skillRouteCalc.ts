import { PersonaData, FusionChart, SpecialFusions } from '../types/persona';
import { calcReverseRecipes, calcForwardFusion, FissionTable } from './fusionCalc';

export interface LearnerInfo {
  name: string;
  persona: PersonaData;
  atLevel: string;
  level: number;
}

export interface ItemizerInfo {
  name: string;
  persona: PersonaData;
  isAlarm: boolean;
}

export interface DirectRoute {
  type: 'special_direct' | 'direct_2p';
  source: LearnerInfo;
  partner?: PersonaData;
  allIngredients?: string[];
  skill: string;
  targetName: string;
}

export interface TwoStepRoute {
  type: '2step_special' | '2step_2p';
  source: LearnerInfo;
  skill: string;
  step1: { p1: string; p2: string; result: string };
  step2: { specialRecipe?: string[]; p1?: string; p2?: string; result: string };
}

export interface SpecialMultiPlan {
  type: 'special_multi';
  ingredients: string[];
  branches: {
    skill: string;
    targetIngredient: string;
    route: any;
  }[];
  targetName: string;
}

export interface TwoParentMultiPlan {
  type: '2p_tree';
  parentA: { name: string; data: PersonaData; skill: string; route: any };
  parentB: { name: string; data: PersonaData; skill: string; route: any };
  extraSkills: string[];
  targetName: string;
}

export interface SkillRouteResults {
  targetName: string;
  skillNames: string[];
  naturalSkills: { skill: string; atLevel: string }[];
  neededSkills: string[];
  itemizers: Record<string, ItemizerInfo[]>;
  singleDirectRoutes: DirectRoute[];
  singleTwoStepRoutes: TwoStepRoute[];
  multiTrees: (SpecialMultiPlan | TwoParentMultiPlan)[];
}

export function findLearners(
  skillName: string,
  personaMap: Record<string, PersonaData>
): LearnerInfo[] {
  const list: LearnerInfo[] = [];
  for (const [pname, p] of Object.entries(personaMap)) {
    if (p.skills && p.skills[skillName] !== undefined) {
      const at = Number(p.skills[skillName]) || 0;
      list.push({
        name: pname,
        persona: p,
        atLevel: at < 1 ? 'Innate' : at >= 100 ? 'Special' : `Lv. ${Math.floor(at)}`,
        level: p.level || 1
      });
    }
  }
  return list.sort((a, b) => a.level - b.level);
}

export function findRouteForPersona(
  destinationPersona: string,
  skillName: string,
  personaMap: Record<string, PersonaData>,
  chart: FusionChart,
  specialData: SpecialFusions,
  isTriangular: boolean
): any | null {
  const dest = personaMap[destinationPersona];
  if (!dest) return null;

  if (dest.skills && dest.skills[skillName] !== undefined) {
    const at = Number(dest.skills[skillName]) || 0;
    return {
      type: 'direct_learner',
      persona: destinationPersona,
      personaData: dest,
      atLevel: at < 1 ? 'Innate' : at >= 100 ? 'Special' : `Lv. ${Math.floor(at)}`
    };
  }

  const sources = findLearners(skillName, personaMap).slice(0, 8);
  const personaList = Object.keys(personaMap);

  for (const src of sources) {
    if (src.name === destinationPersona) continue;
    for (const partner of personaList) {
      if (partner === src.name) continue;
      const res = calcForwardFusion([src.name, partner], personaMap, chart, specialData, isTriangular);
      if (res && res.result.name === destinationPersona) {
        return {
          type: 'fuse_step',
          source: src,
          partner: { name: partner, persona: personaMap[partner] },
          result: destinationPersona,
          resultData: dest,
          atLevel: src.atLevel
        };
      }
    }
  }

  return null;
}

export function calcSkillInheritanceRoutes(
  targetName: string,
  skillNamesInput: string | string[],
  personaMap: Record<string, PersonaData>,
  chart: FusionChart | null,
  fissionTable: FissionTable,
  specialData: SpecialFusions,
  isTriangular: boolean
): SkillRouteResults | null {
  if (!targetName || !personaMap[targetName] || !chart) return null;

  const skillNames = Array.isArray(skillNamesInput)
    ? skillNamesInput.filter(Boolean)
    : skillNamesInput
    ? [skillNamesInput]
    : [];

  if (!skillNames.length) return null;

  const target = personaMap[targetName];

  // 1. Natural check & itemization
  const naturalSkills: { skill: string; atLevel: string }[] = [];
  const neededSkills: string[] = [];
  const itemizers: Record<string, ItemizerInfo[]> = {};

  for (const sk of skillNames) {
    if (target.skills && target.skills[sk] !== undefined) {
      const at = Number(target.skills[sk]) || 0;
      naturalSkills.push({
        skill: sk,
        atLevel: at < 1 ? 'Innate' : at >= 100 ? 'Special' : `Lv. ${Math.floor(at)}`
      });
    } else {
      neededSkills.push(sk);
    }

    for (const [pname, p] of Object.entries(personaMap)) {
      if (p.item === sk) {
        if (!itemizers[sk]) itemizers[sk] = [];
        itemizers[sk].push({ name: pname, persona: p, isAlarm: false });
      } else if (p.itemr === sk) {
        if (!itemizers[sk]) itemizers[sk] = [];
        itemizers[sk].push({ name: pname, persona: p, isAlarm: true });
      }
    }
  }

  const targetRecipes = calcReverseRecipes(targetName, personaMap, chart, fissionTable, specialData) || [];
  const multiTrees: (SpecialMultiPlan | TwoParentMultiPlan)[] = [];
  const singleDirectRoutes: DirectRoute[] = [];
  const singleTwoStepRoutes: TwoStepRoute[] = [];

  // Single Skill Mode Routes
  if (neededSkills.length === 1) {
    const sk = neededSkills[0];
    const sources = findLearners(sk, personaMap);
    const personaList = Object.keys(personaMap);

    for (const recipe of targetRecipes) {
      if (specialData[targetName]) {
        for (const ing of recipe.ingredients) {
          const src = sources.find((s) => s.name === ing.name);
          if (src) {
            singleDirectRoutes.push({
              type: 'special_direct',
              source: src,
              allIngredients: recipe.ingredients.map((r) => r.name),
              skill: sk,
              targetName
            });
          }
        }
      } else if (recipe.ingredients.length === 2) {
        const [pA, pB] = recipe.ingredients;
        const srcA = sources.find((s) => s.name === pA.name);
        const srcB = sources.find((s) => s.name === pB.name);
        if (srcA) {
          singleDirectRoutes.push({
            type: 'direct_2p',
            source: srcA,
            partner: pB,
            skill: sk,
            targetName
          });
        } else if (srcB) {
          singleDirectRoutes.push({
            type: 'direct_2p',
            source: srcB,
            partner: pA,
            skill: sk,
            targetName
          });
        }
      }
      if (singleDirectRoutes.length >= 10) break;
    }

    const topSources = sources.slice(0, 10);
    const seenChains = new Set<string>();

    for (const recipe of targetRecipes) {
      if (specialData[targetName]) {
        for (const ing of recipe.ingredients) {
          for (const src of topSources) {
            if (src.name === ing.name) continue;
            for (const other of personaList) {
              if (other === src.name) continue;
              const bridge = calcForwardFusion([src.name, other], personaMap, chart, specialData, isTriangular);
              if (bridge && bridge.result.name === ing.name) {
                const key = `${src.name}+${other}=>${ing.name}`;
                if (!seenChains.has(key)) {
                  seenChains.add(key);
                  singleTwoStepRoutes.push({
                    type: '2step_special',
                    source: src,
                    skill: sk,
                    step1: { p1: src.name, p2: other, result: ing.name },
                    step2: { specialRecipe: recipe.ingredients.map((r) => r.name), result: targetName }
                  });
                }
              }
              if (singleTwoStepRoutes.length >= 8) break;
            }
            if (singleTwoStepRoutes.length >= 8) break;
          }
          if (singleTwoStepRoutes.length >= 8) break;
        }
      } else if (recipe.ingredients.length === 2) {
        const [pA, pB] = recipe.ingredients;
        for (const src of topSources) {
          if (src.name === pA.name || src.name === pB.name) continue;
          for (const other of personaList) {
            if (other === src.name) continue;
            const bridge = calcForwardFusion([src.name, other], personaMap, chart, specialData, isTriangular);
            if (bridge && bridge.result.name === pA.name) {
              const key = `${src.name}+${other}=>${pA.name}+${pB.name}`;
              if (!seenChains.has(key)) {
                seenChains.add(key);
                singleTwoStepRoutes.push({
                  type: '2step_2p',
                  source: src,
                  skill: sk,
                  step1: { p1: src.name, p2: other, result: pA.name },
                  step2: { p1: pA.name, p2: pB.name, result: targetName }
                });
              }
            }
            if (singleTwoStepRoutes.length >= 8) break;
          }
          if (singleTwoStepRoutes.length >= 8) break;
        }
      }
      if (singleTwoStepRoutes.length >= 8) break;
    }
  }

  // Multi-Skill Tree Planner (for 2 or more skills)
  if (neededSkills.length >= 2) {
    if (specialData[targetName]) {
      for (const recipe of targetRecipes) {
        const ingNames = recipe.ingredients.map((r) => r.name);
        const branches: any[] = [];
        let allFound = true;

        for (const sk of neededSkills) {
          let branchFound: any = null;
          for (const ing of ingNames) {
            const route = findRouteForPersona(ing, sk, personaMap, chart, specialData, isTriangular);
            if (route) {
              branchFound = { skill: sk, targetIngredient: ing, route };
              break;
            }
          }
          if (branchFound) {
            branches.push(branchFound);
          } else {
            allFound = false;
            break;
          }
        }

        if (allFound && branches.length === neededSkills.length) {
          multiTrees.push({
            type: 'special_multi',
            ingredients: ingNames,
            branches,
            targetName
          });
          if (multiTrees.length >= 6) break;
        }
      }
    } else {
      for (const recipe of targetRecipes) {
        if (recipe.ingredients.length !== 2) continue;
        const [pA, pB] = recipe.ingredients;
        const sA = neededSkills[0];
        const sB = neededSkills[1];
        const rA = findRouteForPersona(pA.name, sA, personaMap, chart, specialData, isTriangular);
        const rB = findRouteForPersona(pB.name, sB, personaMap, chart, specialData, isTriangular);

        if (rA && rB) {
          multiTrees.push({
            type: '2p_tree',
            parentA: { name: pA.name, data: pA, skill: sA, route: rA },
            parentB: { name: pB.name, data: pB, skill: sB, route: rB },
            extraSkills: neededSkills.slice(2),
            targetName
          });
        } else {
          const rA_alt = findRouteForPersona(pA.name, sB, personaMap, chart, specialData, isTriangular);
          const rB_alt = findRouteForPersona(pB.name, sA, personaMap, chart, specialData, isTriangular);
          if (rA_alt && rB_alt) {
            multiTrees.push({
              type: '2p_tree',
              parentA: { name: pA.name, data: pA, skill: sB, route: rA_alt },
              parentB: { name: pB.name, data: pB, skill: sA, route: rB_alt },
              extraSkills: neededSkills.slice(2),
              targetName
            });
          }
        }
        if (multiTrees.length >= 6) break;
      }
    }
  }

  return {
    targetName,
    skillNames,
    naturalSkills,
    neededSkills,
    itemizers,
    singleDirectRoutes,
    singleTwoStepRoutes,
    multiTrees
  };
}
