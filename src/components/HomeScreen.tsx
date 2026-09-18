import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Send, 
  Zap, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { HistoryListingItem, PlatformType } from '../types';

interface HomeScreenProps {
  onSelectCreate: () => void;
  onSelectImprove: () => void;
  remainingGenerations: number;
  isPro: boolean;
  onOpenMonetization: () => void;
  recentListings: HistoryListingItem[];
  onOpenListing: (item: HistoryListingItem) => void;
  onOpenAllHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectCreate,
  onSelectImprove,
  remainingGenerations,
  isPro,
  onOpenMonetization,
  recentListings,
  onOpenListing,
  onOpenAllHistory,
}) => {
  const getPlatformName = (p: PlatformType) => {
    switch (p) {
      case 'avito': return 'Авито';
      case 'telegram': return 'Telegram';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Positioning Hero Block */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden shadow-xl">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Помоги своему объявлению продавать лучше</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Объявление есть.<br />Продаж мало?
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-sm">
              Создай объявление, которое хочется открыть. Покажи ценность товара, сними сомнения покупателя и получи больше откликов.
            </p>
          </div>

          {/* Quick value indicators */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 border-t border-neutral-800/80">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Строго по фактам
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              3 варианта заголовка
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
              Оптимизировано для Авито
            </span>
          </div>
        </div>
      </div>

      {/* 2. Two Major Scenario Cards */}
      <div className="space-y-3">
        {/* Scenario 1: Create Listing */}
        <div
          id="card-scenario-create"
          onClick={onSelectCreate}
          className="p-4.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Создать объявление
            </h2>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <PlusCircle className="w-4.5 h-4.5" />
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed mb-3">
            Для товара или услуги, если ещё нет готового текста. 5 простых полей — продающий текст за 10 секунд.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-850 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
            <span>Заполнить форму</span>
            <span className="flex items-center gap-1">
              Начать <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Scenario 2: Improve Listing */}
        <div
          id="card-scenario-improve"
          onClick={onSelectImprove}
          className="p-4.5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/90 border border-neutral-800 hover:border-amber-500/60 active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Повысить просмотры
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <h2 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
              <span>Улучшить моё объявление</span>
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Вставь текущий текст. AI проведет аудит, покажет диагностику (балл из 100) и устранит слабые места.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-850 text-xs font-semibold text-sky-400 group-hover:text-sky-300">
            <span>Провести аудит текста</span>
            <span className="flex items-center gap-1">
              Улучшить <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quota / Remaining Generations Strip */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-850 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {isPro ? 'Тариф PRO: Безлимит' : `${remainingGenerations} генераций осталось`}
            </p>
            <p className="text-[11px] text-neutral-400">
              {isPro ? 'Все функции разблокированы' : 'Бесплатный стартовый баланс'}
            </p>
          </div>
        </div>

        <button
          id="home-get-more-btn"
          type="button"
          onClick={onOpenMonetization}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 transition-colors cursor-pointer shrink-0"
        >
          Тарифы
        </button>
      </div>

      {/* 4. Recent Listings Section (Мои объявления) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Мои объявления
            </h3>
          </div>
          {recentListings.length > 0 && (
            <button
              id="home-view-all-history-btn"
              type="button"
              onClick={onOpenAllHistory}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Все ({recentListings.length}) →
            </button>
          )}
        </div>

        {recentListings.length === 0 ? (
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-850/80 text-center space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">У вас пока нет сохраненных объявлений</p>
            <p className="text-[11px] text-neutral-500">
              Создайте объявление с нуля или вставьте существующее для аудита
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentListings.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenListing(item)}
                className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 mb-0.5">
                    <span className="font-semibold text-amber-400/90">
                      {getPlatformName(item.platform)}
                    </span>
                    <span>•</span>
                    <span>{item.mode === 'improve' ? 'Улучшено' : 'Создано'}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.product}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
