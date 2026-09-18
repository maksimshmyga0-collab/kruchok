import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  RotateCcw
} from 'lucide-react';
import { ImproveListingInput, AuditDiagnosis, PlatformType } from '../types';
import { AUDIT_PRESETS } from '../data/presets';

interface ImproveListingViewProps {
  initialData?: Partial<ImproveListingInput>;
  onAudit: (data: ImproveListingInput) => Promise<AuditDiagnosis | null>;
  onImprove: (data: ImproveListingInput, audit: AuditDiagnosis) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ImproveListingView: React.FC<ImproveListingViewProps> = ({
  initialData,
  onAudit,
  onImprove,
  onBack,
  isLoading,
}) => {
  const [originalText, setOriginalText] = useState(initialData?.originalText || '');
  const [productName, setProductName] = useState(initialData?.productName || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [platform, setPlatform] = useState<PlatformType>(initialData?.platform || 'avito');
  const [auditResult, setAuditResult] = useState<AuditDiagnosis | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleApplyPreset = (presetId: string) => {
    const found = AUDIT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setOriginalText(found.originalText);
      setProductName(found.productName);
      setPrice(found.price);
      setPlatform(found.platform);
      setAuditResult(null);
    }
  };

  const handleRunAudit = async () => {
    if (!originalText.trim() || isAuditing) return;
    setIsAuditing(true);

    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    } catch {
      // ignore
    }

    const diagnosis = await onAudit({
      originalText: originalText.trim(),
      platform,
      price: price.trim(),
      productName: productName.trim(),
    });

    if (diagnosis) {
      setAuditResult(diagnosis);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {
        // ignore
      }
    }
    setIsAuditing(false);
  };

  const handleProceedImprove = () => {
    if (!auditResult || isLoading) return;
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
    } catch {
      // ignore
    }
    onImprove(
      {
        originalText: originalText.trim(),
        platform,
        price: price.trim(),
        productName: productName.trim(),
      },
      auditResult
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

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
        <span className="text-[11px] font-medium text-neutral-500">Сценарий 2: Аудит & Улучшение</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Улучшить моё объявление
        </h2>
        <p className="text-xs text-neutral-400">
          Вставь текст текущего объявления. AI проведёт диагностику слабых мест и перепишет его для роста просмотров.
        </p>
      </div>

      {/* Presets with typical raw listings */}
      {!auditResult && (
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              Примеры слабых объявлений для теста:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4">
            {AUDIT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Input text */}
      <div className="space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="improve-text-input" className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              Текст твоего текущего объявления <span className="text-amber-400">*</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">{originalText.length} симв.</span>
          </div>
          <textarea
            id="improve-text-input"
            rows={5}
            value={originalText}
            onChange={(e) => {
              setOriginalText(e.target.value);
              if (auditResult) setAuditResult(null); // Reset audit on text change
            }}
            placeholder="Вставь сюда текст своего объявления с Авито или другой площадки..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Optional quick parameters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="improve-product" className="block text-[11px] text-neutral-400 mb-1">
              Название товара (опционально)
            </label>
            <input
              id="improve-product"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Например: iPhone 13"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="improve-price" className="block text-[11px] text-neutral-400 mb-1">
              Цена (опционально)
            </label>
            <input
              id="improve-price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Например: 42 000 ₽"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Audit Trigger CTA */}
        {!auditResult && (
          <button
            type="button"
            id="run-audit-btn"
            disabled={!originalText.trim() || isAuditing}
            onClick={handleRunAudit}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-300 hover:to-blue-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            {isAuditing ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>AI проводит диагностику текста...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Провести диагностику объявления</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Step 2: DIAGNOSTIC AUDIT RESULTS */}
      {auditResult && (
        <div className="space-y-4 pt-2 border-t border-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Результаты диагностики:
            </span>
            <button
              type="button"
              onClick={handleRunAudit}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Перепроверить
            </button>
          </div>

          {/* Diagnostic Score Card */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-4 shadow-lg">
            <div className={`w-18 h-18 rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-inner ${getScoreColor(auditResult.score)}`}>
              <span className="text-2xl font-black tracking-tight">{auditResult.score}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">из 100</span>
            </div>

            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-white">
                {auditResult.score < 60 ? 'Объявление теряет покупателей' : auditResult.score < 80 ? 'Средний текст, есть слабые места' : 'Хорошая база, можно докрутить'}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {auditResult.summary}
              </p>
            </div>
          </div>

          {/* Detected Issues */}
          {auditResult.issues && auditResult.issues.length > 0 && (
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-rose-500/20 space-y-2.5">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Что мешает продавать (найденные проблемы):
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {auditResult.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 shrink-0 font-bold">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {auditResult.strengths && auditResult.strengths.length > 0 && (
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-emerald-500/20 space-y-1.5">
              <h4 className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Что уже хорошо:
              </h4>
              <ul className="space-y-1 text-xs text-neutral-300">
                {auditResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 3: Big CTA to Improve Listing */}
          <div className="pt-2">
            <button
              type="button"
              id="improve-action-btn"
              disabled={isLoading}
              onClick={handleProceedImprove}
              className="w-full py-4 px-4 rounded-xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 disabled:opacity-50 transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>AI создаёт улучшенную версию...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 fill-neutral-950 text-neutral-950" />
                  <span>Улучшить объявление</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-500 mt-2">
              Устраним все найденные проблемы без выдумывания фактов
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
