import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Eye, 
  Lock, 
  Star, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Award, 
  Share2 
} from 'lucide-react';
import { TextVariant, PlatformType } from '../types';

interface ResultCardProps {
  variant: TextVariant;
  index: number;
  platform: PlatformType;
  onUnlock: () => void;
  onPreview: (variant: TextVariant) => void;
  userStars: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  variant,
  index,
  platform,
  onUnlock,
  onPreview,
  userStars,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);

  const handleCopyFull = async () => {
    try {
      await navigator.clipboard.writeText(variant.fullText);
      setCopied(true);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {
        // ignore
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(variant.title);
      setCopiedTitle(true);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
      } catch {
        // ignore
      }
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const getApproachVisuals = () => {
    switch (variant.approach) {
      case 'pain':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          accentBorder: 'border-rose-500/30',
          badgeText: 'Вариант 1: Через боль',
        };
      case 'benefit':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          accentBorder: 'border-emerald-500/30',
          badgeText: 'Вариант 2: Через выгоду',
        };
      case 'social_proof':
        return {
          icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          accentBorder: 'border-amber-500/30',
          badgeText: 'Вариант 3: Соцдоказательство',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-sky-400" />,
          badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          accentBorder: 'border-sky-500/30',
          badgeText: 'Продающий подход',
        };
    }
  };

  const visuals = getApproachVisuals();

  if (!variant.isUnlocked && !variant.isFree) {
    return (
      <div 
        id={`card-locked-${variant.id}`}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 relative overflow-hidden shadow-md"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${visuals.badgeClass}`}>
            {visuals.icon}
            <span>{visuals.badgeText}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Star className="w-3 h-3 fill-amber-400" />
            50 ⭐️
          </span>
        </div>

        <p className="text-xs text-neutral-400 mb-3">{variant.approachDescription}</p>

        {/* Blurred Teaser Skeleton */}
        <div className="relative select-none filter blur-sm opacity-35 space-y-2 pointer-events-none mb-4">
          <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
          <div className="h-3 bg-neutral-700 rounded w-full"></div>
          <div className="h-3 bg-neutral-700 rounded w-11/12"></div>
          <div className="h-3 bg-neutral-700 rounded w-2/3"></div>
        </div>

        {/* Unlock Action */}
        <div className="pt-3 border-t border-neutral-800/80 text-center">
          <button
            id={`unlock-btn-${variant.id}`}
            onClick={onUnlock}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Открыть за 50 ⭐️</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`card-unlocked-${variant.id}`}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-3.5 shadow-lg"
    >
      {/* Card Header: Approach Badge & Free/Unlocked indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${visuals.badgeClass}`}>
          {visuals.icon}
          <span>{visuals.badgeText}</span>
        </div>

        <div className="flex items-center gap-1">
          {variant.isFree ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Бесплатно
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              Открыто
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-850">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Заголовок / Оффер
          </span>
          <button
            type="button"
            onClick={handleCopyTitle}
            className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copiedTitle ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedTitle ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
        <h3 className="text-sm font-bold text-white leading-snug">{variant.title}</h3>
      </div>

      {/* Main Text Content */}
      <div className="space-y-2 text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-xl border border-neutral-850">
        <p className="font-semibold text-neutral-200">{variant.lead}</p>
        <p className="whitespace-pre-line text-neutral-300">{variant.body}</p>
        <div className="pt-2 border-t border-neutral-800 text-amber-300/90 font-medium">
          👉 {variant.callToAction}
        </div>
      </div>

      {/* Key Triggers / Hooks */}
      {variant.keyHooks && variant.keyHooks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {variant.keyHooks.map((hook, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-300"
            >
              #{hook}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Actions: Copy Full Text & Preview */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
        <button
          type="button"
          onClick={handleCopyFull}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-400 text-neutral-950 hover:bg-amber-300 active:scale-98 font-bold'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Скопировано!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Весь текст</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onPreview(variant)}
          className="py-2 px-3 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700/80 flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-neutral-400" />
          <span>Предпросмотр</span>
        </button>
      </div>
    </div>
  );
};
