import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const TONE_NAMES: Record<string, string> = {
  friendly: 'Дружелюбный, душевный, заботливый (как совет хорошего друга)',
  business: 'Деловой, экспертный, авторитетный, с упором на факты и надежность',
  aggressive: 'Продающе-агрессивный, мощный триггер дедлайна, упущенная выгода, жесткий оффер',
  creative: 'Креативный, цепляющий, с легкой иронией или юмором',
  direct: 'Чёткий, лаконичный, без лишней воды, сразу к сути',
};

const PLATFORM_NAMES: Record<string, string> = {
  avito: 'Авито (структура: цепляющий заголовок, состояние/комплектация, почему продаю/плюсы, призыв написать/позвонить, поисковые теги)',
  telegram: 'Telegram-канал (визуальное форматирование с эмодзи, цепляющий лид, списки с буллетами, призыв подписаться или написать)',
  social: 'Пост для соцсетей (VK / соцсети: интригующий хук, живая история, эмоциональный контакт, CTA в комментарии/ЛС)',
  email: 'Email-рассылка (интригующая тема письма, личное обращение, ценность, кнопка/ссылка с CTA)',
};

// Fallback generator for zero-config preview or missing API key
function generateSmartFallback(
  product: string,
  targetAudience: string,
  tone: string,
  platform: string,
  price?: string,
  extraDetails?: string
) {
  const priceSnippet = price ? `\n💰 Цена: ${price}` : '';
  const extraSnippet = extraDetails ? `\n📌 Важно: ${extraDetails}` : '';

  // 1. Through Pain
  const painTitle = platform === 'avito' 
    ? `🔥 ${product} — забудьте о проблемах с поиском идеального варианта`
    : `Устали от компромиссов? ${product}, который решает проблему раз и навсегда`;

  const painLead = `Знакома ситуация: ищете качественный ${product} для ${targetAudience || 'себя'}, а попадаются либо коты в мешке, либо завышенные цены и пустословие? 🫠`;

  const painBody = `Понимаем вашу боль. Никто не хочет тратить нервы, переплачивать посредникам или разочаровываться после покупки.\n\nИменно поэтому этот ${product} — честный и проверенный выбор:${priceSnippet}${extraSnippet}\n\n• Без подводных камней и скрытых дефектов\n• Полностью готов к использованию с первой секунды\n• Экономит ваше время и нервы\n• Проверен перед продажей лично`;

  const painCta = platform === 'avito'
    ? `📲 Пишите или звоните прямо сейчас! Отвечаю в течение 5 минут. Возможен быстрый самовывоз или надежная Авито-доставка.`
    : `👉 Напишите в личные сообщения прямо сейчас, чтобы забронировать за собой лучшие условия!`;

  const painFullText = `${painTitle}\n\n${painLead}\n\n${painBody}\n\n${painCta}`;

  // 2. Through Benefit
  const benefitTitle = platform === 'avito'
    ? `⭐️ Выгодное предложение: ${product} ${price ? `за ${price}` : ''}`
    : `Максимум пользы и экономии: ${product} специально для ${targetAudience || 'вас'}`;

  const benefitLead = `Зачем переплачивать в магазинах, если можно получить ${product} в превосходном состоянии и сэкономить солидную сумму?`;

  const benefitBody = `Вот 4 главные выгоды, которые вы получаете:${priceSnippet}${extraSnippet}\n\n1. Максимальная окупаемость и ценность каждого рубля\n2. Идеально закрывает задачи категории «${targetAudience || 'покупатели'}»\n3. Бережное отношение и полная прозрачность сделки\n4. Бонус при быстрой покупке`;

  const benefitCta = platform === 'avito'
    ? `💬 Добавьте в Избранное ❤️, чтобы не потерять, а лучше напишите прямо сейчас — такие предложения забирают в первые 24 часа!`
    : `🚀 Жмите на ссылку или пишите в чат, чтобы зафиксировать скидку и забрать сегодня.`;

  const benefitFullText = `${benefitTitle}\n\n${benefitLead}\n\n${benefitBody}\n\n${benefitCta}`;

  // 3. Through Social Proof
  const socialTitle = platform === 'avito'
    ? `✅ Проверенный ${product} | Честная продажа и отличные отзывы`
    : `Выбор сотен довольных клиентов: почему выбирают именно этот ${product}`;

  const socialLead = `Сотни людей в категории «${targetAudience || 'пользователи'}» уже оценили надежность и отдачу от ${product}.`;

  const socialBody = `«Купил и ни разу не пожалел» — именно так отзываются те, кто уже пользуется подобным решением.\n\nФакты и гарантии:${priceSnippet}${extraSnippet}\n\n✔ Безупречная репутация и открытость к любым проверкам на месте\n✔ Рейтинг доверия и десятки успешных сделок\n✔ Полный комплект и соответствие фото на 100%\n✔ Возможность проверить товар лично перед оплатой`;

  const socialCta = platform === 'avito'
    ? `🤝 Посмотрите профиль и отзывы — дорожу репутацией! Пишите/звоните, договоримся о встрече или отправке.`
    : `🔥 Переходите по ссылке или пишите нам, чтобы получить подробную консультацию и реальные кейсы!`;

  const socialFullText = `${socialTitle}\n\n${socialLead}\n\n${socialBody}\n\n${socialCta}`;

  return [
    {
      id: 'variant-1',
      approach: 'pain' as const,
      approachTitle: 'Через боль клиента',
      approachDescription: 'Бьет точно в наболевшую проблему аудитории и позиционирует продукт как спасение',
      title: painTitle,
      lead: painLead,
      body: painBody,
      callToAction: painCta,
      fullText: painFullText,
      keyHooks: ['Снятие страха ошибки', 'Экономия нервов', 'Быстрый отклик'],
      isFree: true,
      isUnlocked: true,
    },
    {
      id: 'variant-2',
      approach: 'benefit' as const,
      approachTitle: 'Через выгоду',
      approachDescription: 'Четкие рациональные и финансовые плюсы, экономия денег и времени',
      title: benefitTitle,
      lead: benefitLead,
      body: benefitBody,
      callToAction: benefitCta,
      fullText: benefitFullText,
      keyHooks: ['Рациональная экономия', 'Четкий список плюсов', 'Триггер срочности'],
      isFree: false,
      isUnlocked: false,
    },
    {
      id: 'variant-3',
      approach: 'social_proof' as const,
      approachTitle: 'Через соцдоказательство',
      approachDescription: 'Опирается на отзывы, доверие, надежность и репутацию',
      title: socialTitle,
      lead: socialLead,
      body: socialBody,
      callToAction: socialCta,
      fullText: socialFullText,
      keyHooks: ['Факты и отзывы', 'Готовность к любым проверкам', 'Гарантия честности'],
      isFree: false,
      isUnlocked: false,
    },
  ];
}

