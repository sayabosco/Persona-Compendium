import React, { useState, useMemo } from 'react';
import {
  Search,
  Shield,
  Skull,
  Crosshair,
  MapPin,
  ChevronRight,
  Zap,
  Gift,
  Coins,
  Sparkles,
  Swords,
  X
} from 'lucide-react';
import { EnemyData, GameId } from '../../types/persona';
import { GAME_ELEMENTS, RESIST_MAP } from '../../utils/dataLoader';
import { triggerHaptic } from '../../utils/haptics';
import { ElementIcon } from '../common/ElementIcon';
import { IosBottomSheet } from '../ios/IosBottomSheet';

interface EnemiesViewProps {
  enemies: EnemyData[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
  skillsData?: any[];
  negotiationData?: any;
}

export const EnemiesView: React.FC<EnemiesViewProps> = ({
  enemies,
  series,
  accentColor,
  skillsData = [],
  negotiationData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'bosses' | 'miniboss'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyData | null>(null);

  // Negotiation lookup for shadows (best outcome, personality, tips)
  const shadowNegoMap = useMemo(() => {
    const map: Record<
      string,
      {
        personality: string;
        color: string;
        best_type: string;
        ok_type: string;
        bad_type: string;
        description?: string;
      }
    > = {};

    const matrix: Record<string, any> = negotiationData?.p5?.personality_matrix || {
      Upbeat: {
        color: '#FFB74D',
        best_type: 'Funny / Joke',
        ok_type: 'Serious',
        bad_type: 'Vague / Ambiguous',
        description: 'High energy and cheerful. Loves clever, funny, and witty remarks. Dislikes indecisive or vague answers.'
      },
      Timid: {
        color: '#81C784',
        best_type: 'Kind / Gentle',
        ok_type: 'Vague / Ambiguous',
        bad_type: 'Funny / Joke',
        description: 'Easily frightened and cautious. Responds best to kindness, empathy, and gentleness. Never joke or tease them.'
      },
      Gloomy: {
        color: '#64B5F6',
        best_type: 'Vague / Ambiguous',
        ok_type: 'Serious',
        bad_type: 'Kind / Gentle',
        description: 'Melancholy and cynical. Prefers mysterious, casual, or vague replies. Dislikes overly sweet sympathy.'
      },
      Irritable: {
        color: '#E57373',
        best_type: 'Serious / Direct',
        ok_type: 'Vague / Ambiguous',
        bad_type: 'Kind / Gentle',
        description: 'Aggressive and impatient. Demands direct, serious, and no-nonsense responses. Hates soft, timid excuses.'
      }
    };

    const shadows = negotiationData?.p5?.shadows || [];
    shadows.forEach((sh: any) => {
      const pInfo = matrix[sh.personality] || {
        color: '#FFB74D',
        best_type:
          sh.personality === 'Upbeat'
            ? 'Funny'
            : sh.personality === 'Timid'
            ? 'Kind'
            : sh.personality === 'Gloomy'
            ? 'Vague'
            : 'Serious',
        ok_type: 'Serious',
        bad_type: 'Vague'
      };
      const entry = {
        personality: sh.personality,
        color: pInfo.color,
        best_type: pInfo.best_type || pInfo.likes || 'Kind',
        ok_type: pInfo.ok_type || pInfo.neutral || 'Serious',
        bad_type: pInfo.bad_type || pInfo.hates || 'Vague',
        description: pInfo.description
      };
      if (sh.name) map[sh.name.toLowerCase().trim()] = entry;
      if (sh.persona_name) map[sh.persona_name.toLowerCase().trim()] = entry;
    });

    return { map, matrix };
  }, [negotiationData]);

  // Index skills for quick effect preview
  const skillLookup = useMemo(() => {
    const map: Record<string, any> = {};
    skillsData.forEach((s) => {
      if (s && s.name) {
        map[s.name.toLowerCase()] = s;
      }
    });
    return map;
  }, [skillsData]);

  // Unique areas
  const areasList = useMemo(() => {
    const set = new Set<string>();
    enemies.forEach((e) => {
      if (e.area && e.area !== 'Unknown' && e.area.trim() !== '') {
        set.add(e.area.trim());
      }
    });
    return Array.from(set).sort();
  }, [enemies]);

  // Filter enemies
  const filteredEnemies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return enemies.filter((e) => {
      if (
        q &&
        !e.name.toLowerCase().includes(q) &&
        !(e.persona_name && e.persona_name.toLowerCase().includes(q)) &&
        !(e.area && e.area.toLowerCase().includes(q)) &&
        !(e.arcana && e.arcana.toLowerCase().includes(q))
      ) {
        return false;
      }

      if (filterType === 'bosses' && !e.isBoss) return false;
      if (filterType === 'miniboss' && !e.isMiniBoss) return false;
      if (filterType === 'normal' && (e.isBoss || e.isMiniBoss)) return false;

      if (selectedArea !== 'all' && e.area !== selectedArea) {
        return false;
      }

      return true;
    });
  }, [enemies, searchQuery, filterType, selectedArea]);

