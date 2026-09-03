import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle2, Circle, Calendar, Award, Sparkles, Filter, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { IosSegmentedControl } from '../ios/IosSegmentedControl';

interface ClassroomQuestsViewProps {
  classroomData: Record<string, any>;
  requestsData: any[];
  accentColor: string;
  gameTitle: string;
}

type SubTab = 'classroom' | 'requests';

export const ClassroomQuestsView = ({
  classroomData,
  requestsData,
  accentColor,
  gameTitle
}: ClassroomQuestsViewProps) => {
  const [subTab, setSubTab] = useState<SubTab>('classroom');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [completedRequests, setCompletedRequests] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('completed_requests');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Toggle request completed
  const toggleRequest = (id: string) => {
    triggerHaptic('success');
    setCompletedRequests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('completed_requests', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Extract flat list of classroom items
  const classroomEntries = useMemo(() => {
    const list: {
      month: string;
      date: string;
      category: string;
      question: string;
      answer: string;
      choice?: string | number;
    }[] = [];

    for (const [month, content] of Object.entries(classroomData)) {
      if (!content || typeof content !== 'object') continue;

      for (const [category, dateGroups] of Object.entries(content as Record<string, any>)) {
        if (!dateGroups || typeof dateGroups !== 'object') continue;

        for (const [date, questions] of Object.entries(dateGroups as Record<string, any>)) {
          if (Array.isArray(questions)) {
            questions.forEach((q: any) => {
              list.push({
                month,
                date,
                category,
                question: q.Question || q.question || '',
                answer: q.Answer || q.answer || '',
                choice: q.Choice || q.choice
              });
            });
          }
        }
      }
    }

    return list;
  }, [classroomData]);

  // Unique months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    classroomEntries.forEach((c) => set.add(c.month));
    return Array.from(set);
  }, [classroomEntries]);

  // Filtered classroom entries
  const filteredClassroom = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return classroomEntries.filter((item) => {
      if (selectedMonth !== 'all' && item.month !== selectedMonth) {
        return false;
      }
      if (q && !item.question.toLowerCase().includes(q) && !item.answer.toLowerCase().includes(q) && !item.date.includes(q)) {
        return false;
      }
      return true;
    });
  }, [classroomEntries, selectedMonth, searchQuery]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return requestsData.filter((r) => {
      const name = r.name || r.title || r.request || `Request #${r.number || ''}`;
      const reward = r.reward || '';
      const details = r.details || r.guide || '';
      if (q && !name.toLowerCase().includes(q) && !reward.toLowerCase().includes(q) && !details.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [requestsData, searchQuery]);

  const completedCount = requestsData.filter((r) => {
    const reqId = String(r.id || r.number || r.name || r.title);
    return completedRequests.has(reqId);
  }).length;

  const completionPct = requestsData.length > 0 ? Math.round((completedCount / requestsData.length) * 100) : 0;

  return (
    <div className="space-y-3.5">
      {/* iOS Segmented Control */}
      <IosSegmentedControl
        selected={subTab}
        onChange={setSubTab}
        accentColor={accentColor}
        options={[
          { id: 'classroom', label: 'Classroom Answers', badge: classroomEntries.length },
          { id: 'requests', label: 'Velvet Quests', badge: `${completedCount}/${requestsData.length}` }
        ]}
      />

      {/* iOS Search */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4 stroke-[2.2]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={subTab === 'classroom' ? 'Search school date, question or answer...' : 'Search quests, rewards, targets...'}
          className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
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

      {/* ─── CLASSROOM SUB-TAB ─────────────────────────────────────── */}
      {subTab === 'classroom' && (
        <div className="space-y-3">
          {/* Month Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedMonth('all');
              }}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap border ${
                selectedMonth === 'all'
                  ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-zinc-200'
              }`}
            >
              All Year ({classroomEntries.length})
            </button>
            {availableMonths.map((m) => (
              <button
                key={m}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedMonth(m);
                }}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap border ${
                  selectedMonth === m
                    ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-zinc-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredClassroom.map((item, idx) => {
              const isExam = item.category.toLowerCase().includes('exam') || item.category.toLowerCase().includes('test');
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-zinc-900/70 border border-white/[0.07] rounded-2xl space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold border"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          borderColor: `${accentColor}30`,
                          color: accentColor
                        }}
                      >
                        {item.date}
                      </span>
                      <span className="text-xs text-zinc-400 font-semibold">{item.month}</span>
                    </div>

                    {isExam && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Exam Question
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">{item.question}</p>

                  {/* Correct Answer Highlight */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-emerald-200">{item.answer}</span>
                    </div>
                    {item.choice && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-900/50 text-emerald-300 border border-emerald-500/20 font-bold">
                        Choice {item.choice}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredClassroom.length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-400">No questions found for this search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── QUESTS / REQUESTS SUB-TAB ─────────────────────────────── */}
      {subTab === 'requests' && (
        <div className="space-y-3">
          {/* Progress Tracker Card */}
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Velvet Room Completion
              </span>
              <span className="font-mono font-bold text-emerald-400">{completionPct}% Completed</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${completionPct}%`,
                  backgroundColor: accentColor
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
              <span>
                {completedCount} of {requestsData.length} completed
              </span>
              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  if (confirm('Reset all completed quests?')) {
                    setCompletedRequests(new Set());
                    localStorage.removeItem('completed_requests');
                  }
                }}
                className="text-zinc-500 hover:text-rose-400"
              >
                Reset Progress
              </button>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-2">
            {filteredRequests.map((req, idx) => {
              const reqId = String(req.id || req.number || req.name || req.title || idx);
              const isCompleted = completedRequests.has(reqId);
              const title = req.name || req.title || req.request || `Request #${req.number || idx + 1}`;

              return (
                <div
                  key={reqId}
                  onClick={() => toggleRequest(reqId)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                    isCompleted
                      ? 'bg-zinc-950/40 border-emerald-500/20 opacity-80'
                      : 'bg-zinc-900/70 border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/60" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-bold tracking-tight ${
                            isCompleted ? 'line-through text-zinc-400' : 'text-white'
                          }`}
                        >
                          {req.number !== undefined && <span className="font-mono mr-1.5 text-zinc-400">#{req.number}</span>}
                          {title}
                        </h4>
                        {req.deadline && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                            Due: {req.deadline}
                          </span>
                        )}
                      </div>

                      {req.details && (
                        <p className="text-xs text-zinc-400 leading-relaxed">{req.details}</p>
                      )}
                      {req.guide && (
                        <p className="text-xs text-zinc-300 bg-zinc-950/50 p-2 rounded-lg border border-white/5 leading-relaxed">
                          {req.guide}
                        </p>
                      )}

                      {req.reward && (
                        <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reward: {req.reward}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-400">No requests found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
