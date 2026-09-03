import { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface IosStatusBarProps {
  accentColor?: string;
  gameTitle?: string;
}

export const IosStatusBar = ({ accentColor = '#f43f5e', gameTitle = 'P5 Royal' }: IosStatusBarProps) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      // Optional 12-hour or standard format
      hours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setTimeStr(`${hours}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full pt-safe px-5 pb-1 flex items-center justify-between text-xs font-semibold select-none pointer-events-none text-zinc-100 bg-zinc-950/80 backdrop-blur-xl">
      {/* iOS Clock */}
      <div className="w-16 flex items-center font-mono tracking-tight text-[13px] font-bold text-zinc-200">
        <span>{timeStr}</span>
      </div>

      {/* Dynamic Island / Notch capsule */}
      <div className="flex items-center justify-center">
        <div className="h-6 px-3.5 bg-black/90 border border-white/10 rounded-full flex items-center gap-2 shadow-inner">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 truncate max-w-[130px]">
            {gameTitle}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Status Icons: 5G, Wi-Fi, Battery */}
      <div className="w-16 flex items-center justify-end gap-1.5 text-zinc-300">
        <span className="text-[10px] font-bold tracking-tighter text-zinc-400">5G</span>
        <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
        <div className="flex items-center gap-0.5">
          <Battery className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>
    </header>
  );
};
