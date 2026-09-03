import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, QrCode, Copy, Check, ExternalLink, AlertTriangle, Share, PlusSquare } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { IosBottomSheet } from './IosBottomSheet';

interface IosConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const IosConnectionModal = ({
  isOpen,
  onClose,
  accentColor = '#f43f5e'
}: IosConnectionModalProps) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const sharedUrl = 'https://ais-pre-sfsvlfeuevwloiiesxix7i-651576422478.asia-southeast1.run.app';
  const devUrl = 'https://ais-dev-sfsvlfeuevwloiiesxix7i-651576422478.asia-southeast1.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(sharedUrl, {
        width: 280,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [isOpen, sharedUrl]);

  const copyToClipboard = (text: string) => {
    triggerHaptic('medium');
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <IosBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Run on Your iPhone"
      subtitle="How to fix 'Page not found' & connect your device"
      accentColor={accentColor}
    >
      <div className="space-y-4 text-zinc-200">
        {/* Why 404 happened notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Why did Safari say "Error: Page not found"?</span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            The shared link is only activated <strong>after</strong> you click the <strong>"Share"</strong> button in Google AI Studio (in the top-right corner of your desktop browser).
          </p>
        </div>

        {/* Step-by-Step Activation Guide */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            How to run in 3 quick steps:
          </span>

          <div className="space-y-2.5 text-xs">
            {/* Step 1 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-white/10">
                1
              </span>
              <div>
                <strong className="text-white">Click "Share" in AI Studio:</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Look at the top-right header in Google AI Studio on your computer and click the <strong>Share</strong> button to publish your applet.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-white/10">
                2
              </span>
              <div className="flex-1">
                <strong className="text-white">Scan the QR code or open the link on your iPhone:</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Open your iPhone Camera app and point it at the QR code below, or paste the link into Safari.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-white/10">
                3
              </span>
              <div>
                <strong className="text-white">Add to Home Screen:</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  In Safari, tap the <strong>Share</strong> icon (square with arrow) &rarr; <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        {qrDataUrl && (
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col items-center justify-center space-y-2.5">
            <div className="p-2.5 bg-white rounded-2xl shadow-xl">
              <img src={qrDataUrl} alt="Persona App iPhone QR Code" className="w-48 h-48 rounded-lg" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan with your iPhone Camera</span>
            </div>
          </div>
        )}

        {/* Direct URLs with Copy Button */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">Shared App URL</span>
            <button
              onClick={() => copyToClipboard(sharedUrl)}
              className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white px-2 py-0.5 rounded-md bg-zinc-800 border border-white/10 transition-colors"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Link
                </>
              )}
            </button>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 font-mono text-[11px] text-zinc-400 break-all select-all">
            {sharedUrl}
          </div>
        </div>

        {/* Alternative Dev URL */}
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 text-[11px] text-zinc-400 space-y-1">
          <span className="font-semibold text-zinc-300">Alternative: Development URL</span>
          <p className="text-[10px] leading-relaxed">
            If you are signed into your Google account on your iPhone browser, you can also access the development preview directly:
          </p>
          <a
            href={devUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-zinc-300 hover:underline break-all font-mono"
          >
            {devUrl} <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      </div>
    </IosBottomSheet>
  );
};
