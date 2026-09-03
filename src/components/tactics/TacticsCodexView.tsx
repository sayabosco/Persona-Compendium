import { useState, useMemo } from 'react';
import { ShieldAlert, MessageCircle, Swords, BookOpen, ChevronRight, Sparkles, Smartphone, Search, X } from 'lucide-react';
import { BossGuide, GameId } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';
import { IosSegmentedControl } from '../ios/IosSegmentedControl';
import { IosBottomSheet } from '../ios/IosBottomSheet';

interface TacticsCodexViewProps {
  bossGuides: BossGuide[];
  negotiationData: any;
  skillsData: any[];
  accentColor: string;
  gameTitle: string;
  gameId: GameId;
  onOpenInstallGuide: () => void;
}

type TacticsTab = 'bosses' | 'negotiation' | 'skills' | 'ios-info';

export const TacticsCodexView = ({
  bossGuides,
  negotiationData,
  skillsData,
  accentColor,
  gameTitle,
  onOpenInstallGuide
}: TacticsCodexViewProps) => {
  const [tab, setTab] = useState<TacticsTab>('bosses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoss, setSelectedBoss] = useState<BossGuide | null>(null);

  // Filtered bosses
  const filteredBosses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return bossGuides;
    return bossGuides.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.location && b.location.toLowerCase().includes(q)) ||
        (b.strategy && b.strategy.toLowerCase().includes(q))
    );
  }, [bossGuides, searchQuery]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return skillsData.slice(0, 50);
    return skillsData.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.element && s.element.toLowerCase().includes(q)) ||
        (s.effect && s.effect.toLowerCase().includes(q))
    ).slice(0, 100);
  }, [skillsData, searchQuery]);

  // Personality matrix
  const matrix = negotiationData?.p5?.personality_matrix || {};

  return (
    <div className="space-y-3.5">
      {/* iOS Segmented Control */}
      <IosSegmentedControl
        selected={tab}
        onChange={setTab}
        accentColor={accentColor}
        options={[
          { id: 'bosses', label: 'Boss Prep' },
          { id: 'negotiation', label: 'Shadow Talk' },
          { id: 'skills', label: 'Skills' },
          { id: 'ios-info', label: 'iPhone App' }
        ]}
      />

      {/* ─── 1. BOSS PREPARATION GUIDES ──────────────────────────── */}
      {tab === 'bosses' && (
        <div className="space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search story boss, palace ruler, superboss..."
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="px-1 text-xs text-zinc-400 flex items-center justify-between">
            <span>{filteredBosses.length} Bosses documented for {gameTitle}</span>
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Expert Strategies
            </span>
          </div>

          <div className="space-y-2">
            {filteredBosses.map((boss, idx) => (
              <div
                key={idx}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedBoss(boss);
                }}
                className="p-3.5 bg-zinc-900/70 active:bg-zinc-800/80 border border-white/[0.07] rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">{boss.name}</h3>
                    {boss.level && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold border border-white/5">
                        Lv.{boss.level}
                      </span>
                    )}
                  </div>
                  {boss.location && (
                    <p className="text-xs text-zinc-400 font-medium">{boss.location}</p>
                  )}
                  {boss.weaknesses && (
                    <p className="text-[11px] text-rose-300">
                      Weak: <strong>{boss.weaknesses}</strong>
                    </p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
              </div>
            ))}

            {filteredBosses.length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-400">No boss guides found for this query.</p>
              </div>
            )}
          </div>

          {/* Boss Sheet */}
          {selectedBoss && (
            <IosBottomSheet
              isOpen={Boolean(selectedBoss)}
              onClose={() => setSelectedBoss(null)}
              title={selectedBoss.name}
              subtitle={selectedBoss.location}
              accentColor={accentColor}
            >
              <div className="space-y-3.5">
                {/* Boss Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Elemental Weakness
                    </span>
                    <span className="font-bold text-rose-400">
                      {selectedBoss.weaknesses || 'None'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Resistances / Immunities
                    </span>
                    <span className="font-bold text-blue-400">
                      {selectedBoss.resistances || 'None'}
                    </span>
                  </div>
                </div>

                {selectedBoss.party && (
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Recommended Party Setup
                    </span>
                    <span className="font-semibold text-zinc-100">{selectedBoss.party}</span>
                  </div>
                )}

                {/* Build Prep */}
                {selectedBoss.buildPrep && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs space-y-1">
                    <span className="font-bold text-amber-300 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Pre-Battle Preparation & Personas
                    </span>
                    <p className="text-zinc-200 leading-relaxed">{selectedBoss.buildPrep}</p>
                  </div>
                )}

                {/* Battle Strategy */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 text-xs space-y-1.5">
                  <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                    Turn-By-Turn Combat Strategy
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{selectedBoss.strategy}</p>
                </div>
              </div>
            </IosBottomSheet>
          )}
        </div>
      )}

      {/* ─── 2. SHADOW NEGOTIATION MATRIX ────────────────────────── */}
      {tab === 'negotiation' && (
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-rose-400" /> Shadow Personality Guide
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When holding up Shadows in Persona 5 / Royal, match their personality type with the exact dialogue style they love to recruit them every time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {Object.entries(matrix).map(([type, info]: [string, any]) => (
              <div
                key={type}
                className="p-3.5 bg-zinc-900/70 border border-white/[0.07] rounded-2xl space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info.color || accentColor }}
                    />
                    <h4 className="text-sm font-bold text-white">{type} Personality</h4>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    Best: {info.best_type}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{info.description}</p>

                <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">Likes</span>
                    <span className="font-bold text-emerald-200">{info.likes}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Neutral</span>
                    <span className="font-medium text-zinc-300">{info.neutral}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/20">
                    <span className="text-[9px] uppercase font-bold text-rose-400 block">Hates</span>
                    <span className="font-bold text-rose-200">{info.hates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 3. SKILLS CODEX ─────────────────────────────────────── */}
      {tab === 'skills' && (
        <div className="space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill name, element (Fire, Elec, Buff)..."
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filteredSkills.map((skill, idx) => (
              <div
                key={idx}
                className="p-3 bg-zinc-900/70 border border-white/[0.07] rounded-2xl space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                    {skill.element && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5">
                        {skill.element}
                      </span>
                    )}
                  </div>
                  {skill.cost && (
                    <span className="text-xs font-mono font-bold text-amber-300">{skill.cost}</span>
                  )}
                </div>
                {skill.effect && <p className="text-xs text-zinc-300 leading-relaxed">{skill.effect}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. IPHONE PWA & COMPANION INFO ──────────────────────── */}
      {tab === 'ios-info' && (
        <div className="space-y-3.5">
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">iPhone Native Experience</h3>
                <p className="text-xs text-zinc-400">
                  Customized specifically for iOS Safari and Home Screen Standalone Mode.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenInstallGuide();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
              style={{ backgroundColor: accentColor }}
            >
              <Smartphone className="w-4 h-4" /> Open iPhone Home Screen Setup Guide
            </button>
          </div>

          {/* Feature Checklist */}
          <div className="p-4 bg-zinc-900/70 border border-white/[0.07] rounded-2xl space-y-2.5 text-xs text-zinc-300">
            <h4 className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
              iOS Optimization Checklist
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong>Full Viewport Safe Area:</strong> Dynamic Island & Home indicator padding
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong>Offline Support:</strong> Complete compendium cached in Service Worker
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong>Haptic Feedback:</strong> Tactile feedback on tap selections
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong>Persistent Progress:</strong> Quest completion and favorites saved locally
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong>Apple Touch Icon:</strong> High-res 180x180 PNG app icon for iOS home screen
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
