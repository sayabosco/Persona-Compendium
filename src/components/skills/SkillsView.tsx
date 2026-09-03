import React, { useState, useMemo } from 'react';
import { Search, Zap, X, Shield, Sparkles, Filter } from 'lucide-react';
import { GameId } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';
import { ElementIcon } from '../common/ElementIcon';

interface SkillsViewProps {
  skills: any[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  accentColor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState<string>('all');

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
            </div>
          ))
        )}
      </div>
    </div>
  );
};
