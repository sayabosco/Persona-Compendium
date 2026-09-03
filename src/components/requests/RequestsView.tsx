import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  Gift,
  MapPin,
  Crosshair,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { QuestRequest, GameId } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';

interface RequestsViewProps {
  requests: QuestRequest[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  gameId,
  accentColor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Local persistence for completed requests
  const storageKey = `p_completed_quests_${gameId}`;
  const [completedSet, setCompletedSet] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleComplete = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    setCompletedSet((prev) => {
      const next = new Set(prev);
      const strId = String(id);
      if (next.has(strId)) {
        next.delete(strId);
      } else {
        next.add(strId);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return requests.filter((r, idx) => {
      const id = String(r.id ?? r.number ?? idx);
      const isDone = completedSet.has(id);

      if (filterState === 'active' && isDone) return false;
      if (filterState === 'completed' && !isDone) return false;

      if (!q) return true;

      const title = (r.title || r.name || r.request || '').toLowerCase();
      const target = (r.target || r.demon_form || '').toLowerCase();
      const loc = (r.location || '').toLowerCase();
      const reward = (r.reward || '').toLowerCase();
      const giver = (r.giver || '').toLowerCase();

      return (
        title.includes(q) ||
        target.includes(q) ||
        loc.includes(q) ||
        reward.includes(q) ||
        giver.includes(q)
      );
    });
  }, [requests, searchQuery, filterState, completedSet]);

  const completedCount = requests.filter((r, idx) =>
    completedSet.has(String(r.id ?? r.number ?? idx))
  ).length;

  return (
    <div className="space-y-3.5">
      {/* Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search requests, targets, shadows, or rewards..."
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

        {/* Filter Pills & Completion Progress */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('selection');
                setFilterState('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterState === 'all'
                  ? 'text-zinc-900 bg-white shadow-md'
                  : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => {
                triggerHaptic('selection');
                setFilterState('active');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterState === 'active'
                  ? 'text-zinc-900 bg-white shadow-md'
                  : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
              }`}
            >
              Active ({requests.length - completedCount})
            </button>
            <button
              onClick={() => {
                triggerHaptic('selection');
                setFilterState('completed');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterState === 'completed'
                  ? 'text-zinc-900 bg-white shadow-md'
                  : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <span className="text-[11px] font-bold text-zinc-400 shrink-0 font-mono">
            {completedCount}/{requests.length} Done
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-2.5">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <ClipboardList className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">No requests found</p>
            <p className="text-xs">Try clearing your filters or search query.</p>
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const reqId = req.id ?? req.number ?? idx;
            const isDone = completedSet.has(String(reqId));
            const isExpanded = expandedId === reqId;
            const title = req.title || req.name || req.request || `Request #${reqId}`;

            return (
              <div
                key={`${reqId}-${idx}`}
                onClick={() => {
                  triggerHaptic('light');
                  setExpandedId(isExpanded ? null : reqId);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-sm ${
                  isDone
                    ? 'bg-zinc-900/40 border-white/5 opacity-70'
                    : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header: Checkbox, Title, Difficulty / ID */}
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={(e) => toggleComplete(reqId, e)}
                      className="mt-0.5 shrink-0 text-zinc-400 hover:text-white transition-colors"
                      title={isDone ? 'Mark as active' : 'Mark as completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold tracking-tight ${
                            isDone ? 'line-through text-zinc-400' : 'text-white'
                          }`}
                        >
                          {title}
                        </h4>
                        {req.difficulty && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Rank {req.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Giver / Target Subtitle */}
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap">
                        {req.giver && (
                          <span>Client: <strong className="text-zinc-300">{req.giver}</strong></span>
                        )}
                        {req.target && (
                          <span>&bull; Target: <strong className="text-zinc-300">{req.target}</strong></span>
                        )}
                        {req.deadline && req.deadline !== '-' && (
                          <span className="flex items-center gap-1 text-rose-400 font-semibold">
                            <Clock className="w-3 h-3" />
                            {req.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand Chevron */}
                  <div className="text-zinc-500 hover:text-white shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Location & Reward strip */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5 border-t border-white/5">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{req.location || 'Special Location'}</span>
                  </div>

                  {req.reward && (
                    <div className="flex items-center gap-1 text-amber-300 font-semibold shrink-0">
                      <Gift className="w-3 h-3 text-amber-400" />
                      <span>{req.reward}</span>
                    </div>
                  )}
                </div>

                {/* Expanded Details & Walkthrough */}
                {isExpanded && (
                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-zinc-300">
                    {req.demon_form && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-400">Shadow Form:</span>
                        <span className="font-bold text-white">{req.demon_form}</span>
                      </div>
                    )}

                    {req.weakness && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-300">
                        <span className="font-semibold">Weakness:</span>
                        <span className="font-bold">{req.weakness}</span>
                      </div>
                    )}

                    {req.requirement && (
                      <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1">
                        <span className="text-zinc-400 font-bold block text-[10px] uppercase">
                          Requirement
                        </span>
                        <p className="text-zinc-200">{req.requirement}</p>
                      </div>
                    )}

                    {(req.walkthrough || req.details || req.guide) && (
                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                        <span className="text-zinc-400 font-bold block text-[10px] uppercase">
                          Walkthrough & Guide
                        </span>
                        <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                          {req.walkthrough || req.details || req.guide}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
