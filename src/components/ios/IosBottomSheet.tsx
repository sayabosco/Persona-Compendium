import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface IosBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  accentColor?: string;
}

export const IosBottomSheet = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  accentColor = '#f43f5e'
}: IosBottomSheetProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
      />

      {/* Modal sheet card */}
      <div className="relative w-full max-w-xl mx-auto bg-zinc-900 border-t border-x border-white/10 rounded-t-[28px] shadow-2xl flex flex-col max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* iOS Drag Handle */}
        <div className="w-full flex items-center justify-center pt-2.5 pb-1">
          <div className="w-10 h-1.5 bg-zinc-600 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.08] bg-zinc-900/90 backdrop-blur-md">
          <div className="flex-1 pr-3">
            {title && (
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-400 font-medium" style={{ color: accentColor }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            id="modal-close-btn"
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Scroll Container */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-zinc-200 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
