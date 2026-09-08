import React, { useState, useMemo } from 'react';
import {
  Search,
  Compass,
  Calendar,
  Swords,
  Shield,
  Clock,
  AlertTriangle,
  Sparkles,
  Users,
  ChevronRight,
  BookOpen,
  X
} from 'lucide-react';
import { MonthGuide, BossGuide, GameId } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';

interface GuidesViewProps {
  dayGuides: MonthGuide[];
  bossGuides: BossGuide[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
}

export const GuidesView: React.FC<GuidesViewProps> = ({
  dayGuides,
  bossGuides,
  gameId,
  series,
  accentColor
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'bosses'>('calendar');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reset month index on game switch or when dayGuides change
  React.useEffect(() => {
    setSelectedMonthIdx(0);
  }, [gameId]);

  // Selected Month
  const currentMonth = dayGuides[selectedMonthIdx] || dayGuides[0];

  // Filtered days within current month or across all months if searching
  const filteredDays = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentMonth?.days || [];

    // If searching, search across all months!
    const results: { monthName: string; day: any }[] = [];
    dayGuides.forEach((m) => {
      m.days?.forEach((d) => {
        const eventsMatch = Array.isArray(d.events) && d.events.some((ev) =>
          ev.time.toLowerCase().includes(q) ||
          ev.actions.some((a) => a.toLowerCase().includes(q))
        );

        if (
          d.date.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.day_of_week?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          eventsMatch
        ) {
          results.push({ monthName: m.month, day: d });
        }
      });
    });
    return results;
  }, [dayGuides, currentMonth, searchQuery]);

