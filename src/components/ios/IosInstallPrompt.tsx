import { useState, useEffect } from 'react';
import { Share, PlusSquare, Smartphone, Check, X, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface IosInstallPromptProps {
  accentColor?: string;
  onDismiss?: () => void;
}

export const IosInstallPrompt = ({
  accentColor = '#f43f5e',
  onDismiss
}: IosInstallPromptProps) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if running in standalone iOS PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Auto-show once if not standalone and hasn't been dismissed
    const hasSeen = localStorage.getItem('ios_pwa_guide_dismissed');
    if (!hasSeen && !isStandaloneMode) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    triggerHaptic('light');
    localStorage.setItem('ios_pwa_guide_dismissed', 'true');
    setIsOpen(false);
    if (onDismiss) onDismiss();
  };

  if (isStandalone || !isOpen) return null;

  return (
    <div
      id="ios-install-banner"
      className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto p-4 bg-zinc-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Install on iPhone
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-200 font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> PWA
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
              Add to your iPhone Home Screen for offline mode and full-screen experience:
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* iOS Steps */}
      <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
        <div className="p-2 rounded-xl bg-zinc-800/70 border border-white/5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Share className="w-3.5 h-3.5" />
          </div>
          <span className="leading-tight">
            1. Tap <strong>Share</strong> in Safari
          </span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-800/70 border border-white/5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <PlusSquare className="w-3.5 h-3.5" />
          </div>
          <span className="leading-tight">
            2. Choose <strong>Add to Home Screen</strong>
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">
          Fast launch &bull; Offline data &bull; Zero address bar
        </span>
        <button
          onClick={handleDismiss}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Got it
        </button>
      </div>
    </div>
  );
};
