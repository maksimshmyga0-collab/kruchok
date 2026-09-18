import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Send, 
  ArrowLeft, 
  Zap, 
  Sparkles
} from 'lucide-react';
import { CreateListingInput, PlatformType } from '../types';
import { CREATE_PRESETS } from '../data/presets';

interface CreateListingViewProps {
  initialData?: Partial<CreateListingInput>;
  onSubmit: (data: CreateListingInput) => void;
  onBack: () => void;
  isLoading: boolean;
  onFormChange?: (data: CreateListingInput) => void;
}

export const CreateListingView: React.FC<CreateListingViewProps> = ({
  initialData,
  onSubmit,
  onBack,
  isLoading,
  onFormChange,
}) => {
  const [product, setProduct] = useState(initialData?.product || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [condition, setCondition] = useState(initialData?.condition || '');
  const [keyBenefits, setKeyBenefits] = useState(initialData?.keyBenefits || '');
  const [platform, setPlatform] = useState<PlatformType>(initialData?.platform || 'avito');
  const [activePresetId, setActivePresetId] = useState<string>('');

  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const productRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  const resizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTextarea(productRef.current);
  }, [product]);

  useEffect(() => {
    onFormChange?.({
      product,
      price,
      condition,
      keyBenefits,
      platform,
    });
  }, [product, price, condition, keyBenefits, platform, onFormChange]);

  const handleApplyPreset = (id: string) => {
    const found = CREATE_PRESETS.find((p) => p.id === id);
    if (found) {
      setActivePresetId(id);
      setProduct(found.data.product);
      setPrice(found.data.price);
      setCondition(found.data.condition);
      setKeyBenefits(found.data.keyBenefits);
      setPlatform(found.data.platform);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!product.trim() || isLoading) return;

    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    } catch {
      // ignore
    }

    onSubmit({
      product: product.trim(),
      price: price.trim(),
      condition: condition.trim(),
      keyBenefits: keyBenefits.trim(),
      platform,
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
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white py-1 px-2 rounded-lg hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад к выбору</span>
        </button>
        <span className="text-[11px] font-medium text-neutral-500">Сценарий 1: Создание</span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Создать продающее объявление
        </h2>
        <p className="text-xs text-neutral-400">
          Заполни 5 простых полей. AI структурирует факты и создаст 3 сильных варианта заголовка.
        </p>
      </div>

      {/* Fast Presets Carousel */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Быстрые примеры:
          </span>
          <span className="text-[10px] text-neutral-500">свайп</span>
        </div>

        <div
          ref={carouselRef}
          onMouseDown={(e) => {
            if (!carouselRef.current) return;
            isDraggingRef.current = true;
            hasMovedRef.current = false;
            startXRef.current = e.pageX - carouselRef.current.offsetLeft;
            scrollLeftRef.current = carouselRef.current.scrollLeft;
          }}
          onMouseMove={(e) => {
            if (!isDraggingRef.current || !carouselRef.current) return;
            const x = e.pageX - carouselRef.current.offsetLeft;
            const walk = x - startXRef.current;
            if (Math.abs(walk) > 4) hasMovedRef.current = true;
            carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
          }}
          onMouseUp={() => { isDraggingRef.current = false; }}
          onMouseLeave={() => { isDraggingRef.current = false; }}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar -mx-4 px-4 touch-pan-x cursor-grab active:cursor-grabbing select-none overscroll-x-contain"
        >
          {CREATE_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  if (hasMovedRef.current) return;
                  handleApplyPreset(preset.id);
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. What are you selling? */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="create-product" className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              1. Что продаёшь? <span className="text-amber-400">*</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">{product.length}/300</span>
          </div>
          <textarea
            ref={productRef}
            id="create-product"
            required
            rows={2}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Например: iPhone 15 Pro 256GB Natural Titanium, Угловой диван, Ремонт квартир..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none overflow-hidden min-h-[64px] leading-relaxed"
          />
        </div>

        {/* 2. Price */}
        <div className="space-y-1.5">
          <label htmlFor="create-price" className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
            2. Цена
          </label>
          <input
            id="create-price"
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Например: 87 900 ₽, от 5 000 ₽, торг уместен"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>

        {/* 3. Condition / description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="create-condition" className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              3. Состояние / Описание
            </label>
            <span className="text-[10px] text-neutral-500">честные детали</span>
          </div>
          <textarea
            id="create-condition"
            rows={2}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Например: Б/у 6 месяцев, бережная эксплуатация, в чехле, АКБ 94%, без сколов и ремонтов..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 4. Key Advantages */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="create-benefits" className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              4. Главные преимущества
            </label>
            <span className="text-[10px] text-neutral-500">почему стоит купить</span>
          </div>
          <textarea
            id="create-benefits"
            rows={2}
            value={keyBenefits}
            onChange={(e) => setKeyBenefits(e.target.value)}
            placeholder="Например: Чек о покупке, готов к проверкам, в подарок чехол, Авито-доставка, торг у капота..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 5. Where to publish (Platform Selection) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
            5. Где размещаешь?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p) => {
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  id={`platform-btn-${p.id}`}
                  onClick={() => setPlatform(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 active:scale-98 ${
                    isSelected
                      ? 'bg-neutral-850 border-amber-500 ring-1 ring-amber-500/40 text-white shadow-sm'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0">
                      {p.icon}
                    </span>
                    <span className="font-semibold text-xs text-neutral-200 truncate">{p.label}</span>
                  </div>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-950/60 text-neutral-400 shrink-0">
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary in-form CTA for desktop/browser preview */}
        <div className="pt-2">
          <button
            type="submit"
            id="create-submit-btn"
            disabled={!product.trim() || isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Создаём объявление...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                <span>Создать продающее объявление</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
