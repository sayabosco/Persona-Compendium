import { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Plus, ArrowRight, X, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { PersonaData, FusionChart, SpecialFusions } from '../../types/persona';
import { calcReverseRecipes, calcForwardFusion, buildFissionTable } from '../../utils/fusionCalc';
import { calcSkillInheritanceRoutes } from '../../utils/skillRouteCalc';
import { triggerHaptic } from '../../utils/haptics';
import { IosSegmentedControl } from '../ios/IosSegmentedControl';

interface FusionLabViewProps {
  personas: PersonaData[];
  fusionChart: FusionChart | null;
  specialFusions: SpecialFusions;
  accentColor: string;
  initialTarget?: string;
  isTriangular?: boolean;
  initialSkill?: string;
  skillsData?: any[];
}

type FusionMode = 'reverse' | 'forward' | 'skillRoute' | 'special';

export const FusionLabView = ({
  personas,
  fusionChart,
  specialFusions,
  accentColor,
  initialTarget,
  isTriangular = false,
  initialSkill,
  skillsData = []
}: FusionLabViewProps) => {
  const [mode, setMode] = useState<FusionMode>(initialSkill ? 'skillRoute' : 'reverse');

  // Reverse mode state
  const [selectedTargetName, setSelectedTargetName] = useState<string>(
    initialTarget || personas[0]?.name || 'Arsene'
  );
  const [searchTargetQuery, setSearchTargetQuery] = useState('');

  // Forward mode slots
  const [slot1, setSlot1] = useState<string>('');
  const [slot2, setSlot2] = useState<string>('');
  const [slot3, setSlot3] = useState<string>('');

  // Skill Route Planner state
  const [skillRouteTarget, setSkillRouteTarget] = useState<string>(
    initialTarget || personas[0]?.name || 'Arsene'
  );
  const [skillRouteSkills, setSkillRouteSkills] = useState<string[]>(
    initialSkill ? [initialSkill] : []
  );
  const [searchSkillQuery, setSearchSkillQuery] = useState('');
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false);
  const [searchRouteTargetQuery, setSearchRouteTargetQuery] = useState('');
  const [isRouteTargetPickerOpen, setIsRouteTargetPickerOpen] = useState(false);

  // Persona map
  const personaMap = useMemo(() => {
    const map: Record<string, PersonaData> = {};
    personas.forEach((p) => {
      map[p.name] = p;
    });
    return map;
  }, [personas]);

  // Fission table for reverse fusion
  const fissionTable = useMemo(() => {
    if (!fusionChart) return {};
    return buildFissionTable(fusionChart, isTriangular);
  }, [fusionChart, isTriangular]);

  // If initialTarget changes, update
  useEffect(() => {
    if (initialTarget && personaMap[initialTarget]) {
      setSelectedTargetName(initialTarget);
      setSkillRouteTarget(initialTarget);
    }
  }, [initialTarget, personaMap]);

  // If initialSkill changes, update
  useEffect(() => {
    if (initialSkill) {
      setSkillRouteSkills((prev) => (prev.includes(initialSkill) ? prev : [...prev, initialSkill]));
      setMode('skillRoute');
    }
  }, [initialSkill]);

  // Keep target and fusion slots valid when personas change across game switches
  useEffect(() => {
    if (personas.length > 0) {
      if (!selectedTargetName || !personaMap[selectedTargetName]) {
        setSelectedTargetName(personas[0].name);
      }
      if (!skillRouteTarget || !personaMap[skillRouteTarget]) {
        setSkillRouteTarget(personas[0].name);
      }
    }
    if (slot1 && !personaMap[slot1]) setSlot1('');
    if (slot2 && !personaMap[slot2]) setSlot2('');
    if (slot3 && !personaMap[slot3]) setSlot3('');
  }, [personas, personaMap]);

  // Calculated reverse recipes for selected persona
  const reverseRecipes = useMemo(() => {
    if (!fusionChart || !selectedTargetName || !personaMap[selectedTargetName]) {
      return [];
    }
    return calcReverseRecipes(selectedTargetName, personaMap, fusionChart, fissionTable, specialFusions);
  }, [selectedTargetName, personaMap, fusionChart, fissionTable, specialFusions]);

  // Forward fusion result
  const forwardResult = useMemo(() => {
    if (!fusionChart) return null;
    const names = [slot1, slot2, slot3].filter(Boolean);
    if (names.length < 2) return null;
    return calcForwardFusion(names, personaMap, fusionChart, specialFusions, isTriangular);
  }, [slot1, slot2, slot3, personaMap, fusionChart, specialFusions, isTriangular]);

  // Skill route calculation
  const skillRouteResults = useMemo(() => {
    if (!fusionChart || !skillRouteTarget || skillRouteSkills.length === 0) return null;
    return calcSkillInheritanceRoutes(
      skillRouteTarget,
      skillRouteSkills,
      personaMap,
      fusionChart,
      fissionTable,
      specialFusions,
      isTriangular
    );
  }, [skillRouteTarget, skillRouteSkills, personaMap, fusionChart, fissionTable, specialFusions, isTriangular]);

  // Available skills for picker
  const availableSkillNames = useMemo(() => {
    const set = new Set<string>();
    if (skillsData && skillsData.length > 0) {
      skillsData.forEach((s) => {
        if (s && s.name) set.add(s.name);
      });
    }
    personas.forEach((p) => {
      if (p.skills) {
        Object.keys(p.skills).forEach((sk) => set.add(sk));
      }
    });
    return Array.from(set).sort();
  }, [skillsData, personas]);

  const filteredSkillsForPicker = useMemo(() => {
    const q = searchSkillQuery.toLowerCase().trim();
    if (!q) return availableSkillNames.slice(0, 25);
    return availableSkillNames.filter((sk) => sk.toLowerCase().includes(q)).slice(0, 40);
  }, [availableSkillNames, searchSkillQuery]);

  const filteredRouteTargetPersonas = useMemo(() => {
    const q = searchRouteTargetQuery.toLowerCase().trim();
    if (!q) return personas.slice(0, 20);
    return personas.filter(
      (p) => p.name.toLowerCase().includes(q) || p.arcana.toLowerCase().includes(q)
    );
  }, [personas, searchRouteTargetQuery]);

  const popularSkills = [
    'Arms Master',
    'Spell Master',
    'Victory Cry',
    'Debilitate',
    'Megidolaon',
    'Ali Dance',
    'Drain Phys',
    'Charge',
    'Concentrate',
    'Heat Riser',
    'Enduring Soul',
    'Insta-Heal'
  ];

  // Search filtered personas for selector
  const filteredPersonas = useMemo(() => {
    const q = searchTargetQuery.toLowerCase().trim();
    if (!q) return personas.slice(0, 15);
    return personas.filter((p) => p.name.toLowerCase().includes(q) || p.arcana.toLowerCase().includes(q));
  }, [personas, searchTargetQuery]);

  const targetPersona = personaMap[selectedTargetName];
  const routeTargetPersonaData = personaMap[skillRouteTarget];

  return (
    <div className="space-y-3.5">
      {/* iOS Segmented Control */}
      <IosSegmentedControl
        selected={mode}
        onChange={setMode}
        accentColor={accentColor}
        options={[
          { id: 'reverse', label: 'Reverse Recipes' },
          { id: 'forward', label: 'Combine (Forward)' },
          { id: 'skillRoute', label: 'Skill Route Planner' },
          { id: 'special', label: 'Special Fusions' }
        ]}
      />

      {/* ─── 1. REVERSE FUSION RECIPES ───────────────────────────── */}
      {mode === 'reverse' && (
        <div className="space-y-3">
          {/* Target Selector Pill */}
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Target Persona
              </span>
              {targetPersona && (
                <span className="text-xs font-semibold" style={{ color: accentColor }}>
                  {targetPersona.arcana} &bull; Lv. {targetPersona.level}
                </span>
              )}
            </div>

            {/* Live Search to pick Target */}
            <div className="relative">
              <input
                type="text"
                value={searchTargetQuery}
                onChange={(e) => setSearchTargetQuery(e.target.value)}
                placeholder={`Current: ${selectedTargetName} (type to change...)`}
                className="w-full pl-8 pr-8 py-2 bg-zinc-950/80 border border-white/10 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              {searchTargetQuery && (
                <button
                  onClick={() => setSearchTargetQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick dropdown pills */}
            {searchTargetQuery && (
              <div className="max-h-40 overflow-y-auto divide-y divide-white/5 bg-zinc-950/90 rounded-xl border border-white/10 no-scrollbar">
                {filteredPersonas.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedTargetName(p.name);
                      setSearchTargetQuery('');
                    }}
                    className="px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800/80 cursor-pointer"
                  >
                    <span className="font-semibold text-white">{p.name}</span>
                    <span className="text-zinc-400">
                      {p.arcana} &bull; Lv. {p.level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipes Count */}
          <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
            <span>
              {reverseRecipes.length} Recipes for <strong>{selectedTargetName}</strong>
            </span>
            <span className="text-[11px] text-zinc-500">Sorted by lowest base level</span>
          </div>

          {/* Recipes List */}
          <div className="space-y-2">
            {reverseRecipes.map((recipe, idx) => {
              const isSpecial = recipe.isSpecial;
              return (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/70 border border-white/[0.07] rounded-2xl flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    {recipe.ingredients.map((ing, ingIdx) => (
                      <div key={ing.name} className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedTargetName(ing.name);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-950/80 border border-white/10 text-left hover:border-white/30 transition-all"
                        >
                          <span className="text-xs font-bold text-white block">{ing.name}</span>
                          <span className="text-[10px] text-zinc-400">
                            {ing.arcana} Lv.{ing.level}
                          </span>
                        </button>
                        {ingIdx < recipe.ingredients.length - 1 && (
                          <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-right shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-zinc-200">
                        {isSpecial ? (
                          <span className="text-amber-400">Special</span>
                        ) : (
                          `Cost ${recipe.cost}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {reverseRecipes.length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5 space-y-2">
                <Sparkles className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-sm font-semibold text-zinc-300">No fusion recipes found</p>
                <p className="text-xs text-zinc-500">
                  {selectedTargetName} may be a special fusion or obtainable via story/event.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. FORWARD COMBINE FUSION CHAMBER ───────────────────── */}
      {mode === 'forward' && (
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Ingredient Chamber
              </h3>
              {(slot1 || slot2 || slot3) && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSlot1('');
                    setSlot2('');
                    setSlot3('');
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Slot Selectors */}
            <div className="space-y-2">
              {[
                { label: 'Ingredient 1 (Required)', value: slot1, setter: setSlot1 },
                { label: 'Ingredient 2 (Required)', value: slot2, setter: setSlot2 },
                { label: 'Ingredient 3 (Optional Triangle)', value: slot3, setter: setSlot3 }
              ].map((slot, index) => {
                const persona = personaMap[slot.value];
                return (
                  <div key={index} className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400">{slot.label}</label>
                    <select
                      value={slot.value}
                      onChange={(e) => {
                        triggerHaptic('selection');
                        slot.setter(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-zinc-950/80 border border-white/10 rounded-xl text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/30"
                    >
                      <option value="">-- Choose Persona --</option>
                      {personas.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} ({p.arcana} Lv.{p.level})
                        </option>
                      ))}
                    </select>
                    {persona && (
                      <p className="text-[10px] text-zinc-400 px-1">
                        Arcana: {persona.arcana} &bull; Level: {persona.level}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fusion Outcome Preview */}
          <div className="p-4 bg-zinc-900/90 rounded-2xl border border-white/10 shadow-lg space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Fusion Result
            </span>

            {forwardResult ? (
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-white/15 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{forwardResult.result.name}</h4>
                    {forwardResult.isSpecial && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Special
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {forwardResult.result.arcana} Arcana &bull; Level {forwardResult.result.level}
                  </p>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedTargetName(forwardResult.result.name);
                    setMode('reverse');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/5 text-center text-xs text-zinc-500">
                {slot1 && slot2
                  ? 'No valid fusion result for these ingredients.'
                  : 'Select at least 2 ingredients above to preview the fusion result.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. SPECIAL FUSIONS DIRECTORY ────────────────────────── */}
      {mode === 'special' && (
        <div className="space-y-2.5">
          <div className="px-1 text-xs text-zinc-400">
            Legendary fusions requiring specific multi-persona combinations:
          </div>

          <div className="space-y-2">
            {Object.entries(specialFusions).map(([personaName, recipes]) => {
              const persona = personaMap[personaName];
              return (
                <div
                  key={personaName}
                  className="p-3.5 bg-zinc-900/70 border border-white/[0.07] rounded-2xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{personaName}</h4>
                      {persona && (
                        <span className="text-xs text-zinc-400">
                          {persona.arcana} Lv.{persona.level}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedTargetName(personaName);
                        setMode('reverse');
                      }}
                      className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {recipes.map((combo, comboIdx) => (
                      <div key={comboIdx} className="flex flex-wrap gap-1.5 items-center">
                        {combo.map((ingName, idx) => {
                          const ing = personaMap[ingName];
                          return (
                            <div key={ingName} className="flex items-center gap-1">
                              <span className="px-2 py-1 rounded-lg bg-zinc-950 border border-white/10 text-[11px] font-semibold text-zinc-200">
                                {ingName} {ing ? `(Lv.${ing.level})` : ''}
                              </span>
                              {idx < combo.length - 1 && (
                                <Plus className="w-3 h-3 text-zinc-600" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.keys(specialFusions).length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5 space-y-2">
                <p className="text-sm font-semibold text-zinc-300">No special fusions found for this game.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. SKILL ROUTE & INHERITANCE BLUEPRINT PLANNER ─────────── */}
      {mode === 'skillRoute' && (
        <div className="space-y-3.5">
          {/* Top Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Target Persona Selection Card */}
            <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Target Persona to Craft
                </span>
                {routeTargetPersonaData && (
                  <span className="text-xs font-semibold" style={{ color: accentColor }}>
                    {routeTargetPersonaData.arcana} &bull; Lv. {routeTargetPersonaData.level}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-white/10">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-white truncate">
                    {skillRouteTarget}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {routeTargetPersonaData
                      ? `${routeTargetPersonaData.arcana} &bull; Base Lv. ${routeTargetPersonaData.level}`
                      : 'Selected Persona'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setIsRouteTargetPickerOpen(!isRouteTargetPickerOpen);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-white/15 bg-white/5 hover:bg-white/10 text-white shrink-0"
                >
                  {isRouteTargetPickerOpen ? 'Done' : 'Change'}
                </button>
              </div>

              {/* Target Picker Dropdown */}
              {isRouteTargetPickerOpen && (
                <div className="space-y-2 pt-1 animate-fadeIn">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search personas..."
                      value={searchRouteTargetQuery}
                      onChange={(e) => setSearchRouteTargetQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 divide-y divide-white/5">
                    {filteredRouteTargetPersonas.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          triggerHaptic('selection');
                          setSkillRouteTarget(p.name);
                          setIsRouteTargetPickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          p.name === skillRouteTarget
                            ? 'bg-white/15 text-white font-bold'
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-[10px] text-zinc-400">
                          {p.arcana} Lv.{p.level}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desired Skills Selection Card */}
            <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Desired Skills ({skillRouteSkills.length})
                </span>
                {skillRouteSkills.length > 0 && (
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setSkillRouteSkills([]);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Chosen Skills Chips */}
              <div className="min-h-[52px] p-2 rounded-xl bg-zinc-950/80 border border-white/10 flex flex-wrap gap-1.5 items-center">
                {skillRouteSkills.length === 0 ? (
                  <span className="text-xs text-zinc-500 px-1">
                    Select 1 or more skills below to calculate routes
                  </span>
                ) : (
                  skillRouteSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center gap-1.5"
                    >
                      <span>{sk}</span>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setSkillRouteSkills((prev) => prev.filter((s) => s !== sk));
                        }}
                        className="hover:text-white"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Custom Skill Button & Picker */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setIsSkillPickerOpen(!isSkillPickerOpen);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSkillPickerOpen ? 'Close Skill Picker' : '+ Add Custom Skill'}</span>
                  </button>
                </div>

                {isSkillPickerOpen && (
                  <div className="space-y-2 p-2.5 bg-zinc-950 rounded-xl border border-white/10 animate-fadeIn">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search skill to add..."
                        value={searchSkillQuery}
                        onChange={(e) => setSearchSkillQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto no-scrollbar flex flex-wrap gap-1.5 pt-1">
                      {filteredSkillsForPicker.map((sk) => {
                        const isSelected = skillRouteSkills.includes(sk);
                        return (
                          <button
                            key={sk}
                            onClick={() => {
                              triggerHaptic('selection');
                              if (isSelected) {
                                setSkillRouteSkills((prev) => prev.filter((s) => s !== sk));
                              } else {
                                setSkillRouteSkills((prev) => [...prev, sk]);
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400'
                                : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Popular Skills Pill Strip */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Quick-Add High Value Skills:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSkills.map((skName) => {
                const isSelected = skillRouteSkills.includes(skName);
                return (
                  <button
                    key={skName}
                    onClick={() => {
                      triggerHaptic('selection');
                      if (isSelected) {
                        setSkillRouteSkills((prev) => prev.filter((s) => s !== skName));
                      } else {
                        setSkillRouteSkills((prev) => [...prev, skName]);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl font-semibold border transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400 shadow-sm'
                        : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {skName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route Blueprint Results */}
          {!skillRouteResults ? (
            <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-dashed border-white/10 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-amber-400/60" />
              <p className="text-sm font-bold text-zinc-200">
                Skill Inheritance Blueprint Planner
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Select a <strong>Target Persona</strong> and one or more <strong>Desired Skills</strong> above.
                The solver will automatically calculate natural unlocks, Velvet Room itemization cards,
                and complete multi-part fusion blueprints!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 1. Natural Skills Banner */}
              {skillRouteResults.naturalSkills.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-emerald-300 uppercase tracking-wider block">
                      Learned Naturally by {skillRouteTarget}
                    </span>
                    <p className="text-emerald-100/90 leading-relaxed">
                      <strong>{skillRouteTarget}</strong> already learns:{' '}
                      {skillRouteResults.naturalSkills
                        .map((n) => `${n.skill} (${n.atLevel})`)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Velvet Room Itemization Banner */}
              {Object.keys(skillRouteResults.itemizers).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ★
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-amber-300 uppercase tracking-wider block">
                      Velvet Room Itemization Skill Cards Available
                    </span>
                    <div className="space-y-1 text-zinc-300">
                      {Object.entries(skillRouteResults.itemizers).map(([skName, list]) => {
                        const itList = (list || []) as Array<{ name: string; isAlarm: boolean }>;
                        return (
                          <div key={skName} className="text-xs">
                            <strong className="text-amber-200">{skName}</strong> via:{' '}
                            {itList
                              .map((it) => `${it.name}${it.isAlarm ? ' (Fusion Alarm)' : ''}`)
                              .join(', ')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Multi-Parent Fusion Trees (for 2+ skills) */}
              {skillRouteResults.multiTrees.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Multi-Part Fusion Blueprints ({skillRouteResults.multiTrees.length} Plans Found)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {skillRouteResults.multiTrees.map((tree, idx) => {
                      if (tree.type === 'special_multi') {
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 shadow-md"
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                                Special Multi-Tree Plan #{idx + 1}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {tree.branches.length} Prepared Ingredients
                              </span>
                            </div>

                            {/* Sub Branches */}
                            <div className="space-y-2">
                              {tree.branches.map((b, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-xs space-y-1"
                                >
                                  <div className="font-bold" style={{ color: accentColor }}>
                                    Part {bIdx + 1}: Craft {b.targetIngredient} carrying {b.skill}
                                  </div>
                                  {b.route.type === 'direct_learner' ? (
                                    <div className="text-zinc-300">
                                      Train ingredient{' '}
                                      <strong className="text-white">{b.targetIngredient}</strong> to{' '}
                                      <strong>{b.route.atLevel}</strong> (learns {b.skill} naturally).
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5 text-zinc-300">
                                      <div>
                                        1. Train{' '}
                                        <strong className="text-white">{b.route.source.name}</strong> to{' '}
                                        <strong>{b.route.source.atLevel}</strong> to learn {b.skill}.
                                      </div>
                                      <div>
                                        2. Fuse{' '}
                                        <strong className="text-white">{b.route.source.name}</strong> +{' '}
                                        <strong className="text-white">{b.route.partner.name}</strong>{' '}
                                        = <strong className="text-amber-300">{b.targetIngredient}</strong>{' '}
                                        (inherits {b.skill}).
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Final Merge */}
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-1">
                              <div className="font-extrabold text-amber-300 uppercase tracking-wider">
                                Final Step: Complete Special Fusion
                              </div>
                              <p className="text-zinc-200">
                                Combine all prepared ingredients (
                                <strong className="text-white">{tree.ingredients.join(' + ')}</strong>
                                ) in the Velvet Room &rarr;{' '}
                                <strong style={{ color: accentColor }}>{tree.targetName}</strong> inheriting ALL desired skills!
                              </p>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 shadow-md"
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                                Multi-Part Fusion Blueprint #{idx + 1}
                              </span>
                              <span className="text-[11px] text-zinc-400">2 Parent Branches + Merge</span>
                            </div>

                            <div className="space-y-2">
                              {/* Branch A */}
                              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-xs space-y-1">
                                <div className="font-bold" style={{ color: accentColor }}>
                                  Part 1 (Branch A): Craft {tree.parentA.name} carrying {tree.parentA.skill}
                                </div>
                                {tree.parentA.route.type === 'direct_learner' ? (
                                  <div className="text-zinc-300">
                                    Train <strong className="text-white">{tree.parentA.name}</strong> to{' '}
                                    <strong>{tree.parentA.route.atLevel}</strong> (learns {tree.parentA.skill} naturally).
                                  </div>
                                ) : (
                                  <div className="space-y-0.5 text-zinc-300">
                                    <div>
                                      1. Train{' '}
                                      <strong className="text-white">{tree.parentA.route.source.name}</strong>{' '}
                                      to <strong>{tree.parentA.route.source.atLevel}</strong> to learn{' '}
                                      {tree.parentA.skill}.
                                    </div>
                                    <div>
                                      2. Fuse{' '}
                                      <strong className="text-white">{tree.parentA.route.source.name}</strong>{' '}
                                      +{' '}
                                      <strong className="text-white">{tree.parentA.route.partner.name}</strong>{' '}
                                      ={' '}
                                      <strong className="text-amber-300">{tree.parentA.name}</strong>{' '}
                                      (inherits {tree.parentA.skill}).
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Branch B */}
                              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-xs space-y-1">
                                <div className="font-bold text-amber-300">
                                  Part 2 (Branch B): Craft {tree.parentB.name} carrying {tree.parentB.skill}
                                </div>
                                {tree.parentB.route.type === 'direct_learner' ? (
                                  <div className="text-zinc-300">
                                    Train <strong className="text-white">{tree.parentB.name}</strong> to{' '}
                                    <strong>{tree.parentB.route.atLevel}</strong> (learns {tree.parentB.skill} naturally).
                                  </div>
                                ) : (
                                  <div className="space-y-0.5 text-zinc-300">
                                    <div>
                                      1. Train{' '}
                                      <strong className="text-white">{tree.parentB.route.source.name}</strong>{' '}
                                      to <strong>{tree.parentB.route.source.atLevel}</strong> to learn{' '}
                                      {tree.parentB.skill}.
                                    </div>
                                    <div>
                                      2. Fuse{' '}
                                      <strong className="text-white">{tree.parentB.route.source.name}</strong>{' '}
                                      +{' '}
                                      <strong className="text-white">{tree.parentB.route.partner.name}</strong>{' '}
                                      ={' '}
                                      <strong className="text-amber-300">{tree.parentB.name}</strong>{' '}
                                      (inherits {tree.parentB.skill}).
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Final Merge */}
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1">
                                <div className="font-extrabold text-emerald-300 uppercase tracking-wider">
                                  Final Step: Merge Branches
                                </div>
                                <p className="text-zinc-200">
                                  Fuse <strong className="text-white">{tree.parentA.name}</strong>{' '}
                                  (carries {tree.parentA.skill}) +{' '}
                                  <strong className="text-white">{tree.parentB.name}</strong>{' '}
                                  (carries {tree.parentB.skill}) &rarr;{' '}
                                  <strong style={{ color: accentColor }}>{tree.targetName}</strong> with BOTH skills!
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}

              {/* 4. Single Skill Direct & 2-Step Pathways */}
              {skillRouteResults.neededSkills.length === 1 && (
                <div className="space-y-2.5">
                  {/* Direct Routes */}
                  {skillRouteResults.singleDirectRoutes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        Direct 1-Step Fusion Routes ({skillRouteResults.singleDirectRoutes.length})
                      </h4>
                      <div className="space-y-1.5">
                        {skillRouteResults.singleDirectRoutes.slice(0, 15).map((route, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-bold text-amber-300">
                                {route.source.name} ({route.source.atLevel})
                              </span>
                              <span className="text-zinc-500">+</span>
                              <span className="font-bold text-zinc-200">
                                {route.partner ? route.partner.name : route.allIngredients?.join(' + ')}
                              </span>
                              <span className="text-zinc-500">&rarr;</span>
                              <span className="font-bold text-white">{route.targetName}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                              Inherits {route.skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2-Step Routes */}
                  {skillRouteResults.singleTwoStepRoutes.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        2-Step Inheritance Pathways ({skillRouteResults.singleTwoStepRoutes.length})
                      </h4>
                      <div className="space-y-2">
                        {skillRouteResults.singleTwoStepRoutes.slice(0, 10).map((r, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 rounded-xl bg-zinc-900 border border-white/10 space-y-1.5 text-xs"
                          >
                            <div className="font-bold text-zinc-300">
                              Step 1: Train <strong className="text-amber-300">{r.source.name}</strong> to{' '}
                              <strong>{r.source.atLevel}</strong> to learn {r.skill}
                            </div>
                            <div className="text-zinc-400">
                              Step 2: Fuse <strong>{r.step1.p1}</strong> + <strong>{r.step1.p2}</strong> ={' '}
                              <strong className="text-white">{r.step1.result}</strong> (inheriting {r.skill})
                            </div>
                            <div className="text-emerald-300">
                              Step 3: Fuse <strong>{r.step1.result}</strong> +{' '}
                              <strong>{r.step2.p2 || 'Partner'}</strong> ={' '}
                              <strong className="text-white">{r.step2.result}</strong> (carries {r.skill})!
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
