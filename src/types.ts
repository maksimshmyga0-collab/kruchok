export type PlatformType = 'avito' | 'telegram' | 'social' | 'email';

export type ToneType = 'friendly' | 'business' | 'aggressive' | 'creative' | 'direct';

export type ApproachType = 'pain' | 'benefit' | 'social_proof';

export interface TextVariant {
  id: string;
  approach: ApproachType;
  approachTitle: string;
  approachDescription: string;
  title: string;
  lead: string;
  body: string;
  callToAction: string;
  fullText: string;
  keyHooks: string[];
  isFree: boolean;
  isUnlocked: boolean;
}

export interface GenerationRequest {
  product: string;
  targetAudience: string;
  tone: ToneType;
  platform: PlatformType;
  price?: string;
  extraDetails?: string;
}

export interface GenerationResponse {
  variants: TextVariant[];
  durationMs?: number;
  error?: string;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  request: GenerationRequest;
  variants: TextVariant[];
  unlockedVariants: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        platform?: string;
        initData?: string;
        initDataUnsafe?: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}
