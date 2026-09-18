export type PlatformType = 'avito' | 'telegram';

export type ToneType = 'friendly' | 'business' | 'aggressive' | 'creative' | 'direct';

export type AppScreen = 'home' | 'create' | 'improve' | 'result';

export type QuickActionType =
  | 'sharpen_title'
  | 'shorten'
  | 'convince'
  | 'trust'
  | 'natural'
  | 'avito_style';

export interface TitleOption {
  id: string;
  type: 'direct' | 'benefit' | 'feature';
  label: string;
  text: string;
}

export interface ListingResult {
  id: string;
  product: string;
  price?: string;
  platform: PlatformType;
  titles: TitleOption[];
  selectedTitleIndex: number;
  body: string;
  whyItWorks: string[];
  recommendations: string[];
  mode: 'create' | 'improve';
  createdAt: string;
}

export interface AuditDiagnosis {
  score: number;
  summary: string;
  issues: string[];
  strengths: string[];
}

export interface CreateListingInput {
  product: string;
  price?: string;
  condition?: string;
  keyBenefits?: string;
  platform: PlatformType;
}

export interface ImproveListingInput {
  originalText: string;
  platform: PlatformType;
  price?: string;
  productName?: string;
}

export interface HistoryListingItem {
  id: string;
  product: string;
  platform: PlatformType;
  createdAt: string;
  mode: 'create' | 'improve';
  result: ListingResult;
  audit?: AuditDiagnosis;
}

export interface MonetizationPlan {
  id: string;
  name: string;
  badge?: string;
  generations: number | 'unlimited';
  priceRub: number;
  priceStars: number;
  description: string;
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
