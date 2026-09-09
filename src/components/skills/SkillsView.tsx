import React, { useState, useMemo } from 'react';
import { Search, Zap, X, Shield, Sparkles, Filter, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { GameId, PersonaData } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';
import { ElementIcon } from '../common/ElementIcon';

interface SkillsViewProps {
  skills: any[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
  personas?: PersonaData[];
  onTransferToPersona?: (skillName: string) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  accentColor,
  personas = [],
  onTransferToPersona
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  // Skill learners index
  const skillLearnersMap = useMemo(() => {
    const map: Record<string, { name: string; level: number; atLevel: string }[]> = {};
    if (!personas) return map;
    personas.forEach((p) => {
      if (p.skills) {
        Object.entries(p.skills).forEach(([sName, lvl]) => {
          const key = sName.toLowerCase().trim();
          if (!map[key]) map[key] = [];
          const num = Number(lvl) || 0;
          const atLevel = num < 1 ? 'Innate' : num >= 100 ? 'Special' : `Lv. ${Math.floor(num)}`;
          map[key].push({
            name: p.name,
            level: p.level || 1,
            atLevel
          });
        });
      }
    });
    // Sort learners by level
    Object.values(map).forEach((list) => list.sort((a, b) => a.level - b.level));
    return map;
  }, [personas]);

  // Unique elements
  const elements = useMemo(() => {
    const set = new Set<string>();
    skills.forEach((sk) => {
      if (sk.element && sk.element !== 'Special') {
        set.add(sk.element);
      }
    });
    return Array.from(set).sort();
  }, [skills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return skills.filter((sk) => {
      if (
        q &&
        !sk.name?.toLowerCase().includes(q) &&
        !sk.effect?.toLowerCase().includes(q) &&
        !sk.element?.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (selectedElement !== 'all' && sk.element !== selectedElement) {
        return false;
      }
      return true;
    });
  }, [skills, searchQuery, selectedElement]);

  return (
    <div className="space-y-3.5">
      {/* Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search skills, element spells, or effects..."
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

        {/* Element Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => {
              triggerHaptic('selection');
              setSelectedElement('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedElement === 'all'
                ? 'text-zinc-900 bg-white shadow-md'
                : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
            }`}
          >
            All Elements ({skills.length})
          </button>
          {elements.map((el) => (
            <button
              key={el}
              onClick={() => {
                triggerHaptic('selection');
                setSelectedElement(el);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedElement === el
                  ? 'text-zinc-900 bg-white shadow-md'
                  : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
              }`}
            >
              <ElementIcon
                elementKey={el.toLowerCase()}
                className="w-3 h-3 shrink-0"
                fallbackText={el}
              />
              {el}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
        <span>
          Showing <strong className="text-zinc-200">{filteredSkills.length}</strong> Skills
        </span>
        <span className="text-zinc-500">SP / HP Cost & Target</span>
      </div>

      {/* Skills List */}
      <div className="space-y-2">
        {filteredSkills.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <Zap className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">No skills found</p>
            <p className="text-xs">Try adjusting your search terms or element filter.</p>
          </div>
        ) : (
          filteredSkills.slice(0, 150).map((sk, idx) => (
            <div
              key={`${sk.name}-${idx}`}
              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all space-y-2 shadow-sm"
            >
              {/* Header: Element icon, Skill name, Cost pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                    <ElementIcon
                      elementKey={sk.element?.toLowerCase() || 'special'}
                      className="w-4 h-4"
                      fallbackText={sk.element}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-white tracking-tight">
                      {sk.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
                      <span>{sk.element || 'Special'}</span>
                      {sk.target && sk.target !== '-' && (
                        <span>&bull; Target: {sk.target}</span>
                      )}
                    </div>
                  </div>
                </div>

                {sk.cost && (
                  <div className="shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                        sk.cost.includes('HP')
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                      }`}
                    >
                      {sk.cost}
                    </span>
                  </div>
                )}
              </div>

              {/* Skill Description */}
              {sk.effect && (
                <p className="text-xs text-zinc-300 leading-relaxed font-normal bg-black/25 p-2 rounded-xl border border-white/5">
                  {sk.effect}
                </p>
              )}

              {/* Learners and Transfer to Persona Route */}
              {(() => {
                const learners = skillLearnersMap[sk.name.toLowerCase().trim()] || [];
                const isExpanded = expandedSkill === sk.name;

                return (
                  <div className="pt-1 space-y-2 border-t border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setExpandedSkill(isExpanded ? null : sk.name);
                        }}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                      >
                        <span>
                          {learners.length > 0
                            ? `Learned by ${learners.length} Persona${learners.length === 1 ? '' : 's'}`
                            : 'No natural learners'}
                        </span>
                        {learners.length > 0 &&
                          (isExpanded ? (
                            <ChevronUp className="w-3 h-3 text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                          ))}
                      </button>

                      {onTransferToPersona && (
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            onTransferToPersona(sk.name);
                          }}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all text-white shadow-sm hover:brightness-110 active:scale-95 shrink-0"
                          style={{
                            backgroundColor: accentColor,
                            boxShadow: `0 2px 10px ${accentColor}40`
                          }}
                          title={`Plan fusion route to inherit ${sk.name} on any Persona`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Inherit / Route</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Expandable Learners list */}
                    {isExpanded && learners.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1.5 animate-fadeIn">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          Natural Learners & Unlock Levels:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {learners.map((lr) => (
                            <span
                              key={lr.name}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 flex items-center gap-1.5"
                            >
                              <span className="font-bold text-white">{lr.name}</span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                ({lr.atLevel})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
