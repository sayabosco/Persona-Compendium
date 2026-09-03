import React, { useState } from 'react';
import { IosBottomSheet } from './IosBottomSheet';
import { triggerHaptic } from '../../utils/haptics';
import {
  Globe,
  Github,
  Rocket,
  CheckCircle2,
  Copy,
  ExternalLink,
  Smartphone,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
  accentColor
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `# 1. Initialize git & commit files
git init
git add .
git commit -m "Initial commit of Persona Companion"

# 2. Add your GitHub repository link and push
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main`;

  return (
    <IosBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Host & Deploy Live"
      subtitle="Run your Persona Companion on GitHub Pages or Vercel"
      accentColor={accentColor}
    >
      <div className="space-y-4 text-zinc-200">
        {/* Intro banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border"
            style={{
              backgroundColor: `${accentColor}25`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Turnkey Hosting Ready</h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              We have already pre-configured the project with <code className="text-zinc-200 bg-zinc-800 px-1 rounded">base: './'</code> and a complete GitHub Pages Actions workflow (<code className="text-zinc-200 bg-zinc-800 px-1 rounded">.github/workflows/deploy.yml</code>).
            </p>
          </div>
        </div>

        {/* Option 1: GitHub Pages */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-white" />
              <h4 className="text-sm font-bold text-white">Option 1: GitHub Pages (Free)</h4>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Recommended
            </span>
          </div>

          <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-white">Push to GitHub:</strong> Push this codebase to your own GitHub repository (e.g. <code className="text-zinc-200 bg-zinc-900 px-1 rounded">persona-companion</code>).
            </li>
            <li>
              <strong className="text-white">Enable GitHub Pages:</strong> In your GitHub repository, click on <span className="font-semibold text-zinc-100">Settings</span> &rarr; <span className="font-semibold text-zinc-100">Pages</span>.
            </li>
            <li>
              <strong className="text-white">Set Source to Actions:</strong> Under <em>Build and deployment &gt; Source</em>, select <span className="text-amber-300 font-bold">GitHub Actions</span>.
            </li>
            <li>
              <strong className="text-white">Done!</strong> GitHub will automatically build and publish your app at <code className="text-sky-300 bg-zinc-900 px-1 rounded">https://&lt;username&gt;.github.io/&lt;repo&gt;/</code>!
            </li>
          </ol>

          {/* Code snippet */}
          <div className="relative mt-2">
            <pre className="p-3 bg-zinc-900 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto border border-white/5">
              {gitCommands}
            </pre>
            <button
              onClick={() => copyToClipboard(gitCommands, 1)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1 text-[10px] font-sans"
            >
              {copiedIndex === 1 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option 2: Vercel Instant Deploy */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <h4 className="text-sm font-bold text-white">Option 2: Vercel (1-Click Hosting)</h4>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Instant URL
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Sign in at <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">vercel.com</a> with your GitHub account, click <strong>"Add New Project"</strong>, select your repository, and click <strong>"Deploy"</strong>. It provides an instant HTTPS production domain!
          </p>
        </div>

        {/* Option 3: Add to iPhone Home Screen */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Use as an iPhone App (PWA)</h4>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Once your site is live (or while using the AI Studio preview link):
          </p>
          <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/5 text-xs text-zinc-300 space-y-1">
            <p>1. Open the live link in <span className="font-semibold text-white">Safari</span> on your iPhone.</p>
            <p>2. Tap the <span className="font-semibold text-white">Share icon</span> (square with arrow pointing up) at the bottom.</p>
            <p>3. Scroll down and tap <span className="font-bold text-emerald-400">"Add to Home Screen"</span>.</p>
            <p className="text-zinc-400 text-[11px] pt-1">
              It will launch in fullscreen with an authentic iOS app icon without Safari URL bars!
            </p>
          </div>
        </div>

        {/* Close action */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-zinc-900 bg-white hover:bg-zinc-100 transition-all active:scale-[0.99] shadow-lg"
        >
          Got it, Close Guide
        </button>
      </div>
    </IosBottomSheet>
  );
};