  // Helper for formatting time slots
  const getTimeSlotBadge = (time: string) => {
    const t = time.toLowerCase();
    if (t.includes('dark hour') || t.includes('midnight') || t.includes('full moon')) {
      return { label: '🌑 Dark Hour / Event', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    }
    if (t.includes('train')) {
      return { label: '🚆 Train', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }
    if (t.includes('class')) {
      return { label: '🏫 Class', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (t.includes('daytime') || t.includes('day') || t.includes('after school')) {
      return { label: '☀️ Daytime', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (t.includes('evening') || t.includes('night')) {
      return { label: '🌙 Evening', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    if (t.includes('all day')) {
      return { label: '📅 All Day', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    }
    return { label: `⏳ ${time}`, bg: 'bg-zinc-800 text-zinc-300 border-white/10' };
  };

  // Helper to format action text with highlights
  const formatActionText = (text: string) => {
    // Highlight stat increases across P3, P4, P5
    const statRegex = /\((Knowledge|Charm|Guts|Kindness|Proficiency|Academics|Courage|Diligence|Understanding|Expression|Technical|Baton Pass)[^)]*\)/gi;
    const parts = text.split(statRegex);
    if (parts.length === 1) return text;

    return (
      <span>
        {parts.map((part, i) => {
          if (
            [
              'Knowledge',
              'Charm',
              'Guts',
              'Kindness',
              'Proficiency',
              'Academics',
              'Courage',
              'Diligence',
              'Understanding',
              'Expression',
              'Technical',
              'Baton Pass'
            ].some((s) => s.toLowerCase() === part.toLowerCase())
          ) {
            return (
              <span key={i} className="text-amber-300 font-bold">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  // Filtered Boss Guides
  const filteredBosses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return bossGuides;
    return bossGuides.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q) ||
        b.strategy?.toLowerCase().includes(q) ||
        b.weaknesses?.toLowerCase().includes(q)
    );
  }, [bossGuides, searchQuery]);

  const getCategoryBadge = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'deadline':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'palace':
      case 'dungeon':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'story':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'exam':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'confidant':
      case 'social_link':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'unlock':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'tip':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-white/5';
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Segmented Switcher: Calendar Walkthrough vs Boss Strategies */}
      <div className="p-1 rounded-2xl bg-zinc-900 border border-white/10 flex items-center gap-1 shadow-inner">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('calendar');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'calendar'
              ? 'bg-white text-zinc-900 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Calendar Walkthrough
        </button>
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('bosses');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bosses'
              ? 'bg-white text-zinc-900 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Boss Battle Tactics ({bossGuides.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder={
            activeTab === 'calendar'
              ? 'Search schedule, events, deadlines, exams...'
              : 'Search bosses, palace rulers, party recommendations...'
          }
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

      {/* Mode 1: Calendar Walkthrough */}
      {activeTab === 'calendar' && (
        <div className="space-y-3">
          {/* Month Selector Carousel (shown if not searching globally) */}
          {!searchQuery && dayGuides.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {dayGuides.map((m, idx) => (
                <button
                  key={m.month}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedMonthIdx(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedMonthIdx === idx
                      ? 'text-zinc-900 bg-white shadow-md'
                      : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
                  }`}
                >
                  {m.month}
                </button>
              ))}
            </div>
          )}

          {/* Month Overview Card */}
          {!searchQuery && currentMonth?.overview && (
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                {currentMonth.month} Overview & Goals
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentMonth.overview}
              </p>
            </div>
          )}

          {/* Days Feed (Responsive 2-column grid on desktop to optimize space) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDays.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs font-semibold text-zinc-400">No schedule events found</p>
              </div>
            ) : (
              filteredDays.map((item: any, idx) => {
                const day = item.day || item;
                const monthPrefix = item.monthName ? `${item.monthName} • ` : '';
                const hasEvents = Array.isArray(day.events) && day.events.length > 0;

                return (
                  <div
                    key={`${day.date}-${idx}`}
                    className="p-4 rounded-2xl bg-zinc-900/85 border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Date & Day of Week */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg border shadow-xs"
                            style={{
                              backgroundColor: `${accentColor}25`,
                              borderColor: `${accentColor}50`,
                              color: accentColor
                            }}
                          >
                            {day.date}
                          </span>
                          {day.day_of_week && (
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5 uppercase tracking-wider">
                              {day.day_of_week}
                            </span>
                          )}
                          <span className="text-xs font-bold text-white tracking-tight">
                            {monthPrefix}{day.title}
                          </span>
                        </div>

                        {day.category && (
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 ${getCategoryBadge(
                              day.category
                            )}`}
                          >
                            {day.category}
                          </span>
                        )}
                      </div>

                      {/* Content: Either Structured Events or Text Description */}
                      {hasEvents ? (
                        <div className="pt-2.5 space-y-2.5">
                          {day.events.map((ev: any, eIdx: number) => {
                            const badge = getTimeSlotBadge(ev.time);
                            return (
                              <div
                                key={eIdx}
                                className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}
                                  >
                                    {badge.label}
                                  </span>
                                </div>
                                <ul className="space-y-1 text-xs text-zinc-300 leading-relaxed pl-1">
                                  {ev.actions.map((act: string, aIdx: number) => (
                                    <li key={aIdx} className="flex items-start gap-1.5">
                                      <span className="text-zinc-500 select-none mt-0.5">•</span>
                                      <div className="flex-1 break-words">
                                        {formatActionText(act)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="pt-2 pl-1">
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                            {day.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Boss Battle Strategies */}
      {activeTab === 'bosses' && (
        <div className="space-y-3">
          {filteredBosses.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <Swords className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-400">No boss guides found</p>
              <p className="text-xs">Try adjusting your search query.</p>
            </div>
          ) : (
            filteredBosses.map((boss, idx) => (
              <div
                key={`${boss.name}-${idx}`}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-sm"
              >
                {/* Header: Name, Level, Location */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                      {boss.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      {boss.level && (
                        <span className="font-bold text-rose-400">Level {boss.level}</span>
                      )}
                      {boss.location && (
                        <span>&bull; {boss.location}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    Boss Fight
                  </span>
                </div>

                {/* Weaknesses and Resistances */}
                {(boss.weaknesses || boss.resistances) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {boss.weaknesses && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] font-bold text-rose-400 uppercase block">
                          Weaknesses
                        </span>
                        <p className="font-bold text-rose-200 mt-0.5">{boss.weaknesses}</p>
                      </div>
                    )}
                    {boss.resistances && (
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                          Resistances
                        </span>
                        <p className="font-bold text-zinc-200 mt-0.5">{boss.resistances}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Party Recommendation */}
                {boss.party && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2 text-xs">
                    <Users className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Recommended Party</span>
                      <p className="text-zinc-300 mt-0.5">{boss.party}</p>
                    </div>
                  </div>
                )}

                {/* Combat Strategy */}
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Battle Strategy & Phases
                  </span>
                  <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                    {boss.strategy}
                  </p>
                </div>

                {/* Build Prep */}
                {boss.buildPrep && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 space-y-1">
                    <span className="text-[10px] font-bold text-purple-300 uppercase block">
                      Recommended Persona & Gear Prep
                    </span>
                    <p className="leading-relaxed">{boss.buildPrep}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
