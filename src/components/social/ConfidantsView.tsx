import { useState, useMemo } from 'react';
import { Search, Heart, Sparkles, ChevronRight, AlertCircle, X, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { IosBottomSheet } from '../ios/IosBottomSheet';

interface ConfidantsViewProps {
  socialLinksData: Record<string, any>;
  accentColor: string;
  gameTitle: string;
}

export const ConfidantsView = ({
  socialLinksData,
  accentColor,
  gameTitle
}: ConfidantsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfidant, setSelectedConfidant] = useState<{ arcana: string; data: any } | null>(null);

  // Parse raw social links
  const confidantList = useMemo(() => {
    return Object.entries(socialLinksData).map(([arcana, data]) => {
      const charName = data.character || data.name || arcana;
      return {
        arcana,
        character: charName,
        data
      };
    });
  }, [socialLinksData]);

  // Filtered
  const filteredConfidants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return confidantList;
    return confidantList.filter(
      (c) => c.arcana.toLowerCase().includes(q) || c.character.toLowerCase().includes(q)
    );
  }, [confidantList, searchQuery]);

  return (
    <div className="space-y-3">
      {/* iOS Search */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4 stroke-[2.2]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Confidants, Social Links, Arcana..."
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

      <div className="px-1 text-xs text-zinc-400 flex items-center justify-between">
        <span>{filteredConfidants.length} Social Links in {gameTitle}</span>
        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Optimal Dialogue Scores
        </span>
      </div>

      {/* Confidants Card List */}
      <div className="space-y-2">
        {filteredConfidants.map((confidant) => {
          const ranks = confidant.data;
          const rankKeys = Object.keys(ranks || {}).filter((k) => k.toLowerCase().includes('rank'));
          const maxRank = rankKeys.length ? 10 : 10;

          return (
            <div
              key={confidant.arcana}
              onClick={() => {
                triggerHaptic('light');
                setSelectedConfidant(confidant);
              }}
              className="p-3.5 bg-zinc-900/70 active:bg-zinc-800/80 border border-white/[0.07] rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    borderColor: `${accentColor}40`,
                    color: accentColor
                  }}
                >
                  {confidant.arcana.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {confidant.character}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">{confidant.arcana} Arcana</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-zinc-950 border border-white/5 text-zinc-300">
                  {maxRank} Ranks
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidant Deep Rank Sheet */}
      {selectedConfidant && (
        <IosBottomSheet
          isOpen={Boolean(selectedConfidant)}
          onClose={() => setSelectedConfidant(null)}
          title={selectedConfidant.character}
          subtitle={`${selectedConfidant.arcana} Arcana &bull; Complete Dialogue & Progression Guide`}
          accentColor={accentColor}
        >
          <div className="space-y-3">
            {Object.entries(selectedConfidant.data)
              .filter(([key]) => key.toLowerCase().includes('rank') || key.toLowerCase().includes('event'))
              .map(([rankTitle, rankInfo]: [string, any]) => {
                const req = rankInfo?.Requirements;
                const benefit = rankInfo?.Benefit;
                const choices = rankInfo?.Choices;
                const dialogues = rankInfo?.Dialogues;
                const note = rankInfo?.Note;

                return (
                  <div
                    key={rankTitle}
                    className="p-4 bg-zinc-950/70 border border-white/[0.08] rounded-2xl space-y-2.5 shadow-sm"
                  >
                    {/* Rank Title & Requirement */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        {rankTitle}
                      </h4>
                      {req && (
                        <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/5">
                          {req}
                        </span>
                      )}
                    </div>

                    {/* Confidant Perk / Benefit */}
                    {benefit && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                        <span className="font-bold text-indigo-300 block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Perk: {benefit.Name}
                        </span>
                        <p className="text-zinc-300 mt-0.5">{benefit.Description}</p>
                      </div>
                    )}

                    {/* Direct Choices with Point values */}
                    {choices && Array.isArray(choices) && choices.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] uppercase font-bold text-zinc-400 block">
                          Best Dialogue Choices:
                        </span>
                        <div className="space-y-1">
                          {choices.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2 rounded-xl bg-zinc-900/80 border border-white/5 text-xs flex items-center justify-between"
                            >
                              <span className="text-zinc-200">{c.Answer}</span>
                              <span className="text-emerald-400 font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 shrink-0">
                                +{c.Points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multi-dialogue trees */}
                    {dialogues && Array.isArray(dialogues) && dialogues.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {dialogues.map((d, dIdx) => (
                          <div key={dIdx} className="space-y-1">
                            <span className="text-[10.5px] font-semibold text-zinc-400 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-zinc-500" />
                              {d.Question || `Dialogue ${dIdx + 1}`}
                            </span>
                            <div className="space-y-1">
                              {d.Choices?.map((c: any, cIdx: number) => (
                                <div
                                  key={cIdx}
                                  className="p-2 rounded-xl bg-zinc-900/80 border border-white/5 text-xs flex items-center justify-between"
                                >
                                  <span className="text-zinc-200">{c.Answer}</span>
                                  {c.Points !== undefined && (
                                    <span
                                      className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                                        c.Points > 0
                                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-zinc-800 text-zinc-400'
                                      }`}
                                    >
                                      +{c.Points}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Romance flag or warning note */}
                    {note && (
                      <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </IosBottomSheet>
      )}
    </div>
  );
};
