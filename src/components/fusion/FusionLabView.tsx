import { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Plus, ArrowRight, X, ChevronRight } from 'lucide-react';
import { PersonaData, FusionChart, SpecialFusions } from '../../types/persona';
import { calcReverseRecipes, calcForwardFusion, buildFissionTable } from '../../utils/fusionCalc';
import { triggerHaptic } from '../../utils/haptics';
import { IosSegmentedControl } from '../ios/IosSegmentedControl';

interface FusionLabViewProps {
  personas: PersonaData[];
  fusionChart: FusionChart | null;
  specialFusions: SpecialFusions;
  accentColor: string;
  initialTarget?: string;
  isTriangular?: boolean;
}

type FusionMode = 'reverse' | 'forward' | 'special';

export const FusionLabView = ({
  personas,
  fusionChart,
  specialFusions,
  accentColor,
  initialTarget,
  isTriangular = false
}: FusionLabViewProps) => {
  const [mode, setMode] = useState<FusionMode>('reverse');

  // Reverse mode state
  const [selectedTargetName, setSelectedTargetName] = useState<string>(
    initialTarget || personas[0]?.name || 'Arsene'
  );
  const [searchTargetQuery, setSearchTargetQuery] = useState('');

  // Forward mode slots
  const [slot1, setSlot1] = useState<string>('');
  const [slot2, setSlot2] = useState<string>('');
  const [slot3, setSlot3] = useState<string>('');

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
      setMode('reverse');
    }
  }, [initialTarget, personaMap]);

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

  // Search filtered personas for selector
  const filteredPersonas = useMemo(() => {
    const q = searchTargetQuery.toLowerCase().trim();
    if (!q) return personas.slice(0, 15);
    return personas.filter((p) => p.name.toLowerCase().includes(q) || p.arcana.toLowerCase().includes(q));
  }, [personas, searchTargetQuery]);

  const targetPersona = personaMap[selectedTargetName];

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
    </div>
  );
};
