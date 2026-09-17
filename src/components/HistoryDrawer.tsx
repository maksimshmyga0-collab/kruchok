import React from 'react';
import { X, Trash2, ArrowRight, Clock, Star, ShoppingBag, Send, Share2, Mail } from 'lucide-react';
import { HistoryItem, PlatformType } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'avito':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'telegram':
        return <Send className="w-3.5 h-3.5 text-sky-400" />;
      case 'social':
        return <Share2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">История генераций</h3>
            <span className="text-xs text-neutral-400">({history.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                id="clear-history-btn"
                onClick={onClearHistory}
                title="Очистить историю"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-history-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>История пока пуста</p>
              <p className="text-[11px] mt-1 text-neutral-600">
                Сгенерированные тексты будут сохраняться здесь
              </p>
            </div>
          ) : (
            history.map((item) => {
              const firstVariant = item.variants[0];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800/80 hover:border-neutral-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {getPlatformIcon(item.request.platform)}
                      <span className="capitalize font-medium text-neutral-300">
                        {item.request.platform}
                      </span>
                    </div>
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                    {item.request.product}
                  </p>

                  {firstVariant && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {firstVariant.title}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2.5 pt-2 border-t border-neutral-850">
                    <span className="flex items-center gap-1">
                      {item.unlockedVariants ? (
                        <span className="text-amber-400 flex items-center gap-0.5 font-medium">
                          <Star className="w-3 h-3 fill-amber-400" /> 3 варианта открыто
                        </span>
                      ) : (
                        <span>1 вариант (2 закрыты)</span>
                      )}
                    </span>
                    <span className="text-neutral-400 group-hover:text-white flex items-center gap-0.5">
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
