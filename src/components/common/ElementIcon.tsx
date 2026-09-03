import React from 'react';

interface ElementIconProps {
  element: string; // 'phys' | 'gun' | 'fir' | 'ice' | 'ele' | 'win' | 'psy' | 'nuk' | 'ble' | 'cur' | 'alm' | 'sla' | 'str' | 'pie' | 'heal' | 'support' | 'passive' etc.
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}

// Map element name or key to sprite symbol ID & color
export const ELEMENT_CONFIG: Record<
  string,
  { symbol: string; color: string; bg: string; name: string }
> = {
  // Physical / Gun
  phys: { symbol: 'phys-icon', color: '#f87171', bg: 'bg-red-500/20 text-red-400 border-red-500/30', name: 'Phys' },
  phy: { symbol: 'phys-icon', color: '#f87171', bg: 'bg-red-500/20 text-red-400 border-red-500/30', name: 'Phys' },
  gun: { symbol: 'gun-icon', color: '#fb923c', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', name: 'Gun' },
  sla: { symbol: 'sword-icon', color: '#f87171', bg: 'bg-red-500/20 text-red-400 border-red-500/30', name: 'Slash' },
  slash: { symbol: 'sword-icon', color: '#f87171', bg: 'bg-red-500/20 text-red-400 border-red-500/30', name: 'Slash' },
  str: { symbol: 'phys-icon', color: '#fb923c', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', name: 'Strike' },
  strike: { symbol: 'phys-icon', color: '#fb923c', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', name: 'Strike' },
  pie: { symbol: 'gun-icon', color: '#e879f9', bg: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30', name: 'Pierce' },
  pierce: { symbol: 'gun-icon', color: '#e879f9', bg: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30', name: 'Pierce' },

  // Magic Elements
  fire: { symbol: 'fire-icon', color: '#ef4444', bg: 'bg-red-600/20 text-red-400 border-red-500/30', name: 'Fire' },
  fir: { symbol: 'fire-icon', color: '#ef4444', bg: 'bg-red-600/20 text-red-400 border-red-500/30', name: 'Fire' },
  ice: { symbol: 'ice-icon', color: '#38bdf8', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30', name: 'Ice' },
  elec: { symbol: 'elec-icon', color: '#facc15', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', name: 'Elec' },
  ele: { symbol: 'elec-icon', color: '#facc15', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', name: 'Elec' },
  wind: { symbol: 'wind-icon', color: '#4ade80', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', name: 'Wind' },
  win: { symbol: 'wind-icon', color: '#4ade80', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', name: 'Wind' },
  psy: { symbol: 'psy-icon', color: '#ec4899', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', name: 'Psy' },
  nuke: { symbol: 'nuke-icon', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', name: 'Nuke' },
  nuk: { symbol: 'nuke-icon', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', name: 'Nuke' },

  // Light & Dark
  bless: { symbol: 'light-icon', color: '#fef08a', bg: 'bg-amber-300/20 text-amber-200 border-amber-300/30', name: 'Bless' },
  ble: { symbol: 'light-icon', color: '#fef08a', bg: 'bg-amber-300/20 text-amber-200 border-amber-300/30', name: 'Bless' },
  light: { symbol: 'light-icon', color: '#fef08a', bg: 'bg-amber-300/20 text-amber-200 border-amber-300/30', name: 'Light' },
  lig: { symbol: 'light-icon', color: '#fef08a', bg: 'bg-amber-300/20 text-amber-200 border-amber-300/30', name: 'Light' },
  curse: { symbol: 'skull-icon', color: '#a855f7', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', name: 'Curse' },
  cur: { symbol: 'skull-icon', color: '#a855f7', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', name: 'Curse' },
  dark: { symbol: 'skull-icon', color: '#a855f7', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', name: 'Dark' },
  dar: { symbol: 'skull-icon', color: '#a855f7', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', name: 'Dark' },

  // Almighty & Utility
  almighty: { symbol: 'per-almighty-icon', color: '#c084fc', bg: 'bg-purple-400/20 text-purple-300 border-purple-400/30', name: 'Almighty' },
  alm: { symbol: 'per-almighty-icon', color: '#c084fc', bg: 'bg-purple-400/20 text-purple-300 border-purple-400/30', name: 'Almighty' },
  heal: { symbol: 'per-recovery-icon', color: '#34d399', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', name: 'Healing' },
  recovery: { symbol: 'per-recovery-icon', color: '#34d399', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', name: 'Recovery' },
  support: { symbol: 'per-support-icon', color: '#60a5fa', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', name: 'Support' },
  passive: { symbol: 'per-passive-icon', color: '#94a3b8', bg: 'bg-zinc-700/30 text-zinc-300 border-zinc-600/30', name: 'Passive' },
  ailment: { symbol: 'per-ailment-icon', color: '#e879f9', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', name: 'Ailment' },
  special: { symbol: 'per-almighty-icon', color: '#fbbf24', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', name: 'Special' }
};

export const ElementIcon: React.FC<ElementIconProps> = ({
  element,
  className = '',
  size = 'md',
  showBackground = true
}) => {
  const normKey = (element || '').toLowerCase().trim();
  const config = ELEMENT_CONFIG[normKey] || {
    symbol: 'phys-icon',
    color: '#a1a1aa',
    bg: 'bg-zinc-800 text-zinc-300 border-white/10',
    name: element || '?'
  };

  const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const containerSizes = {
    xs: 'w-4 h-4 p-0.5',
    sm: 'w-5 h-5 p-0.5',
    md: 'w-6 h-6 p-1',
    lg: 'w-8 h-8 p-1.5'
  };

  const iconSvg = (
    <svg
      className={`${sizeStyles[size]} ${className}`}
      viewBox="0 0 256 256"
      style={{ color: config.color }}
    >
      <use href={`/assets/icons/elem_sprites.svg#${config.symbol}`} />
    </svg>
  );

  if (!showBackground) {
    return iconSvg;
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg border shadow-sm ${config.bg} ${containerSizes[size]}`}
      title={config.name}
    >
      {iconSvg}
    </div>
  );
};
