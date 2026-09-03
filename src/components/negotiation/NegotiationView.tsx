import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  Smile,
  Frown,
  Meh,
  Flame,
  X
} from 'lucide-react';
import { GameId } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';

interface NegotiationViewProps {
  negotiationData: any;
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
}

export const NegotiationView: React.FC<NegotiationViewProps> = ({
  negotiationData,
  accentColor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState<string>('all');

  const p5Data = negotiationData?.p5 || {};
  const personalityMatrix = p5Data?.personality_matrix || {
    Upbeat: {
      likes: 'Funny',
      neutral: 'Serious',
      hates: 'Vague',
      color: '#FFB74D',
      description: 'High energy and cheerful. Loves clever, funny, and witty remarks. Dislikes indecisive or vague answers.',
      best_type: 'Funny / Joke',
      ok_type: 'Serious',
      bad_type: 'Vague / Ambiguous'
    },
    Timid: {
      likes: 'Kind',
      neutral: 'Vague',
      hates: 'Funny',
      color: '#81C784',
      description: 'Easily frightened and cautious. Responds best to kindness, empathy, and gentleness. Never joke or tease them.',
      best_type: 'Kind / Gentle',
      ok_type: 'Vague / Ambiguous',
      bad_type: 'Funny / Joke'
    },
    Gloomy: {
      likes: 'Vague',
      neutral: 'Serious',
      hates: 'Kind',
      color: '#64B5F6',
      description: 'Melancholy and cynical. Prefers mysterious, casual, or vague replies. Dislikes overly sweet sympathy.',
      best_type: 'Vague / Ambiguous',
      ok_type: 'Serious',
      bad_type: 'Kind / Gentle'
    },
    Irritable: {
      likes: 'Serious',
      neutral: 'Vague',
      hates: 'Kind',
      color: '#E57373',
      description: 'Aggressive and impatient. Demands direct, serious, and no-nonsense responses. Hates soft, timid excuses.',
      best_type: 'Serious / Direct',
      ok_type: 'Vague / Ambiguous',
      bad_type: 'Kind / Gentle'
    }
  };

  const sunPerks = p5Data?.sun_confidant_perks || [];
  const mechanics = p5Data?.mechanics || [];
  const shadows: any[] = p5Data?.shadows || [];

  // Filter shadows
  const filteredShadows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return shadows.filter((s) => {
      if (
        q &&
        !s.name?.toLowerCase().includes(q) &&
        !s.persona_name?.toLowerCase().includes(q) &&
        !s.arcana?.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (selectedPersonality !== 'all' && s.personality !== selectedPersonality) {
        return false;
      }
      return true;
    });
  }, [shadows, searchQuery, selectedPersonality]);

  return (
    <div className="space-y-4">
      {/* Overview Intro Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Shadow Negotiation Tactics
          </h3>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          During an All-Out Attack prompt, talk to downed Shadows to recruit them as Personas, demand money, or request rare items. Check the Shadow&apos;s personality to pick the right response type.
        </p>
      </div>

      {/* 4 Personality Trait Cards */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Personality Reaction Guide
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(personalityMatrix).map(([key, val]: [string, any]) => {
            const isSelected = selectedPersonality === key;

            return (
              <div
                key={key}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedPersonality(isSelected ? 'all' : key);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 shadow-sm ${
                  isSelected
                    ? 'bg-zinc-800/90 border-white/30 ring-1 ring-white/20'
                    : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: val.color }}
                    />
                    <h5 className="text-sm font-extrabold text-white">{key}</h5>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {isSelected ? 'Filter active' : 'Tap to filter shadows'}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {val.description}
                </p>

                {/* Likes / Neutral / Hates strip */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px] font-bold">
                  <div className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                    <span className="block text-[8px] uppercase tracking-wider text-emerald-400 font-black">
                      Likes
                    </span>
                    <span className="truncate block mt-0.5">{val.likes}</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-black">
                      Neutral
                    </span>
                    <span className="truncate block mt-0.5">{val.neutral}</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300">
                    <span className="block text-[8px] uppercase tracking-wider text-rose-400 font-black">
                      Hates
                    </span>
                    <span className="truncate block mt-0.5">{val.hates}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sun Confidant Perks & Mechanics Accordion */}
      {sunPerks.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Sun Confidant (Toranosuke Yoshida) Negotiation Perks
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sunPerks.map((p: any) => (
              <div
                key={p.rank}
                className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{p.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400">Rank {p.rank}</span>
                </div>
                <p className="text-[11px] text-zinc-400">{p.effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Searchable Shadow Personality Database */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Shadow Personality Directory
          </h4>
          {selectedPersonality !== 'all' && (
            <button
              onClick={() => setSelectedPersonality('all')}
              className="text-[10px] font-semibold text-rose-400 hover:text-rose-300"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search shadow name or persona (e.g. Pixie, Jack-o'-Lantern)..."
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

        {/* Shadows List */}
        <div className="space-y-2">
          {filteredShadows.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-1">
              <p className="text-xs font-semibold text-zinc-400">No shadows matching filter</p>
            </div>
          ) : (
            filteredShadows.slice(0, 100).map((sh, idx) => {
              const rule = personalityMatrix[sh.personality] || {};

              return (
                <div
                  key={`${sh.name}-${idx}`}
                  className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs font-extrabold text-white tracking-tight">
                        {sh.name}
                      </h5>
                      {sh.persona_name && (
                        <span className="text-[11px] font-semibold text-zinc-400">
                          ({sh.persona_name})
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500">Lv {sh.level}</span>
                    </div>
                    {rule.best_type && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Answer style: <strong className="text-emerald-400">{rule.best_type}</strong>
                        {' '}&bull; Avoid: <span className="text-rose-400">{rule.bad_type}</span>
                      </p>
                    )}
                  </div>

                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: `${rule.color || '#fff'}20`,
                      borderColor: `${rule.color || '#fff'}40`,
                      color: rule.color || '#fff'
                    }}
                  >
                    {sh.personality || 'Unknown'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