// API Routes
app.post('/api/generate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { product, targetAudience, tone = 'friendly', platform = 'avito', price, extraDetails } = req.body;

  if (!product || typeof product !== 'string') {
    return res.status(400).json({ error: 'Пожалуйста, укажите, что вы продаёте' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Fallback if no GEMINI_API_KEY
    const variants = generateSmartFallback(product, targetAudience || 'Широкая аудитория', tone, platform, price, extraDetails);
    return res.json({
      variants,
      durationMs: Date.now() - startTime,
    });
  }

  try {
    const toneDescription = TONE_NAMES[tone] || tone;
    const platformDescription = PLATFORM_NAMES[platform] || platform;

    const systemPrompt = `Ты профессиональный копирайтер-маркетолог и эксперт по продающим текстам бота «Kruchok».
Твоя задача — создать ровно 3 разных варианта продающего текста под указанный продукт:
1. Вариант через БОЛЬ клиента (актуализация проблемы/боли, страха потери, неудачного опыта -> как этот продукт легко решает боль -> четкий призыв к действию).
2. Вариант через ВЫГОДУ (рациональные и эмоциональные преимущества, экономия денег/времени, окупаемость, удобство -> сочный оффер -> призыв к действию).
3. Вариант через СОЦДОКАЗАТЕЛЬСТВО (доверие, отзывы, репутация, готовность к любым проверкам, факты, почему выбирают именно это -> гарантия -> призыв к действию).

Параметры:
- Площадка размещения: ${platformDescription}
- Тон коммуникации: ${toneDescription}
- Продукт/услуга: ${product}
- Целевая аудитория (кому): ${targetAudience || 'Все заинтересованные покупатели'}
${price ? `- Цена / условия: ${price}` : ''}
${extraDetails ? `- Дополнительные детали / фичи: ${extraDetails}` : ''}

Требования к качеству текста:
- Текст должен цеплять с первой же строчки (никаких заезженных шаблонных вступлений вроде "Доброго времени суток, вашему вниманию предлагается...").
- Форматирование: абзацы, понятные списки с маркерами или эмодзи, живой русский язык.
- Никакой воды, только мощный продающий копирайтинг.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nСгенерируй ответ строго в формате JSON, соответствующем схеме.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variant1: {
              type: Type.OBJECT,
              description: 'Вариант 1: Через боль клиента',
              properties: {
                title: { type: Type.STRING, description: 'Заголовок объявления или темы' },
                lead: { type: Type.STRING, description: 'Первая цепляющая строчка (лид)' },
                body: { type: Type.STRING, description: 'Основной текст с аргументами' },
                callToAction: { type: Type.STRING, description: 'Призыв к действию (CTA)' },
                fullText: { type: Type.STRING, description: 'Готовый цельный текст для вставки и публикации' },
                keyHooks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-3 ключевых триггера, использованных в тексте',
                },
              },
              required: ['title', 'lead', 'body', 'callToAction', 'fullText', 'keyHooks'],
            },
            variant2: {
              type: Type.OBJECT,
              description: 'Вариант 2: Через выгоду',
              properties: {
                title: { type: Type.STRING, description: 'Заголовок объявления' },
                lead: { type: Type.STRING, description: 'Цепляющий лид с акцентом на выгоду' },
                body: { type: Type.STRING, description: 'Основной текст с подсчетом ценности и экономии' },
                callToAction: { type: Type.STRING, description: 'Призыв к действию' },
                fullText: { type: Type.STRING, description: 'Готовый цельный текст' },
                keyHooks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-3 ключевых триггера',
                },
              },
              required: ['title', 'lead', 'body', 'callToAction', 'fullText', 'keyHooks'],
            },
            variant3: {
              type: Type.OBJECT,
              description: 'Вариант 3: Через соцдоказательство',
              properties: {
                title: { type: Type.STRING, description: 'Заголовок объявления с социальным подтверждением' },
                lead: { type: Type.STRING, description: 'Лид через отзывы и доверие' },
                body: { type: Type.STRING, description: 'Основной текст с фактами и надежностью' },
                callToAction: { type: Type.STRING, description: 'Призыв к действию' },
                fullText: { type: Type.STRING, description: 'Готовый цельный текст' },
                keyHooks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-3 ключевых триггера',
                },
              },
              required: ['title', 'lead', 'body', 'callToAction', 'fullText', 'keyHooks'],
            },
          },
          required: ['variant1', 'variant2', 'variant3'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Пустой ответ от модели');
    }

    const parsed = JSON.parse(text);

    const variants = [
      {
        id: 'variant-1',
        approach: 'pain' as const,
        approachTitle: 'Через боль клиента',
        approachDescription: 'Актуализирует проблему и предлагает продукт как быстрое избавление от неё',
        title: parsed.variant1.title,
        lead: parsed.variant1.lead,
        body: parsed.variant1.body,
        callToAction: parsed.variant1.callToAction,
        fullText: parsed.variant1.fullText,
        keyHooks: parsed.variant1.keyHooks || ['Боль', 'Решение', 'CTA'],
        isFree: true,
        isUnlocked: true,
      },
      {
        id: 'variant-2',
        approach: 'benefit' as const,
        approachTitle: 'Через выгоду',
        approachDescription: 'Показывает выгоду в деньгах, времени и комфорте для покупателя',
        title: parsed.variant2.title,
        lead: parsed.variant2.lead,
        body: parsed.variant2.body,
        callToAction: parsed.variant2.callToAction,
        fullText: parsed.variant2.fullText,
        keyHooks: parsed.variant2.keyHooks || ['Экономия', 'Ценность', 'Оффер'],
        isFree: false,
        isUnlocked: false,
      },
      {
        id: 'variant-3',
        approach: 'social_proof' as const,
        approachTitle: 'Через соцдоказательство',
        approachDescription: 'Формирует максимальное доверие через факты, отзывы и гарантии',
        title: parsed.variant3.title,
        lead: parsed.variant3.lead,
        body: parsed.variant3.body,
        callToAction: parsed.variant3.callToAction,
        fullText: parsed.variant3.fullText,
        keyHooks: parsed.variant3.keyHooks || ['Отзывы', 'Проверка', 'Репутация'],
        isFree: false,
        isUnlocked: false,
      },
    ];

    res.json({
      variants,
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Ошибка Gemini при генерации:', error);
    // Fallback to high quality template so user experience is smooth
    const fallbackVariants = generateSmartFallback(product, targetAudience || 'Покупатели', tone, platform, price, extraDetails);
    res.json({
      variants: fallbackVariants,
      durationMs: Date.now() - startTime,
      fallbackUsed: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kruchok сервер запущен на http://0.0.0.0:${PORT}`);
  });
}

startServer();
