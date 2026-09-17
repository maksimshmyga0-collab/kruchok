import React from 'react';
import { Star, History, MessageSquareText } from 'lucide-react';

interface HeaderProps {
  stars: number;
  onOpenStarsModal: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  stars,
  onOpenStarsModal,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 px-4 h-12 flex items-center justify-between">
      {/* Brand: Single line, icon + title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <MessageSquareText className="w-4 h-4" />
        </div>
        <span className="font-bold text-base tracking-tight text-white">Kruchok</span>
      </div>

      {/* Right actions: History & Balance */}
      <div className="flex items-center gap-2">
        {/* History Icon Button */}
        <button
          id="history-btn"
          onClick={onOpenHistory}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-850 active:bg-neutral-800 transition-colors cursor-pointer relative"
          title="История генераций"
          aria-label="История"
        >
          <History className="w-4 h-4" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-extrabold flex items-center justify-center">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
        </button>

        {/* Stars Balance */}
        <button
          id="stars-balance-btn"
          onClick={onOpenStarsModal}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-all cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{stars} ⭐️</span>
        </button>
      </div>
    </header>
  );
};
