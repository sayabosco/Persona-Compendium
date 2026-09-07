import React, { useState } from 'react';
import {
  ChevronDown,
  Smartphone,
  QrCode,
  Github,
  BookOpen,
  Sparkles,
  Shield,
  Users,
  Calendar,
  LayoutGrid
} from 'lucide-react';
import { GameId, GameInfo } from '../../types/persona';
import { SUPPORTED_GAMES, resolveAssetUrl } from '../../utils/dataLoader';
import { triggerHaptic } from '../../utils/haptics';
import { MainTab } from '../ios/IosTabBar';

interface DesktopHeaderProps {
  currentGame: GameInfo;
  onSelectGame: (gameId: GameId) => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onToggleFrameMode: () => void;
  onOpenConnectModal: () => void;
  onOpenDeployModal?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  currentGame,
  onSelectGame,
  activeTab,
  onTabChange,
  onToggleFrameMode,
  onOpenConnectModal,
  onOpenDeployModal
}) => {
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems: { id: MainTab; label: string; icon: React.ElementType }[] = [
    { id: 'browse', label: 'Browse Hub', icon: LayoutGrid },
    { id: 'personas', label: 'Compendium', icon: BookOpen },
    { id: 'fusion', label: 'Fusion Lab', icon: Sparkles },
    { id: 'guides', label: 'Calendar & Guides', icon: Calendar },
    { id: 'social', label: 'Confidants', icon: Users },
    { id: 'enemies', label: 'Shadows & Bosses', icon: Shield }
  ];

  return (
    <header className="w-full bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-6 py-3 transition-all select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Atlus Logo & Game Selector Dropdown */}
        <div className="relative">
          <button
            id="desktop-game-picker-btn"
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsGameDropdownOpen((prev) => !prev);
            }}
            className="flex items-center gap-3 p-1.5 -ml-1.5 rounded-2xl hover:bg-white/5 active:scale-98 transition-all group border border-transparent hover:border-white/10"
          >
            {currentGame.logo && !logoError ? (
              <div className="h-9 px-2 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={resolveAssetUrl(currentGame.logo)}
                  alt={currentGame.title}
                  onError={() => setLogoError(true)}
                  className="h-6 object-contain max-w-[85px]"
                />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-sm border shrink-0"
                style={{
                  backgroundColor: `${currentGame.color}25`,
                  borderColor: `${currentGame.color}50`,
                  color: currentGame.color
                }}
              >
                {currentGame.series.toUpperCase()}
              </div>
            )}

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1">
                  {currentGame.title}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform ${
                      isGameDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </h1>
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-xs"
                  style={{
                    backgroundColor: `${currentGame.color}20`,
                    borderColor: `${currentGame.color}50`,
                    color: currentGame.color
                  }}
                >
                  {currentGame.shortTitle}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Tactical Codex & Walkthrough</p>
            </div>
          </button>

          {/* Desktop Dropdown for Game Switcher */}
          {isGameDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsGameDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Switch Persona Title
                </div>
                {SUPPORTED_GAMES.map((game) => {
                  const isSelected = game.id === currentGame.id;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        onSelectGame(game.id);
                        setIsGameDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 border"
                        style={{
                          backgroundColor: game.color,
                          borderColor: isSelected ? '#ffffff' : 'transparent'
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{game.title}</div>
                        <div className="text-[10px] text-zinc-400">{game.sub}</div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-2xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`desktop-nav-${item.id}`}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-md scale-100'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Tools (iPhone View Switcher, QR, Deploy) */}
        <div className="flex items-center gap-2">
          {onOpenDeployModal && (
            <button
              id="desktop-deploy-btn"
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenDeployModal();
              }}
              title="Deploy or host on GitHub Pages"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:border-white/25 transition-all shadow-sm"
            >
              <Github className="w-3.5 h-3.5 text-zinc-300" />
              <span>Deploy</span>
            </button>
          )}

          <button
            id="desktop-iphone-qr-btn"
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenConnectModal();
            }}
            title="Scan QR to open on iPhone"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:border-white/25 transition-all shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>iPhone QR</span>
          </button>

          <button
            id="desktop-toggle-iphone-frame-btn"
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onToggleFrameMode();
            }}
            title="Switch to simulated iPhone Frame Preview"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/15 text-xs font-bold text-white hover:border-white/35 active:scale-95 transition-all shadow-md"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>iPhone Frame</span>
          </button>
        </div>
      </div>
    </header>
  );
};
