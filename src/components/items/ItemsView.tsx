import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  Sparkles,
  Shield,
  Coins,
  MapPin,
  X,
  Tag,
  Crosshair,
  Filter
} from 'lucide-react';
import { ItemData, GameId } from '../../types/persona';
import { triggerHaptic } from '../../utils/haptics';

interface ItemsViewProps {
  items: ItemData[];
  gameId: GameId;
  series: 'p3' | 'p4' | 'p5';
  accentColor: string;
}

export const ItemsView: React.FC<ItemsViewProps> = ({
  items,
  accentColor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category.trim());
    });
    return Array.from(set).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((it) => {
      if (
        q &&
        !it.name.toLowerCase().includes(q) &&
        !it.effect?.toLowerCase().includes(q) &&
        !it.description?.toLowerCase().includes(q) &&
        !it.location?.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (selectedCategory !== 'all' && it.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="space-y-3.5">
      {/* Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search items, effects, or drop/shop locations..."
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

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => {
              triggerHaptic('selection');
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'text-zinc-900 bg-white shadow-md'
                : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic('selection');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'text-zinc-900 bg-white shadow-md'
                  : 'text-zinc-400 bg-zinc-900/90 border border-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
        <span>
          Showing <strong className="text-zinc-200">{filteredItems.length}</strong> items
        </span>
        <span className="text-zinc-500">Buy / Sell & Sources</span>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <Package className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">No items found</p>
            <p className="text-xs">Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          filteredItems.slice(0, 150).map((it, idx) => (
            <div
              key={`${it.name}-${idx}`}
              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all space-y-2 shadow-sm"
            >
              {/* Top Row: Name, Category, Price */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-white tracking-tight">
                      {it.name}
                    </h4>
                    {it.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/5">
                        {it.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                {it.price && it.price !== '-' && (
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {it.price.includes('¥') ? it.price : `¥${it.price}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Effect Description */}
              {(it.effect || it.description) && (
                <p className="text-xs text-zinc-300 leading-relaxed font-normal bg-black/25 p-2 rounded-xl border border-white/5">
                  {it.effect || it.description}
                </p>
              )}

              {/* Location & Drop Sources */}
              {it.location && it.location !== '-' && (
                <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span className="leading-snug whitespace-pre-line text-zinc-300">
                    {it.location}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
