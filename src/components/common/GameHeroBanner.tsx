import React from 'react';
import { GameInfo, GameId } from '../../types/persona';
import { SUPPORTED_GAMES } from '../../utils/dataLoader';
import { triggerHaptic } from '../../utils/haptics';
import { Sparkles, Shield, BookOpen, ChevronRight } from 'lucide-react';

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
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300">
      {/* Background with series-themed artwork atmosphere */}
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

      {/* Content wrapper */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top row: Official Logo & Series Slogan Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Official Atlus Game Logo */}
            {currentGame.logo ? (
              <div className="h-11 sm:h-13 flex items-center justify-center p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-lg shrink-0">
                <img
                  src={currentGame.logo}
                  alt={currentGame.title}
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
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
            Game:
          </span>
          {SUPPORTED_GAMES.map((game) => {
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
        </div>
      </div>
    </div>
  );
};
