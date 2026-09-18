import React from 'react';
import { X, Zap } from 'lucide-react';
import { MonetizationPlan } from '../types';

export const MONETIZATION_PLANS: MonetizationPlan[] = [
  {
    id: 'pack-10',
    name: '10 генераций',
    generations: 10,
    priceRub: 190,
    priceStars: 190,
    description: 'Для продажи 1-3 личных товаров на Авито',
  },
  {
    id: 'pack-50',
    name: '50 генераций',
    badge: 'Популярный',
    generations: 50,
    priceRub: 590,
    priceStars: 590,
    description: 'Для активных продавцов и специалистов',
  },
  {
    id: 'pro-month',
    name: 'PRO Месяц',
    badge: 'Выгодно',
    generations: 'unlimited',
    priceRub: 990,
    priceStars: 990,
    description: 'Безлимитные генерации и аудит объявлений на 30 дней',
  },
];

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingGenerations: number;
  isPro: boolean;
  onAddGenerations: (amount: number) => void;
  onActivatePro: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  remainingGenerations,
  isPro,
  onAddGenerations,
  onActivatePro,
}) => {
  if (!isOpen) return null;

  const handleSelectPlan = (plan: MonetizationPlan) => {
    if (plan.generations === 'unlimited') {
      onActivatePro();
    } else {
      onAddGenerations(plan.generations);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Генерации & Тарифы</h3>
              <p className="text-[11px] text-neutral-400">
                {isPro ? 'У вас активен тариф PRO' : `Осталось генераций: ${remainingGenerations}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Status info */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 text-center space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">
              {remainingGenerations === 0 && !isPro ? 'Бесплатные генерации израсходованы' : 'Текущий баланс'}
            </span>
            <p className="text-xl font-black text-white">
              {isPro ? 'PRO Безлимит' : `${remainingGenerations} генераций`}
            </p>
            <p className="text-[11px] text-neutral-400">
              Каждая генерация создает 3 варианта заголовка, продающее описание и рекомендации
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Выберите пакет:
            </span>

            {MONETIZATION_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className="p-3.5 rounded-xl bg-neutral-950/70 hover:bg-neutral-850/80 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer group flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {plan.name}
                    </span>
                    {plan.badge && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">
                    {plan.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-white block">
                    {plan.priceRub} ₽
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    или {plan.priceStars} ⭐️
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
