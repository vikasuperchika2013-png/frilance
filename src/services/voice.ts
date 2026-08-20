import { ParsedVoiceCommand, Category, TransactionType, ActivePage, ThemeName } from '../types';

// Web Speech API interface definitions for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): ISpeechRecognition };
    webkitSpeechRecognition?: { new (): ISpeechRecognition };
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(): ISpeechRecognition | null {
  if (!isSpeechRecognitionSupported()) return null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  const recognizer = new SpeechRec();
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.lang = 'ru-RU';
  return recognizer;
}

// Convert Russian word numbers to numeric value
function parseRussianNumberWords(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let current = 0;
  let total = 0;

  const smallNums: Record<string, number> = {
    один: 1, одна: 1, одно: 1,
    два: 2, две: 2,
    три: 3,
    четыре: 4,
    пять: 5,
    шесть: 6,
    семь: 7,
    восемь: 8,
    девять: 9,
    десять: 10,
    одиннадцать: 11,
    двенадцать: 12,
    тринадцать: 13,
    четырнадцать: 14,
    пятнадцать: 15,
    шестнадцать: 16,
    семнадцать: 17,
    восемнадцать: 18,
    девятнадцать: 19,
    двадцать: 20,
    тридцать: 30,
    сорок: 40,
    пятьдесят: 50,
    шестьдесят: 60,
    семьдесят: 70,
    восемьдесят: 80,
    девяносто: 90,
    сто: 100,
    двести: 200,
    триста: 300,
    четыреста: 400,
    пятьсот: 500,
    шестьсот: 600,
    семьсот: 700,
    восемьсот: 800,
    девятьсот: 900,
  };

  const scaleNums: Record<string, number> = {
    тысяча: 1000,
    тысячи: 1000,
    тысяч: 1000,
    миллион: 1000000,
    миллиона: 1000000,
    миллионов: 1000000,
    лям: 1000000,
    косарь: 1000,
    косаря: 1000,
    косарей: 1000,
    к: 1000,
  };

  for (const word of words) {
    if (smallNums[word] !== undefined) {
      current += smallNums[word];
    } else if (scaleNums[word] !== undefined) {
      if (current === 0) current = 1;
      total += current * scaleNums[word];
      current = 0;
    }
  }

  return total + current;
}

