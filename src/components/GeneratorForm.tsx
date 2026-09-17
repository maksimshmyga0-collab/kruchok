import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Send, 
  Share2, 
  Mail, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Zap 
} from 'lucide-react';
import { GenerationRequest, PlatformType, ToneType } from '../types';
import { PRESETS } from '../data/presets';

interface GeneratorFormProps {
  onSubmit: (data: GenerationRequest) => void;
  isLoading: boolean;
  activePresetId?: string;
  onApplyPreset: (presetId: string) => void;
  initialData: GenerationRequest;
  onFormChange?: (data: GenerationRequest) => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onSubmit,
  isLoading,
  activePresetId,
  onApplyPreset,
  initialData,
  onFormChange,
}) => {
  const [platform, setPlatform] = useState<PlatformType>(initialData.platform);
  const [product, setProduct] = useState(initialData.product);
  const [targetAudience, setTargetAudience] = useState(initialData.targetAudience);
  const [tone, setTone] = useState<ToneType>(initialData.tone);
  const [price, setPrice] = useState(initialData.price || '');
  const [extraDetails, setExtraDetails] = useState(initialData.extraDetails || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const productRef = React.useRef<HTMLTextAreaElement>(null);
  const audienceRef = React.useRef<HTMLTextAreaElement>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const offset = direction === 'left' ? -180 : 180;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const resizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Sync if initialData changes (e.g. preset applied or history restored)
  React.useEffect(() => {
    setPlatform(initialData.platform);
    setProduct(initialData.product);
    setTargetAudience(initialData.targetAudience);
    setTone(initialData.tone);
    setPrice(initialData.price || '');
    setExtraDetails(initialData.extraDetails || '');
  }, [initialData]);

  React.useEffect(() => {
    resizeTextarea(productRef.current);
  }, [product]);

  React.useEffect(() => {
    resizeTextarea(audienceRef.current);
  }, [targetAudience]);

  // Notify parent of state changes so sticky/Telegram button knows valid state
  React.useEffect(() => {
    onFormChange?.({
      platform,
      product,
      targetAudience,
      tone,
      price,
      extraDetails,
    });
  }, [platform, product, targetAudience, tone, price, extraDetails, onFormChange]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!product.trim() || isLoading) return;
    
    // Trigger Telegram haptic if available
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    } catch {
      // ignore
    }

    onSubmit({
      platform,
      product: product.trim(),
      targetAudience: targetAudience.trim(),
      tone,
      price: price.trim(),
      extraDetails: extraDetails.trim(),
    });
  };

  const platforms: { id: PlatformType; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      id: 'avito',
      label: 'Авито',
      icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />,
      badge: 'Хит',
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <Send className="w-3.5 h-3.5 text-sky-400" />,
      badge: 'Посты',
    },
    {
      id: 'social',
      label: 'Соцсети',
      icon: <Share2 className="w-3.5 h-3.5 text-purple-400" />,
      badge: 'VK/Инста',
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="w-3.5 h-3.5 text-amber-400" />,
      badge: 'Рассылка',
    },
  ];

  const tones: { id: ToneType; label: string; emoji: string; desc: string }[] = [
    {
      id: 'friendly',
      label: 'Дружелюбно',
      emoji: '🌿',
      desc: 'Теплый, заботливый диалог',
    },
    {
      id: 'business',
      label: 'Экспертно',
      emoji: '💼',
      desc: 'Факты, цифры и гарантии',
    },
    {
      id: 'aggressive',
      label: 'Агрессивно',
      emoji: '⚡',
      desc: 'Дедлайн, выгода, оффер',
    },
    {
      id: 'creative',
      label: 'Креативно',
      emoji: '💡',
      desc: 'Нестандартная подача',
    },
    {
      id: 'direct',
      label: 'Без воды',
      emoji: '🎯',
      desc: 'Суть и параметры сразу',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Fast Examples: Horizontal Scroll Carousel with touch swipe, mouse drag, and navigation controls */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Быстрые примеры:
          </span>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <button
              type="button"
              id="presets-scroll-left"
              onClick={() => scrollCarousel('left')}
              className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Прокрутить влево"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-neutral-500 select-none">свайп</span>
            <button
              type="button"
              id="presets-scroll-right"
              onClick={() => scrollCarousel('right')}
              className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Прокрутить вправо"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div 
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar -mx-4 px-4 touch-pan-x cursor-grab active:cursor-grabbing select-none overscroll-x-contain"
        >
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                id={`preset-btn-${preset.id}`}
                onClick={() => {
                  if (hasMovedRef.current) return;
                  try {
                    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                  } catch {
                    // ignore
                  }
                  onApplyPreset(preset.id);
                }}
                className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500/70 text-amber-300 font-semibold shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2. Platform Selection: 2x2 grid on mobile */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
            1. Где публикуешь?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p) => {
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  id={`platform-select-${p.id}`}
                  onClick={() => {
                    try {
                      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                    } catch {
                      // ignore
                    }
                    setPlatform(p.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-98 ${
                    isSelected
                      ? 'bg-neutral-850 border-amber-500 ring-1 ring-amber-500/40 text-white shadow-sm'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-neutral-950 border border-neutral-800">
                      {p.icon}
                    </span>
                    <span className="font-semibold text-xs text-neutral-200">{p.label}</span>
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-950/60 text-neutral-400">
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Fields: What are you selling & To whom (STACKED vertically in ONE column) */}
        <div className="space-y-3.5">
          {/* What are you selling */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="product-input" className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                2. Что продаёшь? <span className="text-amber-400">*</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">{product.length}/400</span>
            </div>
            <textarea
              ref={productRef}
              id="product-input"
              required
              rows={2}
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Товар или услуга (например: iPhone 15 Pro 256GB в идеале с чеком, ремонт квартир под ключ...)"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-[border-color] resize-none overflow-hidden leading-relaxed min-h-[68px]"
            />
          </div>

          {/* Who are you selling to */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="target-audience-input" className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Кому продаёшь? (ЦА)
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">{targetAudience.length}/250</span>
            </div>
            <textarea
              ref={audienceRef}
              id="target-audience-input"
              rows={2}
              value={targetAudience}
              onChange={(e) => {
                setTargetAudience(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Кому: покупатели для себя, семьи в новостройки, предприниматели..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-[border-color] resize-none overflow-hidden leading-relaxed min-h-[58px]"
            />
          </div>
        </div>

        {/* 4. Tone of Voice: 2xN grid */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
            3. Тон текста
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((t) => {
              const isSelected = tone === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  id={`tone-select-${t.id}`}
                  onClick={() => {
                    try {
                      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                    } catch {
                      // ignore
                    }
                    setTone(t.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98 ${
                    isSelected
                      ? 'bg-neutral-850 border-amber-500 ring-1 ring-amber-500/40 text-white shadow-sm'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{t.emoji}</span>
                    <span className="text-xs font-semibold text-neutral-200">{t.label}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 line-clamp-1 leading-tight">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Advanced Options Accordion */}
        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
          <button
            type="button"
            id="toggle-advanced-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              Дополнительно (цена, оффер, скидки)
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-3 border-t border-neutral-800 space-y-2.5">
              <div>
                <label htmlFor="price-input" className="block text-[11px] text-neutral-400 mb-1">
                  Цена / Оффер
                </label>
                <input
                  id="price-input"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Например: 87 900 ₽, скидка 15%"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="extra-details-input" className="block text-[11px] text-neutral-400 mb-1">
                  Условия (гарантия, доставка, бонус)
                </label>
                <input
                  id="extra-details-input"
                  type="text"
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  placeholder="Например: Самовывоз, Авито-доставка, торг"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
