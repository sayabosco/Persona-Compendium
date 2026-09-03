import { useState } from 'react';
import { ChevronDown, ChevronLeft, Monitor, Smartphone, Sparkles, Check, QrCode, Github } from 'lucide-react';
import { GameId, GameInfo } from '../../types/persona';
import { SUPPORTED_GAMES } from '../../utils/dataLoader';
import { triggerHaptic } from '../../utils/haptics';
import { IosBottomSheet } from './IosBottomSheet';

interface IosNavBarProps {
  currentGame: GameInfo;
  onSelectGame: (gameId: GameId) => void;
  isIPhoneFrameMode: boolean;
  onToggleFrameMode: () => void;
  onOpenConnectModal: () => void;
  onOpenDeployModal?: () => void;
  canBackToHub?: boolean;
  onBackToHub?: () => void;
}

export const IosNavBar = ({
  currentGame,
  onSelectGame,
  isIPhoneFrameMode,
  onToggleFrameMode,
  onOpenConnectModal,
  onOpenDeployModal,
  canBackToHub,
  onBackToHub
}: IosNavBarProps) => {
  const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);

  return (
    <>
      <div className="sticky top-7 z-30 px-3.5 py-2.5 bg-zinc-950/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Back button matching screenshot: ← Persona 5 Royal */}
          {canBackToHub && onBackToHub && (
            <button
              id="back-to-hub-btn"
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onBackToHub();
              }}
              className="flex items-center gap-0.5 px-2 py-1.5 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white transition-all text-xs font-bold shrink-0 border border-white/10"
              title="Back to Main Browse Hub"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-300" />
              <span className="hidden xs:inline text-[11px]">Browse</span>
            </button>
          )}

          {/* Game Title with dropdown trigger */}
          <button
            id="game-selector-btn"
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsGamePickerOpen(true);
            }}
            className="flex items-center gap-2 group text-left transition-transform active:scale-95 min-w-0"
          >
            {currentGame.logo ? (
              <div className="h-7 px-1.5 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                <img
                  src={currentGame.logo}
                  alt={currentGame.title}
                  className="h-4 object-contain max-w-[55px]"
                />
              </div>
            ) : (
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm border shrink-0"
                style={{
                  backgroundColor: `${currentGame.color}25`,
                  borderColor: `${currentGame.color}50`,
                  color: currentGame.color
                }}
              >
                {currentGame.series.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-0.5 truncate">
                  {currentGame.shortTitle}
                  <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
                </h1>
              </div>
              <p className="text-[9px] text-zinc-400 font-medium truncate max-w-[100px] sm:max-w-[160px]">
                {currentGame.sub}
              </p>
            </div>
          </button>
        </div>

        {/* Right side controls: GitHub Deploy, Mobile QR, Desktop Frame toggle */}
        <div className="flex items-center gap-1.5">
          {onOpenDeployModal && (
            <button
              id="github-deploy-btn"
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenDeployModal();
              }}
              title="Host on GitHub Pages / Vercel"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-[11px] hidden sm:inline">Deploy</span>
            </button>
          )}

          <button
            id="iphone-connect-btn"
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenConnectModal();
            }}
            title="Scan QR to open on iPhone"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] hidden sm:inline">iPhone QR</span>
          </button>

          <button
            id="desktop-frame-toggle-btn"
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onToggleFrameMode();
            }}
            title={isIPhoneFrameMode ? 'Switch to Full Screen view' : 'Switch to iPhone 16 Pro Frame view'}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            {isIPhoneFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px]">Full</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" style={{ color: currentGame.color }} />
                <span className="text-[11px]">Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Game Selector iOS Presentation Sheet */}
      <IosBottomSheet
        isOpen={isGamePickerOpen}
        onClose={() => setIsGamePickerOpen(false)}
        title="Select Persona Title"
        subtitle="Switch compendium, fusions, confidants, and school answers"
        accentColor={currentGame.color}
      >
        <div className="space-y-2">
          {SUPPORTED_GAMES.map((game) => {
            const isSelected = game.id === currentGame.id;
            return (
              <div
                key={game.id}
                onClick={() => {
                  triggerHaptic('medium');
                  onSelectGame(game.id);
                  setIsGamePickerOpen(false);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-800/90 border-white/20 shadow-md'
                    : 'bg-zinc-950/60 border-white/5 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {game.logo ? (
                    <div className="h-10 px-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                      <img
                        src={game.logo}
                        alt={game.title}
                        className="h-6 object-contain max-w-[90px]"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border"
                      style={{
                        backgroundColor: `${game.color}25`,
                        borderColor: `${game.color}50`,
                        color: game.color
                      }}
                    >
                      {game.series.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {game.title}
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-zinc-400">{game.sub}</p>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: game.color }} />
                )}
              </div>
            );
          })}
        </div>
      </IosBottomSheet>
    </>
  );
};