  const [visibleCount, setVisibleCount] = useState<number>(40);

  React.useEffect(() => {
    setVisibleCount(40);
  }, [searchQuery, filterType, selectedArea, enemies]);

  const displayedEnemies = useMemo(() => {
    return filteredEnemies.slice(0, visibleCount);
  }, [filteredEnemies, visibleCount]);

  const elements = GAME_ELEMENTS[series] || GAME_ELEMENTS.p5;

  return (
    <div className="space-y-3.5">
      {/* Search and Quick Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search shadows, bosses, personas or areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => {
              triggerHaptic('selection');
              setFilterType('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'text-zinc-900 bg-white shadow-md'
                : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
            }`}
          >
            All ({enemies.length})
          </button>
          <button
            onClick={() => {
              triggerHaptic('selection');
              setFilterType('normal');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterType === 'normal'
                ? 'text-zinc-900 bg-white shadow-md'
                : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Regular
          </button>
          <button
            onClick={() => {
              triggerHaptic('selection');
              setFilterType('bosses');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterType === 'bosses'
                ? 'text-zinc-900 bg-white shadow-md'
                : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            Bosses
          </button>
          <button
            onClick={() => {
              triggerHaptic('selection');
              setFilterType('miniboss');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterType === 'miniboss'
                ? 'text-zinc-900 bg-white shadow-md'
                : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            Mini-Bosses
          </button>

          {/* Area Selector */}
          {areasList.length > 0 && (
            <select
              value={selectedArea}
              onChange={(e) => {
                triggerHaptic('selection');
                setSelectedArea(e.target.value);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-300 font-semibold focus:outline-none"
            >
              <option value="all">All Locations</option>
              {areasList.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
        <span>
          Showing <strong className="text-zinc-200">{filteredEnemies.length}</strong> Shadows
        </span>
        <span className="text-zinc-500">Tap enemy for full stats & drops</span>
      </div>

      {/* Enemies List */}
      <div className="space-y-2.5">
        {filteredEnemies.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <Shield className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">No Shadows found</p>
            <p className="text-xs">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          displayedEnemies.map((enemy, idx) => {
            const resists = enemy.resists || '';

            return (
              <div
                key={`${enemy.name}-${idx}`}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedEnemy(enemy);
                }}
                className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 hover:border-white/20 transition-all cursor-pointer space-y-2.5 shadow-sm active:scale-[0.99]"
              >
                {/* Header: Level, Name, Persona form, Boss Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Level Pill */}
                    <div
                      className="w-9 h-9 rounded-xl flex flex-col items-center justify-center font-black shrink-0 border shadow-sm"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        borderColor: `${accentColor}40`,
                        color: accentColor
                      }}
                    >
                      <span className="text-[8px] uppercase tracking-tighter opacity-80 leading-none">
                        LV
                      </span>
                      <span className="text-sm font-black leading-none">{enemy.level ?? '?'}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-extrabold text-white tracking-tight truncate">
                          {enemy.name}
                        </h4>
                        {enemy.isBoss && (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[9px] font-black uppercase">
                            Boss
                          </span>
                        )}
                        {enemy.isMiniBoss && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                            Mini-Boss
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        {enemy.persona_name && (
                          <span className="font-semibold text-zinc-300">
                            Persona: {enemy.persona_name}
                          </span>
                        )}
                        {enemy.arcana && (
                          <span className="text-zinc-500">&bull; {enemy.arcana}</span>
                        )}
                      </div>

                      {/* Negotiation Badge if shadow */}
                      {(() => {
                        const nego =
                          shadowNegoMap.map[enemy.name?.toLowerCase().trim()] ||
                          (enemy.persona_name
                            ? shadowNegoMap.map[enemy.persona_name.toLowerCase().trim()]
                            : null) ||
                          (enemy.personality
                            ? {
                                personality: enemy.personality,
                                ...(shadowNegoMap.matrix[enemy.personality] || {
                                  color: '#FFB74D',
                                  best_type: 'Funny',
                                  ok_type: 'Serious',
                                  bad_type: 'Vague'
                                })
                              }
                            : null);
                        if (!nego) return null;
                        return (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none"
                              style={{
                                backgroundColor: `${nego.color}20`,
                                borderColor: `${nego.color}40`,
                                color: nego.color
                              }}
                            >
                              {nego.personality}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 leading-none">
                              Best: {nego.best_type.split('/')[0].trim()}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* HP & SP Pill */}
                  <div className="text-right shrink-0">
                    {enemy.hp !== undefined && (
                      <div className="text-[11px] font-mono font-bold text-emerald-400">
                        {enemy.hp.toLocaleString()} <span className="text-[9px] text-zinc-400">HP</span>
                      </div>
                    )}
                    {enemy.sp !== undefined && enemy.sp > 0 && (
                      <div className="text-[10px] font-mono font-semibold text-sky-400">
                        {enemy.sp.toLocaleString()} <span className="text-[8px] text-zinc-400">SP</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resistances Strip using ElementIcon */}
                {resists.length > 0 && (
                  <div className="pt-1 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1 min-w-max">
                      {elements.map((el, elIdx) => {
                        const code = resists[elIdx] || '-';
                        const resInfo = RESIST_MAP[code] || RESIST_MAP['-'];
                        const isWeak = code === 'w';
                        const isRes = code !== '-';

                        return (
                          <div
                            key={el.key}
                            className={`px-1.5 py-1 rounded-lg flex flex-col items-center justify-center min-w-[28px] border transition-colors ${
                              isWeak
                                ? 'bg-rose-500/25 border-rose-500/50 shadow-sm'
                                : isRes
                                ? 'bg-zinc-800/90 border-white/10'
                                : 'bg-black/30 border-white/5 opacity-40'
                            }`}
                          >
                            <ElementIcon
                              elementKey={el.iconKey}
                              className="w-3.5 h-3.5"
                              fallbackText={el.name}
                            />
                            <span
                              className={`text-[8px] font-black uppercase mt-0.5 ${
                                isWeak
                                  ? 'text-rose-400 font-extrabold'
                                  : isRes
                                  ? resInfo.badgeClass
                                  : 'text-zinc-500'
                              }`}
                            >
                              {code === '-' ? '-' : resInfo.label.slice(0, 3)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer: Area & Drops badge */}
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                  <div className="flex items-center gap-1 truncate max-w-[220px]">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{enemy.area || 'Unknown Encounter'}</span>
                  </div>

                  {enemy.drops && (
                    <div className="flex items-center gap-1 text-zinc-300 font-medium">
                      <Gift className="w-3 h-3 text-amber-400" />
                      <span>
                        {typeof enemy.drops === 'object' && !Array.isArray(enemy.drops)
                          ? enemy.drops.item || enemy.drops.gem || 'Drops'
                          : Array.isArray(enemy.drops)
                          ? enemy.drops[0]
                          : 'Drops'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {filteredEnemies.length > visibleCount && (
          <div className="pt-2 pb-2 flex justify-center">
            <button
              onClick={() => {
                triggerHaptic('light');
                setVisibleCount((prev) => prev + 40);
              }}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-xs font-bold text-zinc-200 border border-white/10 hover:border-white/20 transition-all shadow-md flex items-center gap-2"
            >
              <span>Show More Shadows</span>
              <span className="text-zinc-500 font-normal">
                ({visibleCount} of {filteredEnemies.length})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Enemy Detailed Status Bottom Sheet */}
      {selectedEnemy && (
        <IosBottomSheet
          isOpen={Boolean(selectedEnemy)}
          onClose={() => setSelectedEnemy(null)}
          title={selectedEnemy.name}
          subtitle={
            selectedEnemy.persona_name
              ? `Persona: ${selectedEnemy.persona_name} • Lv ${selectedEnemy.level || '?'}`
              : `Arcana: ${selectedEnemy.arcana || 'Shadow'} • Lv ${selectedEnemy.level || '?'}`
          }
          accentColor={accentColor}
        >
          <div className="space-y-4 text-zinc-200">
            {/* Health & Mana & EXP Stat Card */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Health (HP)</span>
                <p className="text-base font-black text-emerald-400 mt-0.5 font-mono">
                  {selectedEnemy.hp?.toLocaleString() || 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Spirit (SP)</span>
                <p className="text-base font-black text-sky-400 mt-0.5 font-mono">
                  {selectedEnemy.sp?.toLocaleString() || 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Experience</span>
                <p className="text-base font-black text-amber-400 mt-0.5 font-mono">
                  {selectedEnemy.exp ? `+${selectedEnemy.exp}` : '-'}
                </p>
              </div>
            </div>

            {/* Base Stats Bars (if available) */}
            {selectedEnemy.stats && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Combat Attributes
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center pt-1">
                  {[
                    { label: 'St', val: selectedEnemy.stats.strength },
                    { label: 'Ma', val: selectedEnemy.stats.magic },
                    { label: 'En', val: selectedEnemy.stats.endurance },
                    { label: 'Ag', val: selectedEnemy.stats.agility },
                    { label: 'Lu', val: selectedEnemy.stats.luck }
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400">{stat.label}</span>
                      <div className="text-sm font-black text-white font-mono">{stat.val ?? '-'}</div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((stat.val || 1) / 99) * 100)}%`,
                            backgroundColor: accentColor
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Elemental Affinities */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Elemental Weaknesses & Resistances
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {elements.map((el, elIdx) => {
                  const code = (selectedEnemy.resists || '')[elIdx] || '-';
                  const resInfo = RESIST_MAP[code] || RESIST_MAP['-'];
                  const isWeak = code === 'w';

                  return (
                    <div
                      key={el.key}
                      className={`p-2 rounded-xl flex items-center gap-2 border ${
                        isWeak
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                          : code !== '-'
                          ? 'bg-zinc-800/80 border-white/10 text-zinc-200'
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500'
                      }`}
                    >
                      <ElementIcon
                        elementKey={el.iconKey}
                        className="w-4 h-4 shrink-0"
                        fallbackText={el.name}
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] block text-zinc-400 leading-none">{el.name}</span>
                        <span className="text-[11px] font-bold block mt-0.5 leading-none">
                          {resInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills Pool */}
            {selectedEnemy.skills && selectedEnemy.skills.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  Enemy Action Pool & Spells
                </h4>
                <div className="space-y-1.5 pt-1">
                  {selectedEnemy.skills.map((sName) => {
                    const sk = skillLookup[sName.toLowerCase()];
                    return (
                      <div
                        key={sName}
                        className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white">{sName}</span>
                          {sk?.effect && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                              {sk.effect}
                            </p>
                          )}
                        </div>
                        {sk?.cost && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-amber-300 font-semibold shrink-0">
                            {sk.cost}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shadow Negotiation Best Outcome Guide */}
            {(() => {
              const selectedNego =
                shadowNegoMap.map[selectedEnemy.name?.toLowerCase().trim()] ||
                (selectedEnemy.persona_name
                  ? shadowNegoMap.map[selectedEnemy.persona_name.toLowerCase().trim()]
                  : null) ||
                (selectedEnemy.personality
                  ? {
                      personality: selectedEnemy.personality,
                      ...(shadowNegoMap.matrix[selectedEnemy.personality] || {
                        color: '#FFB74D',
                        best_type: 'Funny',
                        ok_type: 'Serious',
                        bad_type: 'Vague'
                      })
                    }
                  : null);
              if (!selectedNego) return null;
              return (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Shadow Negotiation (Hold-Up)
                    </h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${selectedNego.color}25`,
                        borderColor: `${selectedNego.color}50`,
                        color: selectedNego.color
                      }}
                    >
                      {selectedNego.personality} Personality
                    </span>
                  </div>

                  {selectedNego.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {selectedNego.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wider">
                        Best [Likes]
                      </span>
                      <span className="text-xs font-black text-emerald-200 mt-1 block">
                        {selectedNego.best_type}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <span className="text-[9px] uppercase font-black text-amber-400 block tracking-wider">
                        Neutral [OK]
                      </span>
                      <span className="text-xs font-black text-amber-200 mt-1 block">
                        {selectedNego.ok_type}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
                      <span className="text-[9px] uppercase font-black text-rose-400 block tracking-wider">
                        Worst [Hates]
                      </span>
                      <span className="text-xs font-black text-rose-200 mt-1 block">
                        {selectedNego.bad_type}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-500 pt-1 flex items-center gap-1 border-t border-white/5">
                    <span>Knock down all Shadows &rarr; Talk &rarr; Give 2 positive responses to recruit!</span>
                  </div>
                </div>
              );
            })()}

            {/* Location & Drops */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400 font-medium">Palace / Dungeon Area:</span>
                <span className="font-bold text-white">{selectedEnemy.area || 'Unknown'}</span>
              </div>
              {selectedEnemy.drops && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400 font-medium">Dropped Item / Gem:</span>
                  <span className="font-bold text-amber-300">
                    {typeof selectedEnemy.drops === 'object' && !Array.isArray(selectedEnemy.drops)
                      ? [selectedEnemy.drops.gem, selectedEnemy.drops.item].filter(Boolean).join(', ')
                      : Array.isArray(selectedEnemy.drops)
                      ? selectedEnemy.drops.join(', ')
                      : 'None'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </IosBottomSheet>
      )}
    </div>
  );
};
