import React from 'react';
import { X, Trash2, ArrowRight, BookmarkCheck, ShoppingBag, Send } from 'lucide-react';
import { HistoryListingItem, PlatformType } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryListingItem[];
  onSelectListing: (item: HistoryListingItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectListing,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'avito':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'telegram':
        return <Send className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const getPlatformName = (platform: PlatformType) => {
    switch (platform) {
      case 'avito': return 'Авито';
      case 'telegram': return 'Telegram';
    }
  };

  const formatItemDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Сегодня, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Мои объявления</h3>
            <span className="text-xs text-neutral-400">({history.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                id="clear-all-history-btn"
                onClick={onClearHistory}
                title="Очистить историю"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              id="close-history-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Ads */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 space-y-2">
              <BookmarkCheck className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
              <p className="text-xs font-semibold text-neutral-400">История объявлений пуста</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                Созданные или улучшенные объявления будут автоматически сохраняться здесь
              </p>
            </div>
          ) : (
            history.map((item) => {
              const activeTitle = item.result.titles[item.result.selectedTitleIndex]?.text || item.result.titles[0]?.text || '';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectListing(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-850/80 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {getPlatformIcon(item.platform)}
                      <span className="font-semibold text-neutral-300">
                        {getPlatformName(item.platform)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                        {item.mode === 'improve' ? 'Улучшено' : 'Создано'}
                      </span>
                      <span>{formatItemDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                    {item.product}
                  </p>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {activeTitle}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2.5 pt-2 border-t border-neutral-850">
                    <span>3 варианта заголовка + описание</span>
                    <span className="text-amber-400 group-hover:text-amber-300 flex items-center gap-0.5 font-medium">
                      Открыть <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
