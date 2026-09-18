import { GoogleGenAI, Type } from '@google/genai';

const PLATFORM_GUIDES: Record<string, string> = {
  avito: 'Авито (структура: точный понятный заголовок для поиска, ключевые параметры, реальное состояние, условия сделки/проверки/доставки, четкий призыв написать в сообщения Авито)',
  telegram: 'Telegram-канал (визуальное форматирование с эмодзи, цепляющий лид, списки с буллетами, четкий призыв к действию)',
};

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается. Используйте POST' });
  }

  const startTime = Date.now();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
    }
  }
  body = body || {};

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(500).json({
      error: 'Не настроен GEMINI_API_KEY. Добавьте ключ в Vercel Environment Variables.',
    });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'kruchok-app',
      },
    },
  });

  const mode = body.mode || (body.originalText ? 'improve' : 'create');

  try {
    // =========================================================================
    // SCENARIO 1: AUDIT EXISTING LISTING (ДИАГНОСТИКА ОБЪЯВЛЕНИЯ)
    // =========================================================================
    if (mode === 'audit') {
      const { originalText, platform = 'avito', price, productName } = body;
      if (!originalText || typeof originalText !== 'string' || originalText.trim().length < 10) {
        return res.status(400).json({ error: 'Вставьте текст существующего объявления (хотя бы пару предложений)' });
      }

      const prompt = `Ты строгий, но объективный аудитор объявлений и эксперт по конверсиям сервиса «Крючок».
Проанализируй текст объявления продавца на площадке ${PLATFORM_GUIDES[platform] || platform}.

Текст объявления продавца:
"""
${originalText}
"""
${price ? `Указанная цена: ${price}` : ''}
${productName ? `Товар/услуга: ${productName}` : ''}

Оцени качество текста объявления по 100-балльной шкале.
Выдели конкретные проблемы (например: слабый заголовок, неочевидная выгода, мало информации о товаре, сплошное полотно текста, недостаточно доверия, слабый призыв к действию).
Не придумывай вымышленные метрики просмотров — оценивай именно качество продающего текста и ясность для покупателя.
Выдели 1-2 сильные стороны (если есть).

Верни строго JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: 'Оценка от 20 до 95' },
              summary: { type: Type.STRING, description: 'Краткий объективный вердикт (1-2 предложения)' },
              issues: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 конкретных проблем текста (начинать с сути проблемы)'
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-2 сильные стороны текста'
              },
            },
            required: ['score', 'summary', 'issues', 'strengths'],
          },
        },
      });

      const auditData = JSON.parse(response.text || '{}');
      return res.status(200).json({
        audit: auditData,
        durationMs: Date.now() - startTime,
      });
    }

    // =========================================================================
    // SCENARIO 2: REFINE / QUICK ACTIONS («УСИЛИТЬ»)
    // =========================================================================
    if (mode === 'refine') {
      const { currentTitle, currentBody, action, platform = 'avito', product } = body;

      let actionInstruction = '';
      switch (action) {
        case 'sharpen_title':
          actionInstruction = 'Сделай 3 еще более хлестких, кликабельных и точных заголовка, которые выделят товар в поисковой выдаче.';
          break;
        case 'shorten':
          actionInstruction = 'Сделай текст на 30-40% короче: убери всю воду, оставь только конкретику, факты, состояние и призыв.';
          break;
        case 'convince':
          actionInstruction = 'Сделай текст максимально убедительным: обоснуй ценность каждого рубля, сними сомнения покупателя о переплате.';
          break;
        case 'trust':
          actionInstruction = 'Усиль фактор доверия: подчеркни готовность к любым проверкам на месте, прозрачность, честность описания.';
          break;
        case 'natural':
          actionInstruction = 'Сделай текст максимально естественным и живым: избавься от рекламных штампов, пиши как адекватный честный человек человеку.';
          break;
        case 'avito_style':
          actionInstruction = 'Идеально адаптируй под стандарты и алгоритмы Авито: четкая структура, легкое чтение со смартфона, поисковые теги в конце, призыв написать в чат.';
          break;
        default:
          actionInstruction = 'Улучши структуру и убедительность текста.';
      }

      const prompt = `Ты эксперт сервиса «Крючок». Доработай объявление по конкретному запросу пользователя.

Товар: ${product || 'Товар'}
Площадка: ${PLATFORM_GUIDES[platform] || platform}
Текущий заголовок: ${currentTitle || ''}
Текущее описание:
"""
${currentBody || ''}
"""

Задача: ${actionInstruction}

ВАЖНЕЙШЕЕ ПРАВИЛО: НЕ ВЫДУМЫВАЙ ФАКТЫ И ХАРАКТЕРИСТИКИ, которых нет в исходном тексте (не придумывай вымышленные чеки, состояние батареи, гарантии).
Сформируй 3 варианта заголовка, доработанное описание, 3-4 пункта "почему это работает" и 2-3 совета продавцу, что он сам может добавить (фото, документы).
Верни строго JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['direct', 'benefit', 'feature'] },
                    label: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['type', 'label', 'text'],
                },
              },
              body: { type: Type.STRING, description: 'Готовый продающий текст описания' },
              whyItWorks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 коротких пункта, почему текст работает'
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 честные рекомендации продавцу, что можно добавить'
              },
            },
            required: ['titles', 'body', 'whyItWorks', 'recommendations'],
          },
        },
      });

      const refined = JSON.parse(response.text || '{}');
      return res.status(200).json({
        result: {
          id: 'listing-' + Date.now(),
          product: product || 'Товар',
          platform,
          titles: refined.titles.map((t: any, idx: number) => ({
            id: `title-${idx}`,
            type: t.type,
            label: t.label || (t.type === 'direct' ? 'Прямой' : t.type === 'benefit' ? 'Через выгоду' : 'Через характеристику'),
            text: t.text,
          })),
          selectedTitleIndex: 0,
          body: refined.body,
          whyItWorks: refined.whyItWorks,
          recommendations: refined.recommendations,
          mode: 'improve',
          createdAt: new Date().toISOString(),
        },
        durationMs: Date.now() - startTime,
      });
    }

    // =========================================================================
    // SCENARIO 3: CREATE NEW LISTING OR IMPROVE EXISTING LISTING
    // =========================================================================
    const {
      product,
      price,
      condition,
      keyBenefits,
      platform = 'avito',
      originalText,
    } = body;

    const isImproveMode = mode === 'improve' || Boolean(originalText);
    const targetProduct = product || (isImproveMode ? 'Товар из объявления' : '');

    if (!isImproveMode && (!product || typeof product !== 'string' || !product.trim())) {
      return res.status(400).json({ error: 'Пожалуйста, укажите, что вы продаёте' });
    }

    const systemPrompt = `Ты профессиональный копирайтер и специалист по повышению продаж сервиса «Крючок».
Твоя цель — помочь объявлению продавать лучше: понятнее показать ценность, снять сомнения покупателя и побудить написать продавцу.

Режим: ${isImproveMode ? 'УЛУЧШЕНИЕ СУЩЕСТВУЮЩЕГО ОБЪЯВЛЕНИЯ' : 'СОЗДАНИЕ НОВОГО ПРОДАЮЩЕГО ОБЪЯВЛЕНИЯ'}
Площадка: ${PLATFORM_GUIDES[platform] || platform}

Данные продавца:
${product ? `- Что продает: ${product}` : ''}
${price ? `- Цена: ${price}` : ''}
${condition ? `- Состояние / описание: ${condition}` : ''}
${keyBenefits ? `- Главные преимущества: ${keyBenefits}` : ''}
${originalText ? `- Исходный текст объявления:\n"""\n${originalText}\n"""` : ''}

КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ К ТЕКСТУ:
1. РАБОТАЙ СТРОГО С ФАКТАМИ. НЕ ВЫДУМЫВАЙ характеристики, комплектацию, историю, гарантию или состояние, которых нет в данных продавца!
   (Если пользователь не написал "чек и коробка" — НЕ пиши "полный комплект с чеком". Если не написал процент батареи — НЕ придумывай "АКБ 100%").
2. ЗАПРЕТ НА ПУСТЫЕ ШТАМПЫ: никакой "идеальной гармонии стиля", "лучшего решения для тех, кто ценит качество", "спешите купить". Пиши живым языком реального продавца.
3. СТРУКТУРА ОПИСАНИЯ:
   - Краткий ясный вход (суть предложения).
   - Точные параметры и честное состояние (списком).
   - Главные выгоды для покупателя (почему это надежная покупка).
   - Условия сделки (проверка, самовывоз/доставка, торг при наличии).
   - Четкий и легкий призыв к действию (например: "Пишите в сообщения Авито — отвечаю быстро, готов показать сегодня").
4. Сгенерируй ровно 3 варианта заголовка:
   - Вариант 1 (direct): Прямой, точный, идеально находящийся в поиске.
   - Вариант 2 (benefit): Через ключевую выгоду или ценность для покупателя.
   - Вариант 3 (feature): Через главную характеристику или состояние.
5. "whyItWorks": 3-4 емких пункта, объясняющих механику текста (например: "Выгода вынесена в начало", "Убрана лишняя вода", "Добавлена ясность условий", "Усилен призыв к диалогу").
6. "recommendations": 2-3 практических совета продавцу, что полезно добавить (фотографии деталей, точные сроки, причину продажи).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nСгенерируй ответ строго в формате JSON по схеме.` }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.ARRAY,
              description: '3 варианта заголовка',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['direct', 'benefit', 'feature'] },
                  label: { type: Type.STRING, description: 'Прямой / Через выгоду / Через характеристику' },
                  text: { type: Type.STRING, description: 'Текст заголовка' },
                },
                required: ['type', 'label', 'text'],
              },
            },
            body: {
              type: Type.STRING,
              description: 'Полный структурированный текст продающего описания',
            },
            whyItWorks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 пункта, почему этот текст привлекает отклики',
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 совета продавцу, что можно добавить самому (фото, документы)',
            },
          },
          required: ['titles', 'body', 'whyItWorks', 'recommendations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    const result = {
      id: 'listing-' + Date.now(),
      product: targetProduct,
      price: price || '',
      platform,
      titles: (parsed.titles || []).map((t: any, idx: number) => ({
        id: `title-${idx}`,
        type: t.type,
        label: t.label || (t.type === 'direct' ? 'Прямой' : t.type === 'benefit' ? 'Через выгоду' : 'Через характеристику'),
        text: t.text,
      })),
      selectedTitleIndex: 0,
      body: parsed.body,
      whyItWorks: parsed.whyItWorks || ['Выгода вынесена вперед', 'Убраны лишние слова', 'Усилен призыв к действию'],
      recommendations: parsed.recommendations || ['Добавьте качественные фото при дневном свете', 'Укажите причину продажи'],
      mode: isImproveMode ? ('improve' as const) : ('create' as const),
      createdAt: new Date().toISOString(),
    };

    // Legacy fallback variants to ensure complete backwards compatibility
    const fallbackVariants = [
      {
        id: 'variant-1',
        approach: 'pain',
        approachTitle: 'Через проблему и решение',
        approachDescription: 'Снимает страхи покупателя и обосновывает ценность',
        title: result.titles[0]?.text || targetProduct,
        lead: result.whyItWorks[0] || 'Проверенное предложение',
        body: result.body,
        callToAction: 'Напишите продавцу',
        fullText: `${result.titles[0]?.text || ''}\n\n${result.body}`,
        keyHooks: result.whyItWorks,
        isFree: true,
        isUnlocked: true,
      },
      {
        id: 'variant-2',
        approach: 'benefit',
        approachTitle: 'Через выгоду',
        approachDescription: 'Акцент на экономии и пользе',
        title: result.titles[1]?.text || result.titles[0]?.text || targetProduct,
        lead: result.whyItWorks[1] || 'Максимальная выгода',
        body: result.body,
        callToAction: 'Напишите в сообщения',
        fullText: `${result.titles[1]?.text || ''}\n\n${result.body}`,
        keyHooks: result.whyItWorks,
        isFree: true,
        isUnlocked: true,
      },
      {
        id: 'variant-3',
        approach: 'social_proof',
        approachTitle: 'Через надежность',
        approachDescription: 'Готовность к проверкам и доверие',
        title: result.titles[2]?.text || result.titles[0]?.text || targetProduct,
        lead: result.whyItWorks[2] || 'Честная сделка',
        body: result.body,
        callToAction: 'Готов ответить на вопросы',
        fullText: `${result.titles[2]?.text || ''}\n\n${result.body}`,
        keyHooks: result.whyItWorks,
        isFree: true,
        isUnlocked: true,
      },
    ];

    return res.status(200).json({
      result,
      variants: fallbackVariants,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Ошибка Gemini при обработке в /api/generate:', error);
    return res.status(500).json({
      error: error?.message || 'Неизвестная ошибка при вызове AI-сервиса',
    });
  }
}
