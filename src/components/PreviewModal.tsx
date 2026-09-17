import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Send, 
  Share2, 
  Mail, 
  CheckCircle2, 
  Star, 
  Phone, 
  MessageCircle, 
  Heart, 
  Truck, 
  ShieldCheck,
  ThumbsUp,
  Bookmark
} from 'lucide-react';
import { TextVariant, PlatformType } from '../types';

interface PreviewModalProps {
  variant: TextVariant | null;
  platform: PlatformType;
  price?: string;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  variant,
  platform,
  price,
  onClose,
}) => {
  if (!variant) return null;

  const renderAvitoPreview = () => (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 max-w-xl mx-auto space-y-4 text-neutral-100">
      {/* Avito Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <ShoppingBag className="w-4 h-4" />
          Объявление на Авито
        </span>
        <span className="text-[11px] text-neutral-500">№ 394820194 • Сегодня, 12:45</span>
      </div>

      {/* Listing Title */}
      <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
        {variant.title}
      </h2>

      {/* Price & Badges */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-black text-white">
          {price || 'Цена договорная'}
        </span>
        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Продавец подтверждён
        </span>
        <span className="flex items-center gap-1 text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          <Truck className="w-3.5 h-3.5" />
          Авито Доставка
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
          <Phone className="w-3.5 h-3.5" />
          Показать телефон
        </button>
        <button className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Написать сообщение
        </button>
      </div>

      {/* Seller Snippet */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-400">
            П
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-1">
              Продавец на Авито
              <CheckCircle2 className="w-3 h-3 text-sky-400" />
            </div>
            <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
              <span className="text-amber-400 flex items-center">
                <Star className="w-3 h-3 fill-amber-400 inline mr-0.5" /> 5.0
              </span>
              <span>• 48 отзывов</span>
            </div>
          </div>
        </div>
        <button className="text-xs text-neutral-400 hover:text-white p-2">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Formatted Description */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Описание
        </h3>
        <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
          <p className="font-medium text-amber-300/90 mb-2">{variant.lead}</p>
          {variant.body}
          <div className="mt-3 pt-2 border-t border-neutral-800 font-semibold text-emerald-300">
            {variant.callToAction}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTelegramPreview = () => (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 max-w-lg mx-auto text-neutral-100 space-y-4">
      {/* Telegram Channel Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">
          Т
        </div>
        <div>
          <div className="font-bold text-sm text-white flex items-center gap-1">
            Канал с анонсами
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-[11px] text-neutral-400">8 450 подписчиков</div>
        </div>
      </div>

      {/* Post Bubble */}
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-xs space-y-3 shadow-md">
        <div className="font-bold text-sm text-white">{variant.title}</div>
        <p className="text-sky-300 font-medium">{variant.lead}</p>
        <div className="text-neutral-200 leading-relaxed whitespace-pre-line">
          {variant.body}
        </div>
        <div className="pt-2 border-t border-neutral-800 font-bold text-amber-400">
          {variant.callToAction}
        </div>
        <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2">
          <span>14:20</span>
          <span>👁 2.1K</span>
        </div>
      </div>

      {/* Telegram Reactions */}
      <div className="flex gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center gap-1">
          🔥 38
        </span>
        <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center gap-1">
          ❤️ 19
        </span>
        <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center gap-1">
          👍 14
        </span>
      </div>
    </div>
  );

  const renderSocialPreview = () => (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 max-w-lg mx-auto text-neutral-100 space-y-4">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
            М
          </div>
          <div>
            <div className="font-bold text-sm text-white">Бизнес & Продажи</div>
            <div className="text-[11px] text-neutral-400">2 часа назад</div>
          </div>
        </div>
        <button className="text-neutral-400 hover:text-white p-1">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Post Text */}
      <div className="bg-neutral-950/60 rounded-xl p-4 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-line space-y-2">
        <div className="font-bold text-sm text-purple-300">{variant.title}</div>
        <p className="font-medium text-neutral-100">{variant.lead}</p>
        <p>{variant.body}</p>
        <p className="font-bold text-emerald-400">{variant.callToAction}</p>
      </div>

      {/* Social Interactions */}
      <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
        <span className="flex items-center gap-1 text-rose-400">
          <Heart className="w-4 h-4 fill-rose-500/20" /> 142
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" /> 28
        </span>
        <span className="flex items-center gap-1">
          <Share2 className="w-4 h-4" /> 15
        </span>
      </div>
    </div>
  );

  const renderEmailPreview = () => (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 max-w-xl mx-auto text-neutral-100 space-y-4">
      {/* Email Header */}
      <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800 space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 w-16">Тема:</span>
          <span className="font-bold text-white">{variant.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 w-16">От кого:</span>
          <span className="text-neutral-300">Сервис Kruchok &lt;offer@kruchok.io&gt;</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="bg-neutral-950/40 rounded-xl p-5 border border-neutral-800 text-xs text-neutral-200 space-y-3 leading-relaxed whitespace-pre-line">
        <p className="font-medium text-neutral-100">{variant.lead}</p>
        <div>{variant.body}</div>
        <div className="pt-4 text-center">
          <button className="px-6 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition-colors inline-block">
            {variant.callToAction}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-10 bg-neutral-900/90 backdrop-blur-md px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {variant.approachTitle}
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-xs text-neutral-300">Реалистичный предпросмотр</span>
          </div>
          <button
            id="close-preview-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {platform === 'avito' && renderAvitoPreview()}
          {platform === 'telegram' && renderTelegramPreview()}
          {platform === 'social' && renderSocialPreview()}
          {platform === 'email' && renderEmailPreview()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-400">
          <span>Текст готов к публикации на {platform.toUpperCase()}</span>
          <button
            id="close-modal-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