// Smart Russian Natural Language Parser for Financial Commands
export function parseVoiceInput(text: string, categories: Category[]): ParsedVoiceCommand {
  const normalized = text.toLowerCase().trim();

  // 1. Navigation Commands
  if (normalized.includes('статистик') || normalized.includes('график') || normalized.includes('аналитик')) {
    return {
      action: 'navigate',
      targetPage: 'statistics',
      rawText: text,
      confidenceMessage: 'Команда перехода: Открыть статистику',
    };
  }

  if (normalized.includes('кредит') || normalized.includes('долг') || normalized.includes('займ')) {
    return {
      action: 'navigate',
      targetPage: 'loans',
      rawText: text,
      confidenceMessage: 'Команда перехода: Открыть кредиты',
    };
  }

  if (normalized.includes('копилк') || normalized.includes('цел') || normalized.includes('накоплен')) {
    return {
      action: 'navigate',
      targetPage: 'goals',
      rawText: text,
      confidenceMessage: 'Команда перехода: Открыть копилки',
    };
  }

  if (normalized.includes('подушк') || normalized.includes('черный день') || normalized.includes('чёрный день') || normalized.includes('фонд')) {
    return {
      action: 'navigate',
      targetPage: 'emergency',
      rawText: text,
      confidenceMessage: 'Команда перехода: Фонд на чёрный день',
    };
  }

  if (normalized.includes('категори') || normalized.includes('список категорий')) {
    return {
      action: 'navigate',
      targetPage: 'categories',
      rawText: text,
      confidenceMessage: 'Команда перехода: Открыть категории',
    };
  }

  if (normalized.includes('операци') || normalized.includes('истори') || normalized.includes('транзакци') || normalized.includes('список расходов')) {
    return {
      action: 'navigate',
      targetPage: 'transactions',
      rawText: text,
      confidenceMessage: 'Команда перехода: История операций',
    };
  }

  if (normalized.includes('главн') || normalized.includes('дашборд') || normalized.includes('домой')) {
    return {
      action: 'navigate',
      targetPage: 'dashboard',
      rawText: text,
      confidenceMessage: 'Команда перехода: Главная страница',
    };
  }

  // 2. Theme Commands
  if (normalized.includes('темн') || normalized.includes('тёмн') || normalized.includes('ночн') || normalized.includes('ночной')) {
    return {
      action: 'toggle_theme',
      nightMode: true,
      rawText: text,
      confidenceMessage: 'Включить тёмную тему',
    };
  }

  if (normalized.includes('светл') || normalized.includes('дневн') || normalized.includes('бел') || normalized.includes('белый') || normalized.includes('белая')) {
    return {
      action: 'toggle_theme',
      themeName: 'light',
      nightMode: false,
      rawText: text,
      confidenceMessage: 'Включить белоснежную светлую тему',
    };
  }

  if (normalized.includes('природн') || normalized.includes('горы') || normalized.includes('пейзаж')) {
    return {
      action: 'toggle_theme',
      themeName: 'nature',
      rawText: text,
      confidenceMessage: 'Установить природную тему',
    };
  }

  if (normalized.includes('ярк')) {
    return {
      action: 'toggle_theme',
      themeName: 'vibrant',
      rawText: text,
      confidenceMessage: 'Установить яркую тему',
    };
  }

  // 3. Balance Query Command
  if (normalized.includes('баланс') || normalized.includes('сколько денег') || normalized.includes('остаток')) {
    return {
      action: 'show_balance',
      rawText: text,
      confidenceMessage: 'Запрос текущего баланса',
    };
  }

  // 4. Financial Transaction Commands (Income / Expense)
  // Extract numeric digits
  const digitMatches = normalized.match(/\d+[\d\s.,]*/g);
  let amount = 0;
  if (digitMatches && digitMatches.length > 0) {
    const rawNum = digitMatches[0].replace(/\s+/g, '').replace(',', '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  // If no digits found, try word numbers (e.g. "пять тысяч", "сто тысяч")
  if (amount === 0) {
    const wordNum = parseRussianNumberWords(normalized);
    if (wordNum > 0) {
      amount = wordNum;
    }
  }

  // Determine Type: Income or Expense
  let txType: TransactionType = 'expense';
  if (
    normalized.includes('доход') ||
    normalized.includes('заработал') ||
    normalized.includes('получил') ||
    normalized.includes('приход') ||
    normalized.includes('зарплат') ||
    normalized.includes('преми') ||
    normalized.includes('подарок') ||
    normalized.includes('инвестици')
  ) {
    txType = 'income';
  } else if (
    normalized.includes('расход') ||
    normalized.includes('потратил') ||
    normalized.includes('купил') ||
    normalized.includes('оплатил') ||
    normalized.includes('списали') ||
    normalized.includes('отдал') ||
    normalized.includes('чек')
  ) {
    txType = 'expense';
  }

  // Match Category
  const availableCategories = categories.filter((c) => c.type === txType);
  let matchedCategory: Category | undefined;

  const synonyms: Record<string, string[]> = {
    cat_exp_1: ['еда', 'еду', 'продукты', 'кафе', 'ресторан', 'обед', 'ужин', 'завтрак', 'супермаркет', 'магазин', 'кофе', 'фастфуд', 'пицца', 'бургер', 'хлеб', 'молоко'],
    cat_exp_2: ['транспорт', 'такси', 'бензин', 'автобус', 'метро', 'машина', 'заправка', 'проезд', 'яндекс такси', 'каршеринг', 'парковка'],
    cat_exp_3: ['развлечения', 'кино', 'игры', 'подписка', 'вечеринка', 'театр', 'концерт', 'клуб', 'отдых', 'билеты'],
    cat_exp_4: ['одежда', 'обувь', 'кроссовки', 'куртка', 'шоппинг', 'вещи', 'рубашка', 'джинсы'],
    cat_exp_5: ['образование', 'курсы', 'книги', 'учеба', 'школа', 'университет', 'тренинг', 'лекция'],
    cat_exp_6: ['дом', 'аренда', 'квартплата', 'коммуналка', 'жкх', 'мебель', 'интернет', 'уборка', 'ремонт'],
    cat_exp_7: ['здоровье', 'аптека', 'лекарства', 'врач', 'медицина', 'клиника', 'стоматолог', 'спорт', 'зал', 'фитнес'],
    cat_inc_1: ['зарплата', 'аванс', 'оклад', 'зп', 'основная'],
    cat_inc_2: ['подработка', 'фриланс', 'проект', 'заказ', 'халтура'],
    cat_inc_3: ['подарок', 'подарили', 'день рождения'],
    cat_inc_4: ['инвестиции', 'дивиденды', 'акции', 'проценты', 'вклад', 'депозит', 'крипта'],
  };

  for (const cat of availableCategories) {
    if (normalized.includes(cat.name.toLowerCase())) {
      matchedCategory = cat;
      break;
    }
    const catSynonyms = synonyms[cat.id] || [];
    for (const syn of catSynonyms) {
      if (normalized.includes(syn)) {
        matchedCategory = cat;
        break;
      }
    }
    if (matchedCategory) break;
  }

  if (!matchedCategory) {
    matchedCategory = availableCategories.find((c) => c.name === 'Другое') || availableCategories[0];
  }

  if (amount > 0) {
    return {
      action: 'add_transaction',
      type: txType,
      amount,
      categoryId: matchedCategory?.id,
      categoryName: matchedCategory?.name,
      rawText: text,
      confidenceMessage: `Распознано: ${txType === 'income' ? '📈 Доход' : '📉 Расход'} ${amount.toLocaleString('ru-RU')} ₸, категория «${matchedCategory?.name || 'Другое'}»`,
    };
  }

  return {
    action: 'unknown',
    rawText: text,
    confidenceMessage: `Текст: «${text}». Нажмите готовые примеры ниже или скажите: «Расход 3000 еда»`,
  };
}

export function speakFeedback(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error', e);
  }
}
