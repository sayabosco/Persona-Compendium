import React, { useState } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Shield,
  Users,
  GraduationCap,
  Zap,
  Package,
  ClipboardList,
  Compass,
  MessageSquare,
  MoreHorizontal,
  ChevronRight,
  X
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { IosBottomSheet } from './IosBottomSheet';

export type MainTab =
  | 'browse'
  | 'personas'
  | 'fusion'
  | 'enemies'
  | 'social'
  | 'classroom'
  | 'skills'
  | 'items'
  | 'requests'
  | 'guides'
  | 'negotiation';

interface IosTabBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  accentColor?: string;
  badgeCount?: { requests?: number };
}

export const IosTabBar: React.FC<IosTabBarProps> = ({
  activeTab,
  onTabChange,
  accentColor = '#f43f5e',
  badgeCount
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Core primary tabs shown on the bottom bar
  const primaryTabs: { id: MainTab; label: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: 'browse',
      label: 'Browse',
      icon: LayoutGrid
    },
    {
      id: 'personas',
      label: 'Personas',
      icon: BookOpen
    },
    {
      id: 'fusion',
      label: 'Fusion',
      icon: Sparkles
    },
    {
      id: 'enemies',
      label: 'Enemies',
      icon: Shield
    }
  ];

  // Secondary modules accessible via "More" or the Browse Hub
  const secondaryTabs: { id: MainTab; label: string; desc: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: 'social',
      label: 'Confidants',
      desc: 'Social links, conversation choices & schedule',
      icon: Users
    },
    {
      id: 'classroom',
      label: 'School Exams',
      desc: 'Pop quizzes, chalk dodges & exams',
      icon: GraduationCap
    },
    {
      id: 'skills',
      label: 'Skills Codex',
      desc: 'Spells, passives & traits with SP/HP costs',
      icon: Zap
    },
    {
      id: 'items',
      label: 'Items & Gear',
      desc: 'Weapons, armor, accessories & consumables',
      icon: Package
    },
    {
      id: 'requests',
      label: 'Side-Quests',
      desc: 'Mementos targets, Elizabeth requests & rewards',
      icon: ClipboardList,
      badge: badgeCount?.requests
    },
    {
      id: 'guides',
      label: 'Guides & Bosses',
      desc: 'Day-by-day 100% calendar & boss tactics',
      icon: Compass
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      desc: 'Personality matrix & shadow speech guide',
      icon: MessageSquare
    }
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);
  const activeSecondaryTab = secondaryTabs.find((t) => t.id === activeTab);

  return (
    <>
      <nav
        id="ios-tab-bar"
        className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_20px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5 max-w-lg mx-auto">
          {/* Primary 4 Tabs */}
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  triggerHaptic('selection');
                  onTabChange(tab.id);
                }}
                className={`group relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 active:scale-95 touch-manipulation rounded-xl ${
                  isActive ? 'bg-white/[0.04]' : ''
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                    style={{
                      color: isActive ? accentColor : undefined,
                      strokeWidth: isActive ? 2.5 : 1.8
                    }}
                  />
                </div>

                <span
                  className={`text-[9px] mt-1 tracking-tight transition-all duration-200 uppercase ${
                    isActive ? 'font-black tracking-wider' : 'font-semibold text-zinc-400 group-hover:text-zinc-300'
                  }`}
                  style={{
                    color: isActive ? accentColor : undefined
                  }}
                >
                  {tab.label}
                </span>

                {isActive && (
                  <span
                    className="absolute bottom-0 w-6 h-0.5 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>
            );
          })}

          {/* 5th Tab: "More" or Active Secondary Tab */}
          <button
            id="tab-more"
            onClick={() => {
              triggerHaptic('selection');
              setIsMoreMenuOpen(true);
            }}
            className={`group relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 active:scale-95 touch-manipulation rounded-xl ${
              isSecondaryActive ? 'bg-white/[0.04]' : ''
            }`}
          >
            <div className="relative">
              {isSecondaryActive && activeSecondaryTab ? (
                React.createElement(activeSecondaryTab.icon, {
                  className: 'w-5 h-5 scale-110 drop-shadow-[0_0_8px_currentColor] transition-all duration-200',
                  style: { color: accentColor, strokeWidth: 2.5 }
                })
              ) : (
                <MoreHorizontal className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-all duration-200" />
              )}
              {Boolean(badgeCount?.requests && badgeCount.requests > 0) && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-rose-600 text-[8px] font-black text-white flex items-center justify-center shadow-md">
                  {badgeCount.requests}
                </span>
              )}
            </div>

            <span
              className={`text-[9px] mt-1 tracking-tight transition-all duration-200 uppercase ${
                isSecondaryActive ? 'font-black tracking-wider' : 'font-semibold text-zinc-400 group-hover:text-zinc-300'
              }`}
              style={{
                color: isSecondaryActive ? accentColor : undefined
              }}
            >
              {isSecondaryActive && activeSecondaryTab ? activeSecondaryTab.label.split(' ')[0] : 'More'}
            </span>

            {isSecondaryActive && (
              <span
                className="absolute bottom-0 w-6 h-0.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
        </div>
      </nav>

      {/* More Modules Sheet */}
      {isMoreMenuOpen && (
        <IosBottomSheet
          isOpen={isMoreMenuOpen}
          onClose={() => setIsMoreMenuOpen(false)}
          title="All Tactical Modules"
          subtitle="Explore tactical databases, guides & walkthroughs"
          accentColor={accentColor}
        >
          <div className="space-y-2 pb-2">
            {secondaryTabs.map((mod) => {
              const Icon = mod.icon;
              const isCurrent = activeTab === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    triggerHaptic('medium');
                    onTabChange(mod.id);
                    setIsMoreMenuOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isCurrent
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        borderColor: `${accentColor}40`,
                        color: accentColor
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {mod.label}
                        </span>
                        {mod.badge && mod.badge > 0 && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
                            {mod.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{mod.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0" />
                </button>
              );
            })}
          </div>
        </IosBottomSheet>
      )}
    </>
  );
};
