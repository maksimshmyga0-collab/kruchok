import { PlatformType } from '../types';

export interface CreatePresetItem {
  id: string;
  label: string;
  badge: string;
  data: {
    product: string;
    price: string;
    condition: string;
    keyBenefits: string;
    platform: PlatformType;
  };
}

export interface AuditPresetItem {
  id: string;
  label: string;
  badge: string;
  productName: string;
  price: string;
  platform: PlatformType;
  originalText: string;
}

export const CREATE_PRESETS: CreatePresetItem[] = [
  {
    id: 'iphone-15',
    label: '📱 iPhone 15 Pro',
    badge: 'Авито',
    data: {
      product: 'Apple iPhone 15 Pro 256GB Natural Titanium',
      price: '87 900 ₽',
      condition: 'Б/у 8 месяцев, состояние 9.5/10, без сколов и царапин, на экране защитное стекло, емкость аккумулятора 94%',
      keyBenefits: 'Один владелец, покупался новым, не вскрывался, любые проверки на месте, коробка и кабель',
      platform: 'avito',
    },
  },
  {
    id: 'renovation',
    label: '🔨 Ремонт квартир',
    badge: 'Авито Услуги',
    data: {
      product: 'Ремонт квартир под ключ и отделочные работы',
      price: 'от 6 500 ₽ / м²',
      condition: 'Опыт бригады 9 лет, работаем строго по договору с фиксированной сметой без скрытых доплат',
      keyBenefits: 'Гарантия 2 года, ежедневный фотоотчет в мессенджере, закупка черновых материалов со скидкой до 15%',
      platform: 'avito',
    },
  },
  {
    id: 'sofa',
    label: '🛋️ Диван раскладной',
    badge: 'Авито',
    data: {
      product: 'Угловой раскладной диван с ящиком для белья',
      price: '18 500 ₽',
      condition: 'Отличное состояние, обивка велюр антикоготь, без пятен и потертостей, механизм еврокнижка работает мягко',
      keyBenefits: 'Поможем разобрать для транспортировки, грузовой лифт в доме есть, самовывоз в любое удобное время',
      platform: 'avito',
    },
  },
  {
    id: 'auto',
    label: '🚗 Kia K5 2021',
    badge: 'Авито Авто',
    data: {
      product: 'Kia K5, 2.5 л, автомат, комплектация Prestige',
      price: '2 350 000 ₽',
      condition: 'Пробег 48 000 км, родной окрас, без ДТП, обслуживался у официального дилера, сервисная книжка со всеми отметками',
      keyBenefits: 'Зимняя резина Nokian в комплекте, сигнализация с автозапуском, чистый ухоженный салон',
      platform: 'avito',
    },
  },
  {
    id: 'tg-service',
    label: '💬 Telegram-канал',
    badge: 'Telegram',
    data: {
      product: 'Канал про маркетинг и AI для малого бизнеса',
      price: 'Бесплатный доступ',
      condition: 'Авторские разборы инструментов, готовые промпты для предпринимателей, без рекламы казино и скама',
      keyBenefits: 'Экономит до 10 часов в неделю на рутине, 3 готовых чек-листа в закрепе',
      platform: 'telegram',
    },
  },
];

export const AUDIT_PRESETS: AuditPresetItem[] = [
  {
    id: 'raw-phone',
    label: '📱 Сырое объявление: Телефон',
    badge: 'Частая ошибка',
    productName: 'iPhone 13 128gb',
    price: '42 000 ₽',
    platform: 'avito',
    originalText: `Продам айфон 13 на 128 гб цвет синий.
Состояние норм, пользовался год, экран целый. Батарею держит. В комплекте только шнур.
Торга нет, обмены не интересуют. Писать только реально заинтересованным, дурацкие вопросы не задавать.`,
  },
  {
    id: 'raw-service',
    label: '🔧 Сырое объявление: Сантехник',
    badge: 'Частая ошибка',
    productName: 'Услуги сантехника',
    price: 'Договорная',
    platform: 'avito',
    originalText: `Любые сантехнические работы быстро и качественно.
Замена труб, смесителей, установка унитазов, ванн, раковин.
Звоните в любое время, цены низкие. Работаю по городу и району. Мастер с опытом.`,
  },
  {
    id: 'raw-jacket',
    label: '🧥 Сырое объявление: Куртка',
    badge: 'Частая ошибка',
    productName: 'Куртка зимняя мужская',
    price: '3 500 ₽',
    platform: 'avito',
    originalText: `Куртка теплая размер L. Состояние хорошее, висит в шкафу без дела.
Покупал дорого в прошлом году. Забирать на Ленина.
Смотрите фото.`,
  },
];
