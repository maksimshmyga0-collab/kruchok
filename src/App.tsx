import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Activity 
} from 'lucide-react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { CreateListingView } from './components/CreateListingView';
import { ImproveListingView } from './components/ImproveListingView';
import { ResultView } from './components/ResultView';
import { MonetizationModal } from './components/MonetizationModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { 
  AppScreen, 
  CreateListingInput, 
  ImproveListingInput, 
  ListingResult, 
  AuditDiagnosis, 
  HistoryListingItem, 
  QuickActionType 
} from './types';
import { CREATE_PRESETS } from './data/presets';

const DEFAULT_CREATE_INPUT: CreateListingInput = CREATE_PRESETS[0].data;

export default function App() {
  // Navigation
  const [screen, setScreen] = useState<AppScreen>('home');

  // Quota & Monetization
  const [remainingGenerations, setRemainingGenerations] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kruchok_generations');
      return saved !== null ? parseInt(saved, 10) : 3; // 3 free generations default
    } catch {
      return 3;
    }
  });

  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kruchok_is_pro') === 'true';
    } catch {
      return false;
    }
  });

  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active form data refs
  const [createInput, setCreateInput] = useState<CreateListingInput>(DEFAULT_CREATE_INPUT);
  const currentCreateRef = useRef<CreateListingInput>(DEFAULT_CREATE_INPUT);

  const [improveInput, setImproveInput] = useState<ImproveListingInput>({
    originalText: '',
    platform: 'avito',
  });

  // Active Result & Audit
  const [activeResult, setActiveResult] = useState<ListingResult | null>(null);
  const [lastAudit, setLastAudit] = useState<AuditDiagnosis | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('AI генерирует текст...');
  const [countdown, setCountdown] = useState(8);
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);

  // History / My Listings
  const [history, setHistory] = useState<HistoryListingItem[]>(() => {
    try {
      const saved = localStorage.getItem('kruchok_listings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Quota
  useEffect(() => {
    localStorage.setItem('kruchok_generations', remainingGenerations.toString());
  }, [remainingGenerations]);

  useEffect(() => {
    localStorage.setItem('kruchok_is_pro', isPro ? 'true' : 'false');
  }, [isPro]);

  // Save History
  useEffect(() => {
    localStorage.setItem('kruchok_listings', JSON.stringify(history));
  }, [history]);

  // Toast notifier
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

  // Telegram WebApp MainButton integration
  useEffect(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
    if (!tg?.MainButton) return;

    const mainButton = tg.MainButton;

    if (isLoading || isQuickActionLoading) {
      mainButton.setText(`Обработка (${countdown}с)...`);
      mainButton.showProgress(true);
      mainButton.disable();
      return;
    }

    mainButton.hideProgress();
    mainButton.enable();

    if (screen === 'home') {
      mainButton.hide();
    } else if (screen === 'create') {
      mainButton.setText('Создать продающее объявление');
      mainButton.show();
    } else if (screen === 'improve') {
      mainButton.setText('Улучшить объявление');
      mainButton.show();
    } else if (screen === 'result') {
      mainButton.setText('Скопировать всё ✓');
      mainButton.show();
    }

    const onMainBtnClick = () => {
      if (screen === 'home') {
        setScreen('create');
        window.scrollTo(0, 0);
      } else if (screen === 'create') {
        const data = currentCreateRef.current;
        if (!data.product.trim()) {
          showToast('Укажи, что ты продаёшь');
          return;
        }
        handleCreateListing(data);
      } else if (screen === 'improve') {
        if (!improveInput.originalText.trim()) {
          showToast('Вставь текст текущего объявления');
          return;
        }
        // If audit wasn't run yet, run audit or prompt
        if (!lastAudit) {
          handleRunAudit(improveInput);
        } else {
          handleImproveListing(improveInput, lastAudit);
        }
      } else if (screen === 'result' && activeResult) {
        const full = `${activeResult.titles[activeResult.selectedTitleIndex]?.text || ''}\n\n${activeResult.body}`;
        navigator.clipboard?.writeText?.(full);
        showToast('Объявление целиком скопировано ✓');
        try {
          tg.HapticFeedback?.notificationOccurred('success');
        } catch {
          // ignore
        }
      }
    };

    mainButton.onClick(onMainBtnClick);
    return () => {
      mainButton.offClick(onMainBtnClick);
    };
  }, [screen, isLoading, isQuickActionLoading, countdown, activeResult, improveInput, lastAudit]);

  // Quota decrement checker
  const checkAndConsumeQuota = (): boolean => {
    if (isPro) return true;
    if (remainingGenerations <= 0) {
      setIsMonetizationOpen(true);
      showToast('Бесплатные генерации закончились. Пополните баланс.');
      return false;
    }
    setRemainingGenerations((prev) => Math.max(0, prev - 1));
    return true;
  };

  // 1. Create Listing
  const handleCreateListing = async (data: CreateListingInput) => {
    if (!checkAndConsumeQuota()) return;

    setIsLoading(true);
    setLoadingText('Создаём продающее объявление...');
    setCountdown(8);
    setCreateInput(data);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 900);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'create',
          product: data.product,
          price: data.price,
          condition: data.condition,
          keyBenefits: data.keyBenefits,
          platform: data.platform,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Ошибка сервера (${response.status})`);
      }

      const resData = await response.json();
      if (resData.result) {
        const newResult: ListingResult = resData.result;
        setActiveResult(newResult);

        // Add to history
        const historyItem: HistoryListingItem = {
          id: newResult.id,
          product: newResult.product,
          platform: newResult.platform,
          createdAt: newResult.createdAt,
          mode: 'create',
          result: newResult,
        };
        setHistory((prev) => [historyItem, ...prev.slice(0, 24)]);

        setScreen('result');
        window.scrollTo(0, 0);
        showToast('Объявление создано!');
        try {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        } catch {
          // ignore
        }
      } else {
        throw new Error('Сервер не вернул результат');
      }
    } catch (error: any) {
      console.error('Ошибка создания объявления:', error);
      showToast(error.message || 'Ошибка связи с сервисом');
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      } catch {
        // ignore
      }
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  // 2. Audit Existing Listing
  const handleRunAudit = async (data: ImproveListingInput): Promise<AuditDiagnosis | null> => {
    setImproveInput(data);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'audit',
          originalText: data.originalText,
          platform: data.platform,
          price: data.price,
          productName: data.productName,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Ошибка аудита (${response.status})`);
      }

      const resData = await response.json();
      if (resData.audit) {
        setLastAudit(resData.audit);
        return resData.audit;
      }
      throw new Error('Не удалось получить диагностику');
    } catch (error: any) {
      console.error('Ошибка аудита:', error);
      showToast(error.message || 'Ошибка проведения диагностики');
      return null;
    }
  };

  // 3. Improve Listing (after audit)
  const handleImproveListing = async (data: ImproveListingInput, audit: AuditDiagnosis) => {
    if (!checkAndConsumeQuota()) return;

    setIsLoading(true);
    setLoadingText('Устраняем слабые места и переписываем...');
    setCountdown(8);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 900);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'improve',
          originalText: data.originalText,
          platform: data.platform,
          price: data.price,
          product: data.productName || 'Товар из объявления',
          condition: audit.issues.join(', '),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Ошибка улучшения (${response.status})`);
      }

      const resData = await response.json();
      if (resData.result) {
        const newResult: ListingResult = resData.result;
        setActiveResult(newResult);

        // Add to history
        const historyItem: HistoryListingItem = {
          id: newResult.id,
          product: newResult.product,
          platform: newResult.platform,
          createdAt: newResult.createdAt,
          mode: 'improve',
          result: newResult,
          audit,
        };
        setHistory((prev) => [historyItem, ...prev.slice(0, 24)]);

        setScreen('result');
        window.scrollTo(0, 0);
        showToast('Объявление улучшено!');
        try {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        } catch {
          // ignore
        }
      } else {
        throw new Error('Сервер не вернул результат');
      }
    } catch (error: any) {
      console.error('Ошибка улучшения:', error);
      showToast(error.message || 'Ошибка связи с сервисом');
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      } catch {
        // ignore
      }
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  // 4. Quick Actions («Усилить»)
  const handleQuickAction = async (action: QuickActionType) => {
    if (!activeResult || isQuickActionLoading) return;

    setIsQuickActionLoading(true);
    const activeTitle = activeResult.titles[activeResult.selectedTitleIndex]?.text || activeResult.titles[0]?.text || '';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'refine',
          action,
          currentTitle: activeTitle,
          currentBody: activeResult.body,
          platform: activeResult.platform,
          product: activeResult.product,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Ошибка доработки текста');
      }

      const resData = await response.json();
      if (resData.result) {
        const refined = resData.result;
        setActiveResult(refined);

        // Update in history
        setHistory((prev) =>
          prev.map((item) => (item.id === activeResult.id ? { ...item, result: refined } : item))
        );

        showToast('Текст доработан!');
        try {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        } catch {
          // ignore
        }
      }
    } catch (error: any) {
      console.error('Ошибка быстрой доработки:', error);
      showToast(error.message || 'Не удалось доработать текст');
    } finally {
      setIsQuickActionLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryListingItem) => {
    setActiveResult(item.result);
    setScreen('result');
    window.scrollTo(0, 0);
    showToast('Объявление загружено');
  };

  const handleAddGenerations = (amount: number) => {
    setRemainingGenerations((prev) => prev + amount);
    showToast(`Начислено +${amount} генераций!`);
  };

  const handleActivatePro = () => {
    setIsPro(true);
    showToast('Тариф PRO активирован на 30 дней!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-15 left-4 right-4 z-50 bg-neutral-900 border border-amber-500/50 text-neutral-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center justify-center gap-2 text-xs font-semibold animate-in fade-in duration-200">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        remainingGenerations={remainingGenerations}
        isPro={isPro}
        onOpenMonetization={() => setIsMonetizationOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onGoHome={() => {
          setScreen('home');
          window.scrollTo(0, 0);
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-5 rounded-2xl bg-neutral-900/95 border border-amber-500/40 text-center space-y-3 shadow-2xl animate-in fade-in duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/15 text-amber-400">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{loadingText}</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Осталось ~<strong className="text-amber-400 font-mono">{countdown}</strong> сек.
              </p>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((8 - countdown) / 8) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 1. HOME SCREEN */}
        {screen === 'home' && !isLoading && (
          <HomeScreen
            onSelectCreate={() => {
              setScreen('create');
              window.scrollTo(0, 0);
            }}
            onSelectImprove={() => {
              setScreen('improve');
              window.scrollTo(0, 0);
            }}
            remainingGenerations={remainingGenerations}
            isPro={isPro}
            onOpenMonetization={() => setIsMonetizationOpen(true)}
            recentListings={history}
            onOpenListing={handleSelectHistoryItem}
            onOpenAllHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {/* 2. CREATE LISTING SCREEN */}
        {screen === 'create' && !isLoading && (
          <CreateListingView
            initialData={createInput}
            onSubmit={(data) => handleCreateListing(data)}
            onBack={() => {
              setScreen('home');
              window.scrollTo(0, 0);
            }}
            isLoading={isLoading}
            onFormChange={(data) => {
              currentCreateRef.current = data;
            }}
          />
        )}

        {/* 3. IMPROVE LISTING SCREEN */}
        {screen === 'improve' && !isLoading && (
          <ImproveListingView
            initialData={improveInput}
            onAudit={handleRunAudit}
            onImprove={(data, audit) => handleImproveListing(data, audit)}
            onBack={() => {
              setScreen('home');
              window.scrollTo(0, 0);
            }}
            isLoading={isLoading}
          />
        )}

        {/* 4. RESULT SCREEN */}
        {screen === 'result' && !isLoading && activeResult && (
          <ResultView
            result={activeResult}
            onQuickAction={handleQuickAction}
            isQuickActionLoading={isQuickActionLoading}
            onBackToEdit={() => {
              if (activeResult.mode === 'improve') {
                setScreen('improve');
              } else {
                setScreen('create');
              }
              window.scrollTo(0, 0);
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Fallback Desktop Browser Action Bar (Only shown on result screen when Telegram client WebApp is not connected) */}
      {typeof window !== 'undefined' && window.Telegram?.WebApp?.platform === 'unknown' && screen === 'result' && activeResult && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-850">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                const full = `${activeResult.titles[activeResult.selectedTitleIndex]?.text || ''}\n\n${activeResult.body}`;
                navigator.clipboard?.writeText?.(full);
                showToast('Скопировано целиком ✓');
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4 text-neutral-950" />
              <span>Скопировать всё ✓</span>
            </button>
          </div>
        </div>
      )}

      {/* Monetization / Packages Modal */}
      <MonetizationModal
        isOpen={isMonetizationOpen}
        onClose={() => setIsMonetizationOpen(false)}
        remainingGenerations={remainingGenerations}
        isPro={isPro}
        onAddGenerations={handleAddGenerations}
        onActivatePro={handleActivatePro}
      />

      {/* History Drawer («Мои объявления») */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectListing={handleSelectHistoryItem}
        onClearHistory={() => {
          setHistory([]);
          showToast('История объявлений очищена');
        }}
      />
    </div>
  );
}
