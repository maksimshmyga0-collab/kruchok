import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Zap,
  ShoppingBag,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { ListingResult, QuickActionType, PlatformType } from '../types';

interface ResultViewProps {
  result: ListingResult;
  onQuickAction: (action: QuickActionType) => void;
  isQuickActionLoading: boolean;
  onBackToEdit: () => void;
  onShowToast: (msg: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onQuickAction,
  isQuickActionLoading,
  onBackToEdit,
  onShowToast,
}) => {
  const [selectedTitleIdx, setSelectedTitleIdx] = useState(result.selectedTitleIndex || 0);
  const [copiedSection, setCopiedSection] = useState<'all' | 'title' | 'body' | null>(null);

  const currentTitle = result.titles[selectedTitleIdx]?.text || result.titles[0]?.text || '';
  const currentBody = result.body;

  const copyToClipboard = async (text: string, section: 'all' | 'title' | 'body', label: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for iframe / unsupported
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedSection(section);
      onShowToast(`${label} скопировано ✓`);

      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {
        // ignore
      }

      setTimeout(() => {
        setCopiedSection((prev) => (prev === section ? null : prev));
      }, 2500);
    } catch (err) {
      console.error('Ошибка копирования:', err);
      onShowToast('Не удалось скопировать текст');
    }
  };

  const handleCopyAll = () => {
    const full = `${currentTitle}\n\n${currentBody}`;
    copyToClipboard(full, 'all', 'Объявление целиком');
  };

  const handleCopyTitle = () => {
    copyToClipboard(currentTitle, 'title', 'Заголовок');
  };

  const handleCopyBody = () => {
    copyToClipboard(currentBody, 'body', 'Описание');
  };

  const quickActions: { id: QuickActionType; label: string; icon: string }[] = [
    { id: 'sharpen_title', label: 'Усилить заголовок', icon: '⚡' },
    { id: 'shorten', label: 'Сделать короче', icon: '✂️' },
    { id: 'convince', label: 'Сделать убедительнее', icon: '🎯' },
    { id: 'trust', label: 'Добавить доверие', icon: '🛡️' },
    { id: 'natural', label: 'Сделать более естественным', icon: '💬' },
    { id: 'avito_style', label: 'Сделать под Avito', icon: '📦' },
  ];

  const getPlatformLabel = (p: PlatformType) => {
    switch (p) {
      case 'avito': return 'Авито';
      case 'telegram': return 'Telegram';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-neutral-850">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white py-1.5 px-2.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Изменить параметры</span>
        </button>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>ОБЪЯВЛЕНИЕ ГОТОВО</span>
        </div>
      </div>

      {/* Target product and platform pill */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
        <span className="truncate text-neutral-300">
          Товар: <strong className="text-white font-semibold">{result.product}</strong>
        </span>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
          {getPlatformLabel(result.platform)}
        </span>
      </div>

      {/* Copy All Button (Prominent CTA) */}
      <button
        id="copy-all-btn"
        type="button"
        onClick={handleCopyAll}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
          copiedSection === 'all'
            ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
            : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-500/20'
        }`}
      >
        {copiedSection === 'all' ? (
          <>
            <Check className="w-4 h-4 text-neutral-950" />
            <span>Скопировано целиком ✓</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-neutral-950" />
            <span>Скопировать всё (заголовок + описание)</span>
          </>
        )}
      </button>

      {/* 1. TITLE BLOCK (С несколькими вариантами) */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Заголовок объявления
          </span>
          <button
            id="copy-title-btn"
            type="button"
            onClick={handleCopyTitle}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-lg transition-colors cursor-pointer ${
              copiedSection === 'title'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-amber-400 hover:text-amber-300 hover:bg-neutral-800'
            }`}
          >
            {copiedSection === 'title' ? (
              <>
                <Check className="w-3 h-3" />
                <span>Скопировано ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>

        {/* Multiple Title Option Tabs */}
        {result.titles.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-850">
            {result.titles.map((opt, idx) => {
              const isSelected = selectedTitleIdx === idx;
              return (
                <button
                  key={opt.id || idx}
                  type="button"
                  onClick={() => setSelectedTitleIdx(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {opt.label || `Вариант ${idx + 1}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Title Display */}
        <div className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 text-sm font-bold text-white leading-snug select-all">
          {currentTitle}
        </div>
      </div>

      {/* 2. DESCRIPTION BLOCK */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Текст описания
          </span>
          <button
            id="copy-body-btn"
            type="button"
            onClick={handleCopyBody}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-lg transition-colors cursor-pointer ${
              copiedSection === 'body'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-amber-400 hover:text-amber-300 hover:bg-neutral-800'
            }`}
          >
            {copiedSection === 'body' ? (
              <>
                <Check className="w-3 h-3" />
                <span>Скопировано ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted body text */}
        <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 text-xs sm:text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed select-all">
          {currentBody}
        </div>
      </div>

      {/* 3. WHY IT WORKS (ПОЧЕМУ ЭТО РАБОТАЕТ) */}
      {result.whyItWorks && result.whyItWorks.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/20 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Почему это работает:
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            {result.whyItWorks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. WHAT TO ADD (ЧТО МОЖНО УЛУЧШИТЬ ПРОДАВЦУ) */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sky-500/15 flex items-center justify-center text-sky-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              Что можно добавить для максимального доверия:
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span className="leading-snug">{rec}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-neutral-500 italic pt-1 border-t border-neutral-850">
            AI не выдумывает характеристики — добавьте эти детали в объявление, если они есть.
          </p>
        </div>
      )}

      {/* 5. QUICK ACTIONS («УСИЛИТЬ») */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Быстрые действия («Усилить»):
          </span>
          {isQuickActionLoading && (
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
              Дорабатываем...
            </span>
          )}
        </div>
        <p className="text-[11px] text-neutral-400">
          Нажми действие — текст обновится без повторного заполнения формы:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              type="button"
              id={`quick-action-${qa.id}`}
              disabled={isQuickActionLoading}
              onClick={() => onQuickAction(qa.id)}
              className="p-2.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 text-left transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs">{qa.icon}</span>
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors">
                  {qa.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
