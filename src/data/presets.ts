import { GenerationRequest } from '../types';

export interface PresetItem {
  id: string;
  label: string;
  badge: string;
  icon: string;
  data: GenerationRequest;
}

export const PRESETS: PresetItem[] = [
  {
    id: 'avito-iphone',
    label: 'Авито: iPhone 15 Pro',
    badge: 'Авито',
    icon: 'Smartphone',
    data: {
      platform: 'avito',
      product: 'Apple iPhone 15 Pro 256GB Natural Titanium, полный комплект, чек, состояние аккумулятора 98%, без сколов и царапин, в защитном стекле Remax',
      targetAudience: 'Те, кто ищет честный смартфон для себя без риска нарваться на восстановленный или залоченный телефон',
      tone: 'friendly',
      price: '87 900 ₽ (возможен символический торг при встрече)',
      extraDetails: 'Любые проверки на месте, Авито Доставка через СДЭК/Боксберри, в подарок 2 чехла',
    },
  },
  {
    id: 'avito-renovation',
    label: 'Авито: Ремонт квартир',
    badge: 'Авито',
    icon: 'Hammer',
    data: {
      platform: 'avito',
      product: 'Капитальный и косметический ремонт квартир под ключ с официальным договором и фиксированной сметой без скрытых доплат',
      targetAudience: 'Семьи и владельцы новостроек, которые боятся затягивания сроков, пьющих бригад и непредвиденных расходов',
      tone: 'business',
      price: 'от 7 500 ₽ за кв.м.',
      extraDetails: 'Гарантия 3 года по договору, ежедневный фотоотчет в Telegram, закупка материалов со скидкой до 20%',
    },
  },
  {
    id: 'tg-course',
    label: 'Telegram: Интенсив по нейросетям',
    badge: 'Telegram',
    icon: 'Send',
    data: {
      platform: 'telegram',
      product: 'Практический 3-дневный воркшоп: как делегировать рутину нейросетям (тексты, аналитика, дизайн) и освободить 15 часов в неделю',
      targetAudience: 'Фрилансеры, маркетологи, продюсеры и предприниматели, которые не успевают всё делать руками',
      tone: 'aggressive',
      price: 'Бесплатный первый день, полный доступ 4 990 ₽',
      extraDetails: 'Старт в этот четверг, доступ к закрытому чату и готовой базе 200+ рабочих промптов',
    },
  },
  {
    id: 'social-coffee',
    label: 'Соцсети: Кофе свежей обжарки',
    badge: 'Соцсети',
    icon: 'Coffee',
    data: {
      platform: 'social',
      product: 'Свежеобжаренный спешелти кофе 100% арабика (Эфиопия и Колумбия) с доставкой до двери в день заказа',
      targetAudience: 'Любители качественного утреннего кофе, уставшие от пережаренных зерен из супермаркета',
      tone: 'creative',
      price: 'от 890 ₽ за пачку 250г',
      extraDetails: 'Промокод COFFEEFIRST дает скидку 15% на первый заказ и набор дрип-пакетов в подарок',
    },
  },
];
