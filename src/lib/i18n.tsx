"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const LOCALES = ["en", "ru", "kk"] as const;
export type Locale = (typeof LOCALES)[number];

const LOCALE_KEY = "qazaq-dama:locale-v1";
const LOCALE_PICKED_KEY = "qazaq-dama:locale-picked-v1";

export const LOCALE_INFO: Record<
  Locale,
  { englishName: string; nativeName: string; flag: string }
> = {
  en: { englishName: "English", nativeName: "English", flag: "🇺🇸" },
  ru: { englishName: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  kk: { englishName: "Kazakh", nativeName: "Қазақша", flag: "🇰🇿" },
};

type Dict = Record<string, string>;

const en: Dict = {
  // Language picker
  "lang.title": "Select your language",
  "lang.subtitle": "You can change it anytime from the menu",
  "lang.continue": "Continue",

  // Menu — top bar
  "menu.sound.mute": "Mute sound",
  "menu.sound.unmute": "Unmute sound",
  "menu.identity.name": "Sign in",
  "menu.pro.upgrade": "Upgrade to Pro",
  "menu.pro.themes": "Themes",

  // Menu — hero
  "menu.subtitle": "Next-gen checkers. From Kazakhstan to the world.",
  "menu.subline": "3-minute duels · vs AI · Online multiplayer · City leaderboard",
  "menu.continueSaved": "Continue saved game",
  "menu.footer": "Made in Kazakhstan · v1.0",

  // Menu — mode cards
  "menu.hotseat.title": "With a friend on one screen",
  "menu.hotseat.desc": "Hot-seat. Pass the device back and forth.",
  "menu.online.title": "Online by link",
  "menu.online.desc": "Create a match, send the link to a friend.",
  "menu.online.badge": "Realtime",
  "menu.ai.badge": "3 levels",
  "menu.ai.title": "vs AI",
  "menu.ai.desc": "Minimax + alpha-beta. Pick a difficulty:",
  "menu.ai.easy": "Easy",
  "menu.ai.easy.sub": "warm-up only",
  "menu.ai.medium": "Medium",
  "menu.ai.medium.sub": "brain training",
  "menu.ai.hard": "Hard",
  "menu.ai.hard.sub": "you're in trouble",
  "menu.leaderboard.title": "City leaderboard",
  "menu.leaderboard.desc": "Top players from Almaty, Astana, Karagandy…",

  // Identity modal
  "identity.title": "Who are you, champion?",
  "identity.description":
    "Your name and city go on the leaderboard. You can change it anytime.",
  "identity.field.name": "Name",
  "identity.field.city": "City",
  "identity.name.placeholder": "Aidar",
  "identity.error.save": "Couldn't save. Check that private mode is off in your browser.",
  "identity.button.later": "Later",
  "identity.button.save": "Save",

  // Pro modal
  "pro.title": "Qazaq Dama Pro",
  "pro.subtitle": "Support the project and unlock everything",
  "pro.price.suffix": "/mo",
  "pro.earlyBird": "Early bird · first 1000 users",
  "pro.feat.themes": "Exclusive board themes: \"Yurt\", \"Steppe\", \"Tengri\"",
  "pro.feat.pieces": "Custom checker designs (golden ornaments, lazurite)",
  "pro.feat.coach": "Unlimited AI analysis + personal training plan",
  "pro.feat.tournaments": "4-8 player tournaments and private rooms",
  "pro.feat.noAds": "No ads forever",
  "pro.button.get": "Get Pro",
  "pro.button.loading": "Opening Stripe…",
  "pro.already.title": "You're already Pro!",
  "pro.already.subtitle": "Thanks for the support 🙏",
  "pro.test.title": "🧪 Test mode",
  "pro.test.card": "Card:",
  "pro.test.line2": "Expiry: any future date · CVC: any 3 digits",

  // Theme picker
  "themes.badge.proActive": "Pro active",
  "themes.badge.noPro": "Board themes",
  "themes.title": "Choose your board theme",
  "themes.hint": "Premium themes unlock with Pro",
  "themes.classic.name": "Classic",
  "themes.classic.sub": "Dark blue night",
  "themes.yurta.name": "Yurt",
  "themes.yurta.sub": "Warm terracotta desert",
  "themes.steppe.name": "Steppe",
  "themes.steppe.sub": "Emerald plain",
  "themes.tengri.name": "Tengri",
  "themes.tengri.sub": "Cosmic azure",
  "themes.apply": "Apply",
  "themes.alreadyApplied": "Theme already applied",

  // Pro success
  "proSuccess.loading": "Confirming payment…",
  "proSuccess.failed.title": "Couldn't verify payment",
  "proSuccess.failed.button": "Back to game",
  "proSuccess.ok.title": "Welcome to Pro!",
  "proSuccess.ok.body": "Thanks for supporting Qazaq Dama 🇰🇿",
  "proSuccess.ok.badge": "Board themes and Pro features unlocked",
  "proSuccess.ok.button": "Go to game →",
  "proSuccess.checkout.error": "Couldn't open Stripe",
};

const ru: Dict = {
  "lang.title": "Выберите язык",
  "lang.subtitle": "Сменить можно в любой момент в меню",
  "lang.continue": "Продолжить",

  "menu.sound.mute": "Выключить звук",
  "menu.sound.unmute": "Включить звук",
  "menu.identity.name": "Назваться",
  "menu.pro.upgrade": "Получить Pro",
  "menu.pro.themes": "Темы",

  "menu.subtitle": "Шашки нового поколения. Қазақстаннан әлемге.",
  "menu.subline": "3-минутные дуэли · Игра с ИИ · Мультиплеер по ссылке · Лидерборд городов",
  "menu.continueSaved": "Продолжить сохранённую партию",
  "menu.footer": "Сделано в Қазақстан · v1.0",

  "menu.hotseat.title": "С другом за одним экраном",
  "menu.hotseat.desc": "Hot-seat. Передавайте устройство по очереди.",
  "menu.online.title": "Онлайн по ссылке",
  "menu.online.desc": "Создайте партию, отправьте ссылку другу.",
  "menu.online.badge": "Realtime",
  "menu.ai.badge": "3 уровня",
  "menu.ai.title": "Против ИИ",
  "menu.ai.desc": "Minimax + alpha-beta. Выбирай сложность:",
  "menu.ai.easy": "Лёгкий",
  "menu.ai.easy.sub": "только для разминки",
  "menu.ai.medium": "Средний",
  "menu.ai.medium.sub": "тренировка ума",
  "menu.ai.hard": "Сложный",
  "menu.ai.hard.sub": "тебе будет туго",
  "menu.leaderboard.title": "Лидерборд городов",
  "menu.leaderboard.desc": "Топ игроков из Алматы, Астаны, Караганды…",

  "identity.title": "Кто ты, чемпион?",
  "identity.description":
    "Имя и город попадут в лидерборд. Можешь сменить в любой момент.",
  "identity.field.name": "Имя",
  "identity.field.city": "Город",
  "identity.name.placeholder": "Айдар",
  "identity.error.save": "Не удалось сохранить. Проверь, не выключен ли private mode в браузере.",
  "identity.button.later": "Позже",
  "identity.button.save": "Сохранить",

  "pro.title": "Qazaq Dama Pro",
  "pro.subtitle": "Поддержи проект и получи всё",
  "pro.price.suffix": "/мес",
  "pro.earlyBird": "Early bird · первые 1000 пользователей",
  "pro.feat.themes": "Эксклюзивные темы досок: «Юрта», «Степь», «Тенгри»",
  "pro.feat.pieces": "Кастомные дизайны шашек (золотые орнаменты, лазуритовые)",
  "pro.feat.coach": "Безлимитный AI-разбор + персональный план тренировок",
  "pro.feat.tournaments": "Турниры на 4-8 игроков и приватные комнаты",
  "pro.feat.noAds": "Без рекламы навсегда",
  "pro.button.get": "Получить Pro",
  "pro.button.loading": "Открываем Stripe…",
  "pro.already.title": "Ты уже Pro!",
  "pro.already.subtitle": "Спасибо за поддержку 🙏",
  "pro.test.title": "🧪 Тестовый режим",
  "pro.test.card": "Карта:",
  "pro.test.line2": "Срок: любая будущая дата · CVC: любые 3 цифры",

  "themes.badge.proActive": "Pro активен",
  "themes.badge.noPro": "Темы досок",
  "themes.title": "Выбери тему доски",
  "themes.hint": "Премиум-темы открываются с Pro",
  "themes.classic.name": "Классика",
  "themes.classic.sub": "Тёмно-синяя ночь",
  "themes.yurta.name": "Юрта",
  "themes.yurta.sub": "Тёплая терракотовая пустыня",
  "themes.steppe.name": "Степь",
  "themes.steppe.sub": "Изумрудная равнина",
  "themes.tengri.name": "Тенгри",
  "themes.tengri.sub": "Космическая лазурь",
  "themes.apply": "Применить",
  "themes.alreadyApplied": "Тема уже применена",

  "proSuccess.loading": "Подтверждаем оплату…",
  "proSuccess.failed.title": "Не удалось подтвердить оплату",
  "proSuccess.failed.button": "Вернуться к игре",
  "proSuccess.ok.title": "Добро пожаловать в Pro!",
  "proSuccess.ok.body": "Спасибо за поддержку Qazaq Dama 🇰🇿",
  "proSuccess.ok.badge": "Темы досок и Pro-фишки активированы",
  "proSuccess.ok.button": "Перейти в игру →",
  "proSuccess.checkout.error": "Не удалось открыть Stripe",
};

const kk: Dict = {
  "lang.title": "Тілді таңдаңыз",
  "lang.subtitle": "Кез келген уақытта мәзірден өзгерте аласыз",
  "lang.continue": "Жалғастыру",

  "menu.sound.mute": "Дыбысты өшіру",
  "menu.sound.unmute": "Дыбысты қосу",
  "menu.identity.name": "Кіру",
  "menu.pro.upgrade": "Pro нұсқасына өту",
  "menu.pro.themes": "Тақырыптар",

  "menu.subtitle": "Жаңа буын дойбысы. Қазақстаннан әлемге.",
  "menu.subline": "3 минуттық дуэль · ЖИ-мен ойын · Сілтеме арқылы ойын · Қалалар рейтингі",
  "menu.continueSaved": "Сақталған ойынды жалғастыру",
  "menu.footer": "Қазақстанда жасалған · v1.0",

  "menu.hotseat.title": "Достыңмен бір экранда",
  "menu.hotseat.desc": "Hot-seat. Құрылғыны кезек-кезек беріңіз.",
  "menu.online.title": "Сілтеме арқылы онлайн",
  "menu.online.desc": "Партия жаса, сілтемесін досыңа жібер.",
  "menu.online.badge": "Realtime",
  "menu.ai.badge": "3 деңгей",
  "menu.ai.title": "ЖИ-ге қарсы",
  "menu.ai.desc": "Minimax + alpha-beta. Қиындықты таңда:",
  "menu.ai.easy": "Жеңіл",
  "menu.ai.easy.sub": "тек жаттығу үшін",
  "menu.ai.medium": "Орташа",
  "menu.ai.medium.sub": "ой жаттығуы",
  "menu.ai.hard": "Қиын",
  "menu.ai.hard.sub": "оңай болмайды",
  "menu.leaderboard.title": "Қалалар рейтингі",
  "menu.leaderboard.desc": "Алматы, Астана, Қарағандыдан үздік ойыншылар…",

  "identity.title": "Сен кімсің, чемпион?",
  "identity.description":
    "Атың мен қалаң рейтингке шығады. Кез келген уақытта өзгерте аласың.",
  "identity.field.name": "Аты",
  "identity.field.city": "Қала",
  "identity.name.placeholder": "Айдар",
  "identity.error.save": "Сақтай алмадық. Браузердегі құпия режимді тексер.",
  "identity.button.later": "Кейінірек",
  "identity.button.save": "Сақтау",

  "pro.title": "Qazaq Dama Pro",
  "pro.subtitle": "Жобаны қолда және бәрін ал",
  "pro.price.suffix": "/ай",
  "pro.earlyBird": "Early bird · алғашқы 1000 қолданушы",
  "pro.feat.themes": "Эксклюзив тақта тақырыптары: «Юрта», «Дала», «Тәңірі»",
  "pro.feat.pieces": "Дойбы тастарының жеке дизайны (алтын өрнектер, лазурит)",
  "pro.feat.coach": "Шексіз ЖИ-талдау + жеке жаттығу жоспары",
  "pro.feat.tournaments": "4-8 ойыншыға арналған турнирлер және жабық бөлмелер",
  "pro.feat.noAds": "Жарнамасыз — мәңгілікке",
  "pro.button.get": "Pro алу",
  "pro.button.loading": "Stripe ашылуда…",
  "pro.already.title": "Сен қазірдің өзінде Pro!",
  "pro.already.subtitle": "Қолдау үшін рахмет 🙏",
  "pro.test.title": "🧪 Тест режимі",
  "pro.test.card": "Карта:",
  "pro.test.line2": "Мерзім: кез келген келешек күн · CVC: кез келген 3 сан",

  "themes.badge.proActive": "Pro белсенді",
  "themes.badge.noPro": "Тақта тақырыптары",
  "themes.title": "Тақта тақырыбын таңда",
  "themes.hint": "Премиум тақырыптар Pro-да ашылады",
  "themes.classic.name": "Классика",
  "themes.classic.sub": "Қою көк түн",
  "themes.yurta.name": "Юрта",
  "themes.yurta.sub": "Жылы терракот шөл",
  "themes.steppe.name": "Дала",
  "themes.steppe.sub": "Зүмірет жазық",
  "themes.tengri.name": "Тәңірі",
  "themes.tengri.sub": "Ғарыштық көк",
  "themes.apply": "Қолдану",
  "themes.alreadyApplied": "Тақырып қолданылған",

  "proSuccess.loading": "Төлемді растаудамыз…",
  "proSuccess.failed.title": "Төлемді растай алмадық",
  "proSuccess.failed.button": "Ойынға қайту",
  "proSuccess.ok.title": "Pro-ға қош келдің!",
  "proSuccess.ok.body": "Qazaq Dama жобасын қолдағаныңа рахмет 🇰🇿",
  "proSuccess.ok.badge": "Тақта тақырыптары мен Pro-мүмкіндіктер ашылды",
  "proSuccess.ok.button": "Ойынға өту →",
  "proSuccess.checkout.error": "Stripe ашылмады",
};

const dictionaries: Record<Locale, Dict> = { en, ru, kk };

type LangContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  hasPicked: boolean;
  markPicked: () => void;
  ready: boolean;
};

const LangContext = createContext<LangContextValue>({
  locale: "en",
  setLocale: () => {},
  hasPicked: true,
  markPicked: () => {},
  ready: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hasPicked, setHasPicked] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_KEY);
      if (stored === "en" || stored === "ru" || stored === "kk") {
        setLocaleState(stored);
      }
      const picked = localStorage.getItem(LOCALE_PICKED_KEY);
      setHasPicked(picked === "1");
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    try {
      localStorage.setItem(LOCALE_KEY, l);
    } catch {
      // ignore
    }
    setLocaleState(l);
  }, []);

  const markPicked = useCallback(() => {
    try {
      localStorage.setItem(LOCALE_PICKED_KEY, "1");
    } catch {
      // ignore
    }
    setHasPicked(true);
  }, []);

  return (
    <LangContext.Provider value={{ locale, setLocale, hasPicked, markPicked, ready }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLocale() {
  return useContext(LangContext);
}

export function useT() {
  const { locale } = useContext(LangContext);
  return (key: string): string => {
    return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  };
}
