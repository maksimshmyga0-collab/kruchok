import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Star, 
  Zap, 
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { ResultCard } from './components/ResultCard';
import { PreviewModal } from './components/PreviewModal';
import { StarsModal } from './components/StarsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PRESETS } from './data/presets';
import { GenerationRequest, TextVariant, HistoryItem } from './types';

const DEFAULT_REQUEST: GenerationRequest = PRESETS[0].data;

export default function App() {
  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('kruchok_stars') ?? localStorage.getItem('textoff_stars');
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  const [view, setView] = useState<'form' | 'result'>('form');
  const [requestData, setRequestData] = useState<GenerationRequest>(DEFAULT_REQUEST);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);
  const [variants, setVariants] = useState<TextVariant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [previewVariant, setPreviewVariant] = useState<TextVariant | null>(null);
  const [isStarsModalOpen, setIsStarsModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Latest form state ref to avoid stale closures in MainButton callback
  const currentFormRef = useRef<GenerationRequest>(DEFAULT_REQUEST);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kruchok_history') ?? localStorage.getItem('textoff_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save stars
  useEffect(() => {
    localStorage.setItem('kruchok_stars', stars.toString());
  }, [stars]);

  // Save history
  useEffect(() => {
    localStorage.setItem('kruchok_history', JSON.stringify(history));
  }, [history]);

  // Toast notification timer
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Telegram WebApp initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Telegram MainButton reactive hook
  useEffect(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
    if (!tg?.MainButton) return;

    const mainButton = tg.MainButton;

    if (isLoading) {
      mainButton.setText(`Генерация (${countdown}с)...`);
      mainButton.showProgress(true);
      mainButton.disable();
      return;
    }

    mainButton.hideProgress();
    mainButton.enable();

    if (view === 'form') {
      mainButton.setText('Сгенерировать 3 варианта');
      mainButton.show();
    } else {
      const allUnlocked = variants.length > 0 && variants.every((v) => v.isUnlocked || v.isFree);
      if (allUnlocked) {
        mainButton.setText('← Изменить запрос');
      } else {
        mainButton.setText('Открыть все за 50 ⭐️');
      }
      mainButton.show();
    }

    const onMainBtnClick = () => {
      if (view === 'form') {
        const data = currentFormRef.current;
        if (!data.product.trim()) {
          try {
            tg.HapticFeedback?.notificationOccurred('warning');
          } catch {
            // ignore
          }
          showToast('Укажи, что продаёшь');
          return;
        }
        try {
          tg.HapticFeedback?.impactOccurred('medium');
        } catch {
          // ignore
        }
        handleGenerate(data);
      } else {
        const allUnlocked = variants.length > 0 && variants.every((v) => v.isUnlocked || v.isFree);
        if (allUnlocked) {
          try {
            tg.HapticFeedback?.selectionChanged();
          } catch {
            // ignore
          }
          setView('form');
          window.scrollTo(0, 0);
        } else {
          handleUnlockVariants();
        }
      }
    };

    mainButton.onClick(onMainBtnClick);
    return () => {
      mainButton.offClick(onMainBtnClick);
    };
  }, [view, isLoading, countdown, variants, stars]);

  const handleGenerate = async (reqData: GenerationRequest) => {
    setIsLoading(true);
    setCountdown(10);
    setRequestData(reqData);
    currentFormRef.current = reqData;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 900);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }

      const data = await response.json();
      if (data.variants && Array.isArray(data.variants)) {
        setVariants(data.variants);

        // Add to history
        const newItem: HistoryItem = {
          id: 'hist-' + Date.now(),
          createdAt: new Date().toISOString(),
          request: reqData,
          variants: data.variants,
          unlockedVariants: false,
        };
        setHistory((prev) => [newItem, ...prev.slice(0, 19)]);

        // Switch to result view and reset scroll to top
        setView('result');
        window.scrollTo(0, 0);

        showToast('3 варианта готовы!');
        try {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error('Ошибка вызова API:', error);
      showToast('Ошибка связи с сервером');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setActivePresetId(presetId);
      setRequestData(found.data);
      currentFormRef.current = found.data;
    }
  };

  const handleUnlockVariants = () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    } catch {
      // ignore
    }

    if (stars < 50) {
      setIsStarsModalOpen(true);
      return;
    }

    // Deduct 50 stars
    setStars((prev) => Math.max(0, prev - 50));
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        isUnlocked: true,
      }))
    );
    showToast('2-й и 3-й варианты открыты (-50 ⭐️)!');
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch {
      // ignore
    }
  };

  const handleAddStars = (amount: number) => {
    setStars((prev) => prev + amount);
    showToast(`Начислено +${amount} ⭐️!`);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setRequestData(item.request);
    currentFormRef.current = item.request;
    setVariants(item.variants);
    setActivePresetId('');
    setIsHistoryOpen(false);
    setView('result');
    window.scrollTo(0, 0);
    showToast('Генерация загружена');
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast('История очищена');
  };

  const allUnlocked = variants.length > 0 && variants.every((v) => v.isUnlocked || v.isFree);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-4 right-4 z-50 bg-neutral-900 border border-amber-500/40 text-neutral-100 px-3.5 py-2 rounded-xl shadow-2xl flex items-center justify-center gap-2 text-xs font-medium animate-in fade-in duration-200">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header: Compact single line, 16px padding */}
      <Header
        stars={stars}
        onOpenStarsModal={() => setIsStarsModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Container: Single column, strict mobile viewport (max-w-md, 16px horizontal padding) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
        
        {/* ============================================================ */}
        {/* STATE 1: FORM VIEW (Only form elements, results completely hidden) */}
        {/* ============================================================ */}
        {view === 'form' && (
          <div className="space-y-4">
            {/* Functional Title without marketing fluff */}
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                Генератор продающих текстов
              </h1>
              <p className="text-xs text-neutral-400 leading-snug">
                Заполни форму — получи 3 варианта текста
              </p>
            </div>

            {/* Generator Form */}
            <GeneratorForm
              onSubmit={(data) => handleGenerate(data)}
              isLoading={isLoading}
              activePresetId={activePresetId}
              onApplyPreset={handleApplyPreset}
              initialData={requestData}
              onFormChange={(data) => {
                currentFormRef.current = data;
              }}
            />

            {/* Loading Progress State */}
            {isLoading && (
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/40 text-center space-y-2.5 shadow-lg animate-pulse">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/15 text-amber-400">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Нейросеть генерирует 3 подхода...
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Осталось ~<strong className="text-amber-400 font-mono">{countdown}</strong> сек.
                  </p>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 2: RESULT VIEW (Form completely hidden)                */}
        {/* ============================================================ */}
        {view === 'result' && (
          <div className="space-y-4">
            {/* Top Navigation Bar: Return to Form & Unlock Button */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-neutral-850">
              <button
                id="back-to-form-btn"
                type="button"
                onClick={() => {
                  try {
                    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                  } catch {
                    // ignore
                  }
                  setView('form');
                  window.scrollTo(0, 0);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Изменить запрос</span>
              </button>

              {!allUnlocked && (
                <button
                  id="unlock-all-top-btn"
                  type="button"
                  onClick={handleUnlockVariants}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Star className="w-3.5 h-3.5 fill-neutral-950 text-neutral-950" />
                  <span>Открыть все за 50 ⭐️</span>
                </button>
              )}
            </div>

            {/* Target Product Summary Chip */}
            <div className="text-xs text-neutral-400 bg-neutral-900/60 border border-neutral-850 px-3 py-2 rounded-xl flex items-center justify-between gap-2">
              <span className="truncate">
                Товар: <strong className="text-neutral-200 font-medium">{requestData.product}</strong>
              </span>
              <span className="shrink-0 text-[10px] uppercase font-semibold text-amber-400/90 px-1.5 py-0.5 rounded bg-amber-500/10">
                {requestData.platform}
              </span>
            </div>

            {/* 3 Text Variants (1st free/unlocked, 2nd & 3rd blurred/locked or unlocked) */}
            <div className="space-y-3.5">
              {variants.map((variant, index) => (
                <ResultCard
                  key={variant.id}
                  variant={variant}
                  index={index}
                  platform={requestData.platform}
                  onUnlock={handleUnlockVariants}
                  onPreview={(v) => setPreviewVariant(v)}
                  userStars={stars}
                />
              ))}
            </div>

            {/* In-page Unlock Button under the 3 variants when locked */}
            {!allUnlocked && (
              <div className="pt-1">
                <button
                  id="unlock-all-bottom-btn"
                  type="button"
                  onClick={handleUnlockVariants}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                  <span>Открыть все за 50 ⭐️</span>
                </button>
              </div>
            )}

            {/* Action to change request at the bottom as well */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                  } catch {
                    // ignore
                  }
                  setView('form');
                  window.scrollTo(0, 0);
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1 py-1 px-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Вернуться к настройкам текста</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Fallback fixed bar ONLY rendered in desktop browser preview when Telegram client is absent */}
      {typeof window !== 'undefined' && window.Telegram?.WebApp?.platform === 'unknown' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              id="browser-preview-tg-main-button"
              disabled={isLoading}
              onClick={() => {
                if (view === 'form') {
                  const data = currentFormRef.current;
                  if (!data.product.trim()) {
                    showToast('Укажи, что продаёшь');
                    return;
                  }
                  handleGenerate(data);
                } else {
                  const allUnlocked = variants.length > 0 && variants.every((v) => v.isUnlocked || v.isFree);
                  if (allUnlocked) {
                    setView('form');
                    window.scrollTo(0, 0);
                  } else {
                    handleUnlockVariants();
                  }
                }
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Генерация ({countdown}с)...</span>
                </>
              ) : view === 'form' ? (
                <>
                  <Zap className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                  <span>Сгенерировать 3 варианта</span>
                </>
              ) : (
                allUnlocked ? (
                  <>
                    <ArrowLeft className="w-4 h-4 text-neutral-950" />
                    <span>← Изменить запрос</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                    <span>Открыть все за 50 ⭐️</span>
                  </>
                )
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        variant={previewVariant}
        platform={requestData.platform}
        price={requestData.price}
        onClose={() => setPreviewVariant(null)}
      />

      {/* Stars Modal */}
      <StarsModal
        isOpen={isStarsModalOpen}
        onClose={() => setIsStarsModalOpen(false)}
        stars={stars}
        onAddStars={handleAddStars}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
