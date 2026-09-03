import { useState, useMemo } from 'react';
import { Search, Heart, Shield, Sparkles, Filter, ChevronRight, X, Zap, Swords } from 'lucide-react';
import { PersonaData, GameId } from '../../types/persona';
import { GAME_ELEMENTS, RESIST_MAP } from '../../utils/dataLoader';
import { triggerHaptic } from '../../utils/haptics';
import { IosBottomSheet } from '../ios/IosBottomSheet';
import { ElementIcon } from '../common/ElementIcon';

interface CompendiumViewProps {
  personas: PersonaData[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
  onSelectForFusion?: (personaName: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (personaName: string) => void;
  skillsData?: any[];
}

export const CompendiumView = ({
  personas,
  series,
  accentColor,
  onSelectForFusion,
  favorites,
  onToggleFavorite,
  skillsData = []
}: CompendiumViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArcana, setSelectedArcana] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaData | null>(null);

  // Index skills by name for quick lookup in the status sheet
  const skillLookup = useMemo(() => {
    const map: Record<string, { element?: string; cost?: string; effect?: string; target?: string }> = {};
    skillsData.forEach((s) => {
      if (s && s.name) {
        map[s.name.toLowerCase()] = s;
      }
    });
    return map;
  }, [skillsData]);

  // Extract unique Arcana list
  const arcanaList = useMemo(() => {
    const set = new Set<string>();
    personas.forEach((p) => {
      if (p.arcana) set.add(p.arcana);
    });
    return Array.from(set).sort();
  }, [personas]);

  // Filtered Personas
  const filteredPersonas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return personas.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.arcana.toLowerCase().includes(q)) {
        return false;
      }
      if (selectedArcana !== 'all' && p.arcana !== selectedArcana) {
        return false;
      }
      if (onlyFavorites && !favorites.has(p.name)) {
        return false;
      }
      return true;
    });
  }, [personas, searchQuery, selectedArcana, onlyFavorites, favorites]);

  const elements = GAME_ELEMENTS[series] || GAME_ELEMENTS.p5;

  return (
    <div className="space-y-3">
      {/* iOS Cupertino Search Bar */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4 stroke-[2.2]" />
        </div>
        <input
          id="compendium-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Personas, Arcana..."
          className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              triggerHaptic('light');
              setSearchQuery('');
            }}
            className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Filter Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <button
          onClick={() => {
            triggerHaptic('light');
            setOnlyFavorites((prev) => !prev);
          }}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all whitespace-nowrap border ${
            onlyFavorites
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
              : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-zinc-200'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
          <span>Favorites</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setSelectedArcana('all');
          }}
          className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap border ${
            selectedArcana === 'all'
              ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-zinc-200'
          }`}
        >
          All Arcana ({personas.length})
        </button>

        {arcanaList.map((arcana) => {
          const isSelected = selectedArcana === arcana;
          return (
            <button
              key={arcana}
              onClick={() => {
                triggerHaptic('light');
                setSelectedArcana(arcana);
              }}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-zinc-200'
              }`}
            >
              {arcana}
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
        <span>Showing {filteredPersonas.length} Personas</span>
        {selectedArcana !== 'all' && (
          <button
            onClick={() => setSelectedArcana('all')}
            className="text-[11px] underline text-zinc-400 hover:text-zinc-200"
          >
            Reset Arcana
          </button>
        )}
      </div>

      {/* Persona Cards List with Persona Art Flair */}
      <div className="space-y-2.5">
        {filteredPersonas.map((persona) => {
          const isFav = favorites.has(persona.name);
          const resists = persona.resists || '';

          return (
            <div
              key={persona.name}
              id={`persona-card-${persona.name}`}
              onClick={() => {
                triggerHaptic('light');
                setSelectedPersona(persona);
              }}
              className="relative overflow-hidden p-3.5 bg-zinc-900/80 hover:bg-zinc-900 active:bg-zinc-800/90 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-150 flex flex-col gap-2.5 cursor-pointer shadow-md group"
            >
              {/* Subtle series-tinted corner highlight */}
              <div
                className="absolute top-0 right-0 w-32 h-16 pointer-events-none opacity-10 transition-opacity group-hover:opacity-20 blur-xl"
                style={{ backgroundColor: accentColor }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Persona Level Badge with Game-Accurate Styling */}
                  <div
                    className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-white shadow-md shrink-0 border ${
                      series === 'p5' ? 'transform -skew-x-3' : ''
                    }`}
                    style={{
                      backgroundColor: `${accentColor}25`,
                      borderColor: `${accentColor}50`
                    }}
                  >
                    <span className="text-[9px] text-zinc-400 uppercase font-sans tracking-tight font-extrabold">
                      Lv
                    </span>
                    <span
                      className="text-base leading-none font-black font-mono tracking-tight"
                      style={{ color: accentColor }}
                    >
                      {persona.level}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                        {persona.name}
                      </h3>
                      {persona.isDlc && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 uppercase tracking-wider">
                          DLC
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-zinc-400 font-semibold">{persona.arcana}</span>
                      <span className="text-[10px] text-zinc-600">&bull;</span>
                      <span className="text-[11px] text-zinc-500">
                        {Object.keys(persona.skills || {}).length} Skills
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('medium');
                      onToggleFavorite(persona.name);
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform active:scale-125 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-500'
                      }`}
                    />
                  </button>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Game-Authentic Elemental Affinity Grid with Official Icons */}
              {resists && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-white/[0.06]">
                  {elements.map((elem, idx) => {
                    const code = resists[idx] || '-';
                    const isWeak = code === 'w';
                    const isResist = code === 's';
                    const isNull = code === 'n';
                    const isDrain = code === 'd';
                    const isRepel = code === 'r';

                    return (
                      <div
                        key={elem.key}
                        className="flex-1 min-w-[30px] p-1 rounded-lg bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-0.5"
                      >
                        {/* Official Sprite SVG Icon */}
                        <ElementIcon element={elem.iconKey} size="xs" showBackground={false} />
                        
                        {/* Resistance Label */}
                        <span
                          className={`text-[9px] font-mono font-bold leading-none ${
                            isWeak
                              ? 'text-rose-400 bg-rose-500/20 px-1 py-0.5 rounded'
                              : isDrain
                              ? 'text-emerald-300 bg-emerald-500/20 px-1 py-0.5 rounded'
                              : isRepel
                              ? 'text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded'
                              : isNull
                              ? 'text-purple-300 bg-purple-500/20 px-1 py-0.5 rounded'
                              : isResist
                              ? 'text-sky-300 bg-sky-500/20 px-1 py-0.5 rounded'
                              : 'text-zinc-600'
                          }`}
                        >
                          {isWeak
                            ? 'Wk'
                            : isDrain
                            ? 'Drn'
                            : isRepel
                            ? 'Rpl'
                            : isNull
                            ? 'Nul'
                            : isResist
                            ? 'Res'
                            : '–'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredPersonas.length === 0 && (
          <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5 space-y-2">
            <Filter className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No Personas found</p>
            <p className="text-xs text-zinc-500">Try adjusting your search or Arcana filter</p>
          </div>
        )}
      </div>

      {/* Persona Status Screen / Detail Bottom Sheet */}
      {selectedPersona && (
        <IosBottomSheet
          isOpen={Boolean(selectedPersona)}
          onClose={() => setSelectedPersona(null)}
          title={selectedPersona.name}
          subtitle={`${selectedPersona.arcana} Arcana &bull; Base Level ${selectedPersona.level}`}
          accentColor={accentColor}
        >
          {/* Quick Action Button for Fusion */}
          {onSelectForFusion && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                const name = selectedPersona.name;
                setSelectedPersona(null);
                onSelectForFusion(name);
              }}
              className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] border border-white/20"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Calculate Fusion Recipes for {selectedPersona.name}</span>
            </button>
          )}

          {/* Base Stats Section (St, Ma, En, Ag, Lu) */}
          <div className="p-4 bg-zinc-950/70 rounded-2xl border border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" style={{ color: accentColor }} /> Base Parameters
              </h4>
              <span className="text-[11px] font-mono text-zinc-500">Max Cap: 99</span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {['St', 'Ma', 'En', 'Ag', 'Lu'].map((label, i) => {
                const statVal = selectedPersona.stats[i] || 0;
                const statNames = ['Strength', 'Magic', 'Endurance', 'Agility', 'Luck'];
                return (
                  <div
                    key={label}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5 flex flex-col items-center justify-between"
                    title={statNames[i]}
                  >
                    <span className="text-[10px] uppercase font-black text-zinc-400 block">{label}</span>
                    <span className="text-base font-extrabold font-mono text-zinc-100 my-0.5">
                      {statVal}
                    </span>
                    <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (statVal / 99) * 100)}%`,
                          backgroundColor: accentColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Elemental Resistances Grid with Official SVG Symbols */}
          <div className="p-4 bg-zinc-950/70 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Elemental Resistances & Affinities
            </h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {elements.map((elem, idx) => {
                const code = (selectedPersona.resists || '')[idx] || '-';
                const isWeak = code === 'w';
                const isResist = code === 's';
                const isNull = code === 'n';
                const isDrain = code === 'd';
                const isRepel = code === 'r';

                const label = isWeak
                  ? 'Weak'
                  : isDrain
                  ? 'Drain'
                  : isRepel
                  ? 'Repel'
                  : isNull
                  ? 'Null'
                  : isResist
                  ? 'Resist'
                  : 'Normal';

                const colorClass = isWeak
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : isDrain
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                  : isRepel
                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  : isNull
                  ? 'text-purple-300 bg-purple-500/10 border-purple-500/30'
                  : isResist
                  ? 'text-sky-300 bg-sky-500/10 border-sky-500/30'
                  : 'text-zinc-500 bg-zinc-900/50 border-white/5';

                return (
                  <div
                    key={elem.key}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${colorClass}`}
                  >
                    <ElementIcon element={elem.iconKey} size="sm" showBackground={false} />
                    <span className="text-[9px] font-extrabold uppercase tracking-tight font-mono">
                      {elem.name}
                    </span>
                    <span className="text-[10px] font-bold font-mono">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trait & Electric Chair Itemization */}
          {(selectedPersona.trait || selectedPersona.item) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedPersona.trait && (
                <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Persona Trait
                  </span>
                  <p className="font-semibold text-zinc-100 text-sm">{selectedPersona.trait}</p>
                </div>
              )}
              {selectedPersona.item && (
                <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-400" /> Electric Chair Itemization
                  </span>
                  <p className="font-semibold text-amber-300 text-sm">{selectedPersona.item}</p>
                  {selectedPersona.itemr && (
                    <p className="text-xs text-rose-300 flex items-center gap-1">
                      <span className="text-[9px] uppercase px-1 rounded bg-rose-500/20 font-bold border border-rose-500/30">
                        Alarm
                      </span>
                      {selectedPersona.itemr}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Detailed Skillset with Element Icons & Cost */}
          <div className="p-4 bg-zinc-950/70 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Skillset & Techniques
              </h4>
              <span className="text-[11px] text-zinc-500">
                {Object.keys(selectedPersona.skills || {}).length} Total
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {Object.entries(selectedPersona.skills || {}).map(([skillName, levelReq]) => {
                const lvl = Number(levelReq) || 0;
                const isLearnedAt =
                  lvl < 1 ? 'Innate' : lvl >= 100 ? 'Special' : `Lv. ${Math.floor(lvl)}`;

                const detail = skillLookup[skillName.toLowerCase()];

                return (
                  <div key={skillName} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {detail?.element && (
                        <div className="mt-0.5">
                          <ElementIcon element={detail.element} size="xs" showBackground={true} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-100">{skillName}</span>
                          {detail?.cost && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-semibold border border-white/5">
                              {detail.cost}
                            </span>
                          )}
                        </div>
                        {detail?.effect && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                            {detail.effect}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10 shrink-0">
                      {isLearnedAt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </IosBottomSheet>
      )}
    </div>
  );
};

