import React, { useState, useMemo } from 'react';
import {
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
  Search,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { GameInfo } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';

export type AppFeatureId =
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

interface FeatureItem {
  id: AppFeatureId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  tag?: string;
}

interface BrowseHubViewProps {
  currentGame: GameInfo;
  onSelectFeature: (featureId: AppFeatureId) => void;
  personasCount?: number;
  enemiesCount?: number;
  itemsCount?: number;
  skillsCount?: number;
  confidantsCount?: number;
  requestsCount?: number;
}

export const BrowseHubView: React.FC<BrowseHubViewProps> = ({
  currentGame,
  onSelectFeature,
  personasCount = 0,
  enemiesCount = 0,
  itemsCount = 0,
  skillsCount = 0,
  confidantsCount = 0,
  requestsCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const features: FeatureItem[] = useMemo(
    () => [
      {
        id: 'personas',
        title: 'Personas',
        subtitle: 'Full Velvet Room compendium with stats, affinities & skills',
        icon: BookOpen,
        color: currentGame.color,
        badge: personasCount > 0 ? `${personasCount}` : 'Compendium',
        tag: 'Essential'
      },
      {
        id: 'fusion',
        title: 'Fusion Calculator',
        subtitle: 'Normal, reverse & special multi-fuse recipe calculator',
        icon: Sparkles,
        color: '#f43f5e',
        badge: 'Velvet Room',
        tag: 'Popular'
      },
      {
        id: 'enemies',
        title: 'Enemies',
        subtitle: 'Shadows, bosses, palace encounters, weaknesses & item drops',
        icon: Shield,
        color: '#ef4444',
        badge: enemiesCount > 0 ? `${enemiesCount}` : 'Shadows',
        tag: 'Combat'
      },
      {
        id: 'social',
        title: 'Social Links / Confidants',
        subtitle: 'Max points dialogue choices, schedule availability & perks',
        icon: Users,
        color: '#f97316',
        badge: confidantsCount > 0 ? `${confidantsCount}` : 'Confidants',
        tag: 'Guide'
      },
      {
        id: 'classroom',
        title: 'Classroom Answers',
        subtitle: 'All daily teacher questions, chalk dodges & midterm/final exams',
        icon: GraduationCap,
        color: '#eab308',
        badge: '100% Score',
        tag: 'School'
      },
      {
        id: 'skills',
        title: 'Skills',
        subtitle: 'Physical, magic, passive & trait compendium with SP/HP costs',
        icon: Zap,
        color: '#eab308',
        badge: skillsCount > 0 ? `${skillsCount}` : 'Codex',
        tag: 'Spells'
      },
      {
        id: 'items',
        title: 'Items',
        subtitle: 'Weapons, armor, accessories, consumables & shop/drop sources',
        icon: Package,
        color: '#ec4899',
        badge: itemsCount > 0 ? `${itemsCount}` : 'Catalog',
        tag: 'Gear'
      },
      {
        id: 'requests',
        title: 'Side-Quests / Requests',
        subtitle: 'Mementos targets, Elizabeth requests, deadlines & rewards',
        icon: ClipboardList,
        color: '#38bdf8',
        badge: requestsCount > 0 ? `${requestsCount}` : 'Mementos',
        tag: 'Quests'
      },
      {
        id: 'guides',
        title: 'Guides & Walkthroughs',
        subtitle: 'Day-by-day 100% calendar schedule & boss battle tactics',
        icon: Compass,
        color: '#8b5cf6',
        badge: 'Walkthrough',
        tag: 'Strategy'
      },
      {
        id: 'negotiation',
        title: 'Shadow Negotiation Guide',
        subtitle: 'Upbeat, Timid, Gloomy & Irritable personality response matrix',
        icon: MessageSquare,
        color: '#10b981',
        badge: 'Recruit',
        tag: 'All-Out'
      }
    ],
    [
      currentGame.color,
      personasCount,
      enemiesCount,
      itemsCount,
      skillsCount,
      confidantsCount,
      requestsCount
    ]
  );

  const filteredFeatures = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return features;
    return features.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.subtitle.toLowerCase().includes(q) ||
        f.tag?.toLowerCase().includes(q)
    );
  }, [features, searchQuery]);

  return (
    <div className="space-y-4 pb-4">
      {/* Title Header matching user's screenshot */}
      <div className="pt-1 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              What would you like to browse?
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comprehensive database and interactive toolset for{' '}
              <span className="font-semibold text-zinc-200">{currentGame.title}</span>
            </p>
          </div>
        </div>

        {/* Search feature filter */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search all 10 modules (e.g. Bosses, Items, Exams, Fusion)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Feature Menu List matching the exact 10 items from screenshot */}
      <div className="space-y-2.5">
        {filteredFeatures.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`browse-feature-${item.id}`}
              onClick={() => {
                triggerHaptic('medium');
                onSelectFeature(item.id);
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 active:scale-[0.985] border border-white/[0.07] hover:border-white/20 transition-all duration-150 flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                {/* Icon Pill with game accent */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${item.color}20`,
                    borderColor: `${item.color}40`,
                    color: item.color
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-normal line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
