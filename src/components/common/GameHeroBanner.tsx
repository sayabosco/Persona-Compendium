import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameInfo, GameId } from '../../types/persona';
import { SUPPORTED_GAMES, resolveAssetUrl } from '../../utils/dataLoader';
import { triggerHaptic } from '../../utils/haptics';
import { Sparkles, Shield, BookOpen, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface GameHeroBannerProps {
  currentGame: GameInfo;
  onSelectGame: (gameId: GameId) => void;
  totalPersonas: number;
  activeTabName: string;
}

export const GameHeroBanner: React.FC<GameHeroBannerProps> = ({
  currentGame,
  onSelectGame,
  totalPersonas,
  activeTabName
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const [isP3DropdownOpen, setIsP3DropdownOpen] = useState(false);
  const p3DropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgError(false);
  }, [currentGame.id]);

  // Close P3 dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (p3DropdownRef.current && !p3DropdownRef.current.contains(event.target as Node)) {
        setIsP3DropdownOpen(false);
      }
    }
    if (isP3DropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isP3DropdownOpen]);

  const p3Games = useMemo(() => {
    return SUPPORTED_GAMES.filter((g) => g.series === 'p3');
  }, []);

  const isCurrentP3 = currentGame.series === 'p3';
  return (
    <div
      className={`relative rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 ${
        isP3DropdownOpen ? 'z-[60]' : 'z-20'
      }`}
    >
      {/* Background with series-themed artwork atmosphere (overflow-hidden kept strictly to background) */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentGame.bgGradient} opacity-90 transition-all duration-500`}
        />

        {/* Decorative Comic Slanted / TV scanline / Tartarus grid overlay */}
        {currentGame.series === 'p5' && (
          <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        )}
        {currentGame.series === 'p4' && (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_1px,transparent_1px,transparent_2px)] opacity-25 pointer-events-none" />
        )}
        {currentGame.series === 'p3' && (
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
        )}

        {/* Slanted stylish accent cut for P5 */}
        {currentGame.series === 'p5' && (
          <div className="absolute -right-8 -bottom-10 w-44 h-44 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
        )}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top row: Official Logo & Series Slogan Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Official Atlus Game Logo or Series Badge Fallback */}
            {currentGame.logo && !imgError ? (
              <div className="h-11 sm:h-13 flex items-center justify-center p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-lg shrink-0">
                <img
                  src={resolveAssetUrl(currentGame.logo)}
                  alt={currentGame.title}
                  onError={() => setImgError(true)}
                  className="h-full object-contain max-w-[140px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                />
              </div>
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-lg border"
                style={{
                  backgroundColor: `${currentGame.color}25`,
                  borderColor: `${currentGame.color}60`,
                  color: currentGame.color
                }}
              >
                {currentGame.series.toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
                  style={{ backgroundColor: currentGame.accentColor }}
                >
                  {currentGame.slogan || currentGame.badge}
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-300 mt-1 line-clamp-1">
                {currentGame.tagline || currentGame.sub}
              </p>
            </div>
          </div>

          {/* Quick Counter */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-sans">
              Compendium
            </span>
            <span
              className="text-lg sm:text-xl font-extrabold font-mono tracking-tight"
              style={{ color: currentGame.color }}
            >
              {totalPersonas} <span className="text-xs text-zinc-400 font-normal">Entries</span>
            </span>
          </div>
        </div>

        {/* Quick Title Switcher Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-visible pt-1 border-t border-white/10 relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
            Game:
          </span>

          {/* Persona 5 Royal */}
          {SUPPORTED_GAMES.filter((g) => g.id === 'p5r').map((game) => {
            const isCurrent = game.id === currentGame.id;
            return (
              <button
                key={game.id}
                onClick={() => {
                  if (!isCurrent) {
                    triggerHaptic('medium');
                    onSelectGame(game.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shadow-sm ${
                  isCurrent
                    ? 'text-white border-white/30 shadow-md scale-105'
                    : 'bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-zinc-200 border-white/5'
                }`}
                style={
                  isCurrent
                    ? { backgroundColor: game.accentColor, borderColor: `${game.color}80` }
                    : {}
                }
              >
                <span>{game.shortTitle}</span>
              </button>
            );
          })}

          {/* Persona 4 Golden */}
          {SUPPORTED_GAMES.filter((g) => g.id === 'p4g').map((game) => {
            const isCurrent = game.id === currentGame.id;
            return (
              <button
                key={game.id}
                onClick={() => {
                  if (!isCurrent) {
                    triggerHaptic('medium');
                    onSelectGame(game.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shadow-sm ${
                  isCurrent
                    ? 'text-white border-white/30 shadow-md scale-105'
                    : 'bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-zinc-200 border-white/5'
                }`}
                style={
                  isCurrent
                    ? { backgroundColor: game.accentColor, borderColor: `${game.color}80` }
                    : {}
                }
              >
                <span>{game.shortTitle}</span>
              </button>
            );
          })}

          {/* Persona 3 Series Drop-off List (Reload, Portable, FES) */}
          <div className="relative" ref={p3DropdownRef}>
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsP3DropdownOpen((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 border shadow-sm ${
                isCurrentP3
                  ? 'text-white border-white/30 shadow-md scale-105'
                  : 'bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-zinc-200 border-white/5'
              }`}
              style={
                isCurrentP3
                  ? { backgroundColor: currentGame.accentColor, borderColor: `${currentGame.color}80` }
                  : {}
              }
            >
              <span>
                {isCurrentP3
                  ? `Persona 3 (${currentGame.shortTitle.replace('P3 ', '')})`
                  : 'Persona 3'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isP3DropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Persona 3 Versions Dropdown Menu */}
            {isP3DropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => setIsP3DropdownOpen(false)}
                />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-zinc-900/98 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-2.5 z-[70] animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span>Persona 3 Series</span>
                    <span className="text-[10px] text-zinc-500 font-mono">3 Versions</span>
                  </div>

                  {p3Games.map((game) => {
                    const isSelected = game.id === currentGame.id;
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          onSelectGame(game.id);
                          setIsP3DropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'bg-sky-500/20 text-white border border-sky-500/30 shadow-sm'
                            : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0 border"
                          style={{
                            backgroundColor: game.color,
                            borderColor: isSelected ? '#ffffff' : 'transparent'
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span className="truncate">{game.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-white/10 text-zinc-400">
                              {game.shortTitle}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">{game.badge}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
