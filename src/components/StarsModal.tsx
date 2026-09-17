import React, { useState } from 'react';
import { X, Star, Send, Gift, Check, Sparkles, HelpCircle } from 'lucide-react';

interface StarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  onAddStars: (amount: number) => void;
}

export const StarsModal: React.FC<StarsModalProps> = ({
  isOpen,
  onClose,
  stars,
  onAddStars,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoSuccess('');
    setPromoError('');

    const clean = promoCode.trim().toUpperCase();
    if (clean === 'KRUCHOK' || clean === 'TEXTOFF' || clean === 'AVITO' || clean === 'START' || clean === 'AVITO50') {
      onAddStars(50);
      setPromoSuccess('Промокод применен: +50 ⭐️ начислено!');
      setPromoCode('');
    } else {
      setPromoError('Неверный промокод. Попробуйте промокод KRUCHOK или START');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Баланс Telegram Stars</h3>
              <p className="text-[11px] text-neutral-400">Оплата дополнительных вариантов</p>
            </div>
          </div>
          <button
            id="close-stars-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="p-6 text-center bg-gradient-to-b from-neutral-850 to-neutral-900 border-b border-neutral-800">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-2xl shadow-inner mb-2">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{stars} ⭐️</span>
          </div>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Первый вариант всегда бесплатен. Второй и третий варианты (выгода и соцдоказательство) открываются за <strong className="text-amber-300">50 ⭐️</strong>.
          </p>
        </div>

        {/* Top-up options */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
              Быстрое пополнение (Демо / Тест):
            </span>
            <button
              id="add-free-stars-btn"
              type="button"
              onClick={() => onAddStars(100)}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                Тестовый бонус для оценки
              </span>
              <span className="text-amber-400 font-bold">+100 ⭐️ Бесплатно</span>
            </button>
          </div>

          {/* Promo code */}
          <div>
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                Промокод бота:
              </span>
              <div className="flex gap-2">
                <input
                  id="promo-input"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Введи KRUCHOK или START"
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  id="apply-promo-btn"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Применить
                </button>
              </div>
              {promoSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5" /> {promoSuccess}
                </p>
              )}
              {promoError && (
                <p className="text-xs text-rose-400 mt-1">{promoError}</p>
              )}
            </form>
          </div>

          {/* Telegram Bot Link */}
          <div className="pt-2">
            <a
              id="tg-bot-stars-link"
              href="https://t.me/kruchokbot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Перейти в Telegram-бота @kruchokbot</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
