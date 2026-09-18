import React from 'react';
import { Zap, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  remainingGenerations: number;
  isPro: boolean;
  onOpenMonetization: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  remainingGenerations,
  isPro,
  onOpenMonetization,
  onOpenHistory,
  historyCount,
  onGoHome,
}) => {
  const formatGenerations = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} генерация`;
    if (
      count % 10 >= 2 &&
      count % 10 <= 4 &&
      (count % 100 < 10 || count % 100 >= 20)
    ) {
      return `${count} генерации`;
    }
    return `${count} генераций`;
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 h-13 flex items-center select-none">
      <div className="w-full max-w-md mx-auto px-2 sm:px-3 h-full flex items-center">
        {/* LEFT: История */}
        <div className="flex-1 flex items-center justify-end pr-3 sm:pr-3.5">
          <button
            id="header-history-btn"
            type="button"
            onClick={onOpenHistory}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[88px] text-xs font-semibold text-neutral-300 hover:text-white rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 active:scale-95 transition-all cursor-pointer shadow-sm shrink-0"
            title="История"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>История</span>
            {historyCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black flex items-center justify-center shrink-0">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
        </div>

        {/* CENTER: КРЮЧОК - Strictly centered relative to screen */}
        <div className="shrink-0 flex items-center justify-center">
          <button
            type="button"
            onClick={onGoHome}
            className="cursor-pointer active:opacity-80 transition-opacity select-none text-center py-1 px-1"
            title="КРЮЧОК"
          >
            <span className="font-extrabold text-lg sm:text-2xl tracking-wider text-white block leading-none">
              КРЮЧОК
            </span>
          </button>
        </div>

        {/* RIGHT: ⚡ 17 генераций */}
        <div className="flex-1 flex items-center justify-start pl-3 sm:pl-3.5">
          <button
            id="header-quota-btn"
            type="button"
            onClick={onOpenMonetization}
            className={`flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11.5px] sm:text-xs font-semibold tracking-tight rounded-xl border transition-all cursor-pointer active:scale-95 shadow-sm shrink-0 ${
              isPro
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : remainingGenerations > 0
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 animate-pulse'
            }`}
            title="Баланс генераций"
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 ${isPro ? 'text-emerald-400 fill-emerald-400' : 'text-amber-400 fill-amber-400'}`} />
            <span className="whitespace-nowrap">
              {isPro ? 'PRO' : formatGenerations(remainingGenerations)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
