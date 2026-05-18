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
  "menu.profile.menu": "Profile menu",
  "menu.profile.language": "Language",
  "menu.profile.identity": "Name & city",
  "menu.profile.logout": "Log out",
  "menu.profile.logout.confirm": "Log out and wipe all profile data from this device (name, Pro, theme, language)?",

  // Menu — hero
  "menu.subtitle": "Beat the AI — meet a chess champion of Kazakhstan",
  "menu.subline": "Champions Cup · 6 legends · Main prize — personal meeting",
  "menu.continueSaved": "Continue saved game",
  "menu.footer.made": "Made in Kazakhstan",
  "menu.footer.incubator": "Specially for nFactorial Incubator · 2026",
  "menu.footer.founder": "Founder",

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

  // Game screen
  "game.confirmSurrender": "Surrender? Your opponent wins.",
  "game.mode.ai": "vs AI · {level}",
  "game.mode.hotseat": "With a friend on one screen",
  "game.mode.online": "Online",
  "game.opponent.ai": "AI opponent",
  "game.opponent.player2.blue": "Player 2 (blue)",
  "game.opponent.player1.blue": "Player 1 (blue)",
  "game.opponent.generic": "Opponent",
  "game.you": "You",
  "game.you.player1.gold": "Player 1 (gold)",
  "game.you.player2.gold": "Player 2 (gold)",
  "game.btn.menu": "Menu",
  "game.btn.surrender": "Surrender",

  // Game sidebar
  "sidebar.pieces": "{n} pieces",
  "sidebar.aiThinking": "AI thinking…",
  "sidebar.history": "Move history",
  "sidebar.gameStarted": "Game just started",

  // Chat
  "chat.open": "Open chat",
  "chat.withOpponent": "Chat with {name}",
  "chat.empty": "No messages yet.",
  "chat.greet": "Say hi to your opponent 👋",
  "chat.stickers": "Stickers",
  "chat.placeholder": "Message…",
  "chat.send": "Send",

  // End screen
  "end.error": "Error",
  "end.title.draw": "Draw!",
  "end.title.win": "Victory!",
  "end.title.lose": "Defeat",
  "end.subtitle.draw": "A worthy match for both sides",
  "end.subtitle.win": "The crown is yours!",
  "end.subtitle.lose": "Rematch?",
  "end.moves": "Moves",
  "end.time": "Time",
  "end.savedTo": "Result saved to leaderboard:",
  "end.cup.earned.title": "+1 point in Champions Cup",
  "end.cup.earned.sub": "Season {season} — see your standing",
  "end.cup.tooShort": "Point not counted — match too short (min. 8 moves, 30 sec).",
  "end.cup.playHard": "Want a Cup point? Beat the Hard AI.",
  "end.cup.needIdentity": "Set your name to earn Cup points.",
  "end.coach.title": "Match analysis by AI coach",
  "end.coach.thinking": "Coach is thinking…",
  "end.coach.label": "AI coach",
  "end.coach.unavailable": "AI coach unavailable — no API key.",
  "end.errorPrefix": "Error:",
  "end.btn.menu": "Menu",
  "end.btn.rematch": "Rematch",

  // Multiplayer
  "mp.notConfigured.title": "Multiplayer not configured",
  "mp.notConfigured.body": "Online matches need Supabase Realtime. The admin must set it up.",
  "mp.alreadyFull.title": "Match already in progress",
  "mp.alreadyFull.body": "Two players are already in this room. Create your own match from the main menu.",
  "mp.waiting.title": "Waiting for opponent",
  "mp.waiting.body": "Copy the link and send it to a friend — the match starts as soon as they open it.",
  "mp.copied": "Copied",
  "mp.copy": "Copy",
  "mp.youPlay.gold": "You play gold (you move first).",
  "mp.youPlay.blue": "You play blue.",
  "mp.youPlay.unknown": "You play …",
  "mp.cancel": "Cancel",
  "mp.mode": "Online · multiplayer",
  "mp.color.gold": "gold",
  "mp.color.blue": "blue",
  "mp.opponentFallback": "opponent",
  "mp.you.withColor": "You ({color})",
  "mp.leave": "Leave",
  "mp.surrender": "Surrender",
  "mp.identity.title": "Enter your name",
  "mp.identity.desc": "Your opponent will see your name. The match starts after this.",
  "mp.identity.submit": "Start",

  // Leaderboard
  "lb.menu": "Menu",
  "lb.title": "City leaderboard",
  "lb.subtitle": "Top players of Kazakhstan · updates in real time",
  "lb.notReady": "Leaderboard activates once Supabase is connected.",
  "lb.worksNow": "Working now:",
  "lb.loading": "Loading…",
  "lb.empty1": "Nobody has played a match yet.",
  "lb.empty2": "Be the first in Qazaq Dama history!",
  "lb.allKz": "All Kazakhstan",
  "lb.col.player": "Player",
  "lb.col.points": "Points",
  "lb.col.wins": "Wins",
  "lb.col.games": "Games",
  "lb.col.winPct": "Win %",
  "lb.cities.title": "Top cities",
  "lb.cities.stats": "{players} players · {wins} wins",

  // Champions Cup
  "cup.title": "Champions Cup",
  "cup.season.label": "Season",
  "cup.prize.label": "Main prize of the season",
  "cup.prize.meeting": "A personal meeting with the champion of the season",
  "cup.prize.disclaimer": "The top player receives an invitation. Format, date and location are agreed individually.",
  "cup.daysLeft": "{n} days until season ends",
  "cup.daysLeft.last": "Final day of the season",
  "cup.leader.label": "Current leader",
  "cup.leader.empty": "Nobody on the board yet — be the first!",
  "cup.leader.line": "{name} ({city}) · {points} pts",
  "cup.myStanding.label": "Your standing",
  "cup.myStanding.ranked": "Rank #{rank} of {total} · {points} pts",
  "cup.myStanding.unranked": "{points} pts · win to climb the ranks",
  "cup.myStanding.empty": "Beat the Hard AI to enter the cup",
  "cup.identityRequired": "Set your name via the profile in the top-right to start earning points",
  "cup.howTo.title": "How to earn points",
  "cup.howTo.body": "Beat the Hard AI below — 1 win = 1 Cup point. Match must last at least 8 moves and 30 seconds.",
  "cup.btn.playForPrize": "Play for the prize",
  "cup.btn.subHint": "Hard AI · 1 win = 1 point · min. 8 moves, 30 sec",
  "cup.btn.play": "Play for the prize →",
  "cup.btn.viewAll": "All champions →",

  // Champions page
  "champions.title": "Champions of Kazakhstan",
  "champions.subtitle": "Six chess legends. Each holds one season of the Cup.",
  "champions.back": "Menu",
  "champions.fide.label": "FIDE",
  "champions.born.label": "Born",
  "champions.wiki": "View on Wikipedia →",
  "champions.season.current": "Current season",
  "champions.season.upcoming": "Upcoming",
  "champions.season.past": "Past",
  "champions.about.title": "How the Cup works",
  "champions.about.body": "Every month a different champion holds the season. To earn Cup points, beat the Hard AI — every such win gives you 1 point. At the end of the month, the player with the most points receives a personal invitation to meet that season's champion. Format, date and location are agreed individually with the winner.",
  "champions.points.title": "Points per win",
  "champions.points.hotseat": "Hot-seat",
  "champions.points.aiEasy": "AI · Easy",
  "champions.points.aiMedium": "AI · Medium",
  "champions.points.aiHard": "AI · Hard",
  "champions.points.aiHard.desc": "Beat minimax + alpha-beta at full depth",
  "champions.points.multi": "Multiplayer",
  "champions.points.suffix": "pts",
  "champions.points.antiFarm": "A match must last at least 8 moves and 30 seconds — guards against instant-surrender farming.",
  "champions.points.excluded": "Hot-seat, AI Easy/Medium and Multiplayer don't earn Cup points — too easy to farm with a friend.",
  "champions.standings.title": "Season standings",
  "champions.standings.empty": "No scores yet for this season",
  "champions.standings.notConfigured": "The Cup activates once the database is connected.",
  "champions.standings.col.rank": "#",
  "champions.standings.col.player": "Player",
  "champions.standings.col.points": "Points",
  "champions.standings.col.wins": "Wins",
  "champions.standings.you": "You",
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
  "menu.profile.menu": "Меню профиля",
  "menu.profile.language": "Язык",
  "menu.profile.identity": "Имя и город",
  "menu.profile.logout": "Выйти из игры",
  "menu.profile.logout.confirm": "Выйти и очистить все данные профиля с этого устройства (имя, Pro, тема, язык)?",

  "menu.subtitle": "Победи ИИ — встреться с чемпионом Казахстана",
  "menu.subline": "Кубок Чемпионов · 6 шахматных легенд · Главный приз — личная встреча",
  "menu.continueSaved": "Продолжить сохранённую партию",
  "menu.footer.made": "Сделано в Казахстане",
  "menu.footer.incubator": "Специально для nFactorial Incubator · 2026",
  "menu.footer.founder": "Основатель",

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

  "game.confirmSurrender": "Сдаться? Соперник победит.",
  "game.mode.ai": "Против ИИ · {level}",
  "game.mode.hotseat": "С другом — за одним экраном",
  "game.mode.online": "Онлайн",
  "game.opponent.ai": "ИИ-соперник",
  "game.opponent.player2.blue": "Игрок 2 (синие)",
  "game.opponent.player1.blue": "Игрок 1 (синие)",
  "game.opponent.generic": "Соперник",
  "game.you": "Вы",
  "game.you.player1.gold": "Игрок 1 (золотые)",
  "game.you.player2.gold": "Игрок 2 (золотые)",
  "game.btn.menu": "В меню",
  "game.btn.surrender": "Сдаться",

  "sidebar.pieces": "{n} шашек",
  "sidebar.aiThinking": "ИИ думает…",
  "sidebar.history": "История ходов",
  "sidebar.gameStarted": "Партия только началась",

  "chat.open": "Открыть чат",
  "chat.withOpponent": "Чат с {name}",
  "chat.empty": "Сообщений нет.",
  "chat.greet": "Поприветствуй соперника 👋",
  "chat.stickers": "Стикеры",
  "chat.placeholder": "Сообщение…",
  "chat.send": "Отправить",

  "end.error": "Ошибка",
  "end.title.draw": "Ничья!",
  "end.title.win": "Победа!",
  "end.title.lose": "Поражение",
  "end.subtitle.draw": "Достойная партия для обеих сторон",
  "end.subtitle.win": "Победа за тобой!",
  "end.subtitle.lose": "Реванш?",
  "end.moves": "Ходов",
  "end.time": "Время",
  "end.savedTo": "Результат сохранён в лидерборд:",
  "end.cup.earned.title": "+1 очко в Кубок Чемпионов",
  "end.cup.earned.sub": "Сезон {season} — смотри свой ранг",
  "end.cup.tooShort": "Очко не засчитано — партия слишком короткая (мин. 8 ходов, 30 сек).",
  "end.cup.playHard": "Хочешь очко в Кубок? Сыграй с ИИ Сложный.",
  "end.cup.needIdentity": "Назовись, чтобы заработать очко в Кубок.",
  "end.coach.title": "Разбор партии от AI-тренера",
  "end.coach.thinking": "Тренер думает…",
  "end.coach.label": "AI-тренер",
  "end.coach.unavailable": "AI-тренер недоступен — нет API-ключа.",
  "end.errorPrefix": "Ошибка:",
  "end.btn.menu": "В меню",
  "end.btn.rematch": "Реванш",

  "mp.notConfigured.title": "Мультиплеер не настроен",
  "mp.notConfigured.body": "Для онлайн-партий нужен Supabase Realtime. Админ должен задать переменные.",
  "mp.alreadyFull.title": "Партия уже занята",
  "mp.alreadyFull.body": "В этой комнате уже играют двое. Создай свою партию из главного меню.",
  "mp.waiting.title": "Ждём соперника",
  "mp.waiting.body": "Скопируй ссылку и отправь другу — как только он откроет, начнётся партия.",
  "mp.copied": "Скопировано",
  "mp.copy": "Копировать",
  "mp.youPlay.gold": "Ты играешь золотыми (ходишь первым).",
  "mp.youPlay.blue": "Ты играешь синими.",
  "mp.youPlay.unknown": "Ты играешь …",
  "mp.cancel": "Отменить",
  "mp.mode": "Онлайн · мультиплеер",
  "mp.color.gold": "золотые",
  "mp.color.blue": "синие",
  "mp.opponentFallback": "соперником",
  "mp.you.withColor": "Вы ({color})",
  "mp.leave": "Покинуть",
  "mp.surrender": "Сдаться",
  "mp.identity.title": "Введи своё имя",
  "mp.identity.desc": "Соперник увидит твоё имя. После этого начнётся партия.",
  "mp.identity.submit": "Начать",

  "lb.menu": "В меню",
  "lb.title": "Лидерборд городов",
  "lb.subtitle": "Топ игроков Қазақстана · обновляется в реальном времени",
  "lb.notReady": "Лидерборд активируется когда подключим Supabase.",
  "lb.worksNow": "Сейчас работают:",
  "lb.loading": "Загрузка…",
  "lb.empty1": "Пока никто не сыграл партию.",
  "lb.empty2": "Будь первым в истории Qazaq Dama!",
  "lb.allKz": "Весь Қазақстан",
  "lb.col.player": "Игрок",
  "lb.col.points": "Очки",
  "lb.col.wins": "Победы",
  "lb.col.games": "Игры",
  "lb.col.winPct": "% побед",
  "lb.cities.title": "Топ городов",
  "lb.cities.stats": "{players} игроков · {wins} побед",

  // Champions Cup
  "cup.title": "Кубок чемпионов",
  "cup.season.label": "Сезон",
  "cup.prize.label": "Главный приз сезона",
  "cup.prize.meeting": "Личная встреча с чемпионом сезона",
  "cup.prize.disclaimer": "Лидер получает приглашение. Формат, дата и место согласуются индивидуально.",
  "cup.daysLeft": "До конца сезона: {n} дн.",
  "cup.daysLeft.last": "Последний день сезона",
  "cup.leader.label": "Текущий лидер",
  "cup.leader.empty": "Лидера ещё нет — стань первым!",
  "cup.leader.line": "{name} ({city}) · {points} очк.",
  "cup.myStanding.label": "Твоё место",
  "cup.myStanding.ranked": "{rank}-е место из {total} · {points} очк.",
  "cup.myStanding.unranked": "{points} очк. · побеждай, чтобы подняться",
  "cup.myStanding.empty": "Победи ИИ Сложный, чтобы войти в Кубок",
  "cup.identityRequired": "Назовись через профиль в правом верхнем углу, чтобы копить очки",
  "cup.howTo.title": "Как набрать очки",
  "cup.howTo.body": "Побеждай ИИ на Сложном уровне — 1 победа = 1 очко в Кубке. Партия должна длиться минимум 8 ходов и 30 секунд.",
  "cup.btn.playForPrize": "Играть за приз",
  "cup.btn.subHint": "ИИ Сложный · 1 победа = 1 очко · мин. 8 ходов, 30 сек",
  "cup.btn.play": "Играть за приз →",
  "cup.btn.viewAll": "Все чемпионы →",

  // Champions page
  "champions.title": "Чемпионы Казахстана",
  "champions.subtitle": "Шесть легенд шахмат. Каждый держит один сезон Кубка.",
  "champions.back": "В меню",
  "champions.fide.label": "FIDE",
  "champions.born.label": "Год рождения",
  "champions.wiki": "Открыть в Википедии →",
  "champions.season.current": "Текущий сезон",
  "champions.season.upcoming": "Скоро",
  "champions.season.past": "Прошедший",
  "champions.about.title": "Как работает Кубок",
  "champions.about.body": "Каждый месяц сезон Кубка ведёт новый чемпион. Чтобы заработать очки — побеждай ИИ на Сложном уровне. Каждая такая победа даёт 1 очко. В конце месяца игрок с наибольшим количеством очков получает личное приглашение встретиться с чемпионом сезона. Формат, дата и место согласуются индивидуально.",
  "champions.points.title": "Очки за победу",
  "champions.points.hotseat": "Hot-seat",
  "champions.points.aiEasy": "ИИ · Лёгкий",
  "champions.points.aiMedium": "ИИ · Средний",
  "champions.points.aiHard": "ИИ · Сложный",
  "champions.points.aiHard.desc": "Победа над сильным ИИ (minimax + alpha-beta на полной глубине)",
  "champions.points.multi": "Мультиплеер",
  "champions.points.suffix": "очк.",
  "champions.points.antiFarm": "Партия должна длиться минимум 8 ходов и 30 секунд — защита от быстрых сдач и фарма.",
  "champions.points.excluded": "Hot-seat, ИИ Лёгкий/Средний и Мультиплеер очков не приносят — их слишком легко зафармить с другом.",
  "champions.standings.title": "Турнирная таблица",
  "champions.standings.empty": "В этом сезоне ещё не сыграно ни одной партии",
  "champions.standings.notConfigured": "Кубок активируется когда подключим базу данных.",
  "champions.standings.col.rank": "#",
  "champions.standings.col.player": "Игрок",
  "champions.standings.col.points": "Очки",
  "champions.standings.col.wins": "Победы",
  "champions.standings.you": "Ты",
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
  "menu.profile.menu": "Профиль мәзірі",
  "menu.profile.language": "Тіл",
  "menu.profile.identity": "Аты мен қала",
  "menu.profile.logout": "Шығу",
  "menu.profile.logout.confirm": "Шығып, осы құрылғыдан барлық профиль деректерін өшірейік пе (аты, Pro, тақырып, тіл)?",

  "menu.subtitle": "ЖИ-ні жең — Қазақстан чемпионымен кездес",
  "menu.subline": "Чемпиондар кубогы · 6 шахмат аңызы · Басты жүлде — жеке кездесу",
  "menu.continueSaved": "Сақталған ойынды жалғастыру",
  "menu.footer.made": "Қазақстанда жасалған",
  "menu.footer.incubator": "nFactorial Incubator үшін арнайы · 2026",
  "menu.footer.founder": "Құрылтайшы",

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

  "game.confirmSurrender": "Берілесің бе? Қарсыласың жеңіске жетеді.",
  "game.mode.ai": "ЖИ-ге қарсы · {level}",
  "game.mode.hotseat": "Достыңмен — бір экранда",
  "game.mode.online": "Онлайн",
  "game.opponent.ai": "ЖИ-қарсылас",
  "game.opponent.player2.blue": "2-ойыншы (көк)",
  "game.opponent.player1.blue": "1-ойыншы (көк)",
  "game.opponent.generic": "Қарсылас",
  "game.you": "Сен",
  "game.you.player1.gold": "1-ойыншы (алтын)",
  "game.you.player2.gold": "2-ойыншы (алтын)",
  "game.btn.menu": "Мәзірге",
  "game.btn.surrender": "Беріл",

  "sidebar.pieces": "{n} тас",
  "sidebar.aiThinking": "ЖИ ойлануда…",
  "sidebar.history": "Жүрістер тарихы",
  "sidebar.gameStarted": "Партия енді басталды",

  "chat.open": "Чатты ашу",
  "chat.withOpponent": "{name} — чат",
  "chat.empty": "Хабарламалар жоқ.",
  "chat.greet": "Қарсыласыңмен амандас 👋",
  "chat.stickers": "Стикерлер",
  "chat.placeholder": "Хабарлама…",
  "chat.send": "Жіберу",

  "end.error": "Қате",
  "end.title.draw": "Тең ойын!",
  "end.title.win": "Жеңіс!",
  "end.title.lose": "Жеңіліс",
  "end.subtitle.draw": "Екі тарап үшін лайықты партия",
  "end.subtitle.win": "Жеңіс сенімен!",
  "end.subtitle.lose": "Реванш?",
  "end.moves": "Жүріс",
  "end.time": "Уақыт",
  "end.savedTo": "Нәтиже рейтингке сақталды:",
  "end.cup.earned.title": "Чемпиондар кубогында +1 ұпай",
  "end.cup.earned.sub": "{season} маусымы — орныңды қара",
  "end.cup.tooShort": "Ұпай есептелмеді — партия тым қысқа (кемінде 8 жүріс, 30 сек).",
  "end.cup.playHard": "Кубокқа ұпай керек пе? ЖИ-мен Қиын деңгейде ойна.",
  "end.cup.needIdentity": "Кубок ұпайын жинау үшін атыңды енгіз.",
  "end.coach.title": "ЖИ-жаттықтырушының партия талдауы",
  "end.coach.thinking": "Жаттықтырушы ойлануда…",
  "end.coach.label": "ЖИ-жаттықтырушы",
  "end.coach.unavailable": "ЖИ-жаттықтырушы қолжетімсіз — API кілті жоқ.",
  "end.errorPrefix": "Қате:",
  "end.btn.menu": "Мәзірге",
  "end.btn.rematch": "Реванш",

  "mp.notConfigured.title": "Мультиплеер бапталмаған",
  "mp.notConfigured.body": "Онлайн ойындар үшін Supabase Realtime керек. Әкімші орнатуы тиіс.",
  "mp.alreadyFull.title": "Партия бос емес",
  "mp.alreadyFull.body": "Бұл бөлмеде екі ойыншы бар. Басты мәзірден өзіңнің партияңды жаса.",
  "mp.waiting.title": "Қарсыласты күтудеміз",
  "mp.waiting.body": "Сілтемені көшіріп, досыңа жібер — ол ашқан сәтте партия басталады.",
  "mp.copied": "Көшірілді",
  "mp.copy": "Көшіру",
  "mp.youPlay.gold": "Сен алтындармен ойнайсың (бірінші жүресің).",
  "mp.youPlay.blue": "Сен көктермен ойнайсың.",
  "mp.youPlay.unknown": "Сен ойнайсың …",
  "mp.cancel": "Бас тарту",
  "mp.mode": "Онлайн · мультиплеер",
  "mp.color.gold": "алтын",
  "mp.color.blue": "көк",
  "mp.opponentFallback": "қарсылас",
  "mp.you.withColor": "Сен ({color})",
  "mp.leave": "Шығу",
  "mp.surrender": "Беріл",
  "mp.identity.title": "Атыңды енгіз",
  "mp.identity.desc": "Қарсыласың сенің атыңды көреді. Содан кейін партия басталады.",
  "mp.identity.submit": "Бастау",

  "lb.menu": "Мәзірге",
  "lb.title": "Қалалар рейтингі",
  "lb.subtitle": "Қазақстанның үздік ойыншылары · нақты уақытта жаңарады",
  "lb.notReady": "Рейтинг Supabase қосылғанда іске қосылады.",
  "lb.worksNow": "Қазір жұмыс істейді:",
  "lb.loading": "Жүктелуде…",
  "lb.empty1": "Әзірге ешкім партия ойнаған жоқ.",
  "lb.empty2": "Qazaq Dama тарихындағы алғашқысы бол!",
  "lb.allKz": "Бүкіл Қазақстан",
  "lb.col.player": "Ойыншы",
  "lb.col.points": "Ұпай",
  "lb.col.wins": "Жеңіс",
  "lb.col.games": "Ойын",
  "lb.col.winPct": "Жеңіс %",
  "lb.cities.title": "Үздік қалалар",
  "lb.cities.stats": "{players} ойыншы · {wins} жеңіс",

  // Champions Cup
  "cup.title": "Чемпиондар кубогы",
  "cup.season.label": "Маусым",
  "cup.prize.label": "Маусымның басты жүлдесі",
  "cup.prize.meeting": "Маусым чемпионымен жеке кездесу",
  "cup.prize.disclaimer": "Көшбасшы шақыру алады. Пішімі, күні мен орны жеке келісіледі.",
  "cup.daysLeft": "Маусым аяқталуына: {n} күн",
  "cup.daysLeft.last": "Маусымның соңғы күні",
  "cup.leader.label": "Қазіргі көшбасшы",
  "cup.leader.empty": "Әзірге көшбасшы жоқ — бірінші бол!",
  "cup.leader.line": "{name} ({city}) · {points} ұпай",
  "cup.myStanding.label": "Сенің орның",
  "cup.myStanding.ranked": "{total} ішінен {rank}-орын · {points} ұпай",
  "cup.myStanding.unranked": "{points} ұпай · жоғарылау үшін жең",
  "cup.myStanding.empty": "Кубокқа кіру үшін ЖИ-мен Қиын деңгейде жең",
  "cup.identityRequired": "Кубок ұпайын жинау үшін жоғарыдағы профиль белгісінен атыңды енгіз",
  "cup.howTo.title": "Ұпайды қалай жинау",
  "cup.howTo.body": "ЖИ-мен Қиын деңгейде ойнап жең — 1 жеңіс = Кубокта 1 ұпай. Партия кемінде 8 жүріс және 30 секундке созылуы керек.",
  "cup.btn.playForPrize": "Жүлде үшін ойнау",
  "cup.btn.subHint": "ЖИ Қиын · 1 жеңіс = 1 ұпай · мин. 8 жүріс, 30 сек",
  "cup.btn.play": "Жүлде үшін ойнау →",
  "cup.btn.viewAll": "Барлық чемпиондар →",

  // Champions page
  "champions.title": "Қазақстан чемпиондары",
  "champions.subtitle": "Алты шахмат аңызы. Әрқайсысы Кубоктың бір маусымын алып жүреді.",
  "champions.back": "Мәзірге",
  "champions.fide.label": "FIDE",
  "champions.born.label": "Туған жылы",
  "champions.wiki": "Википедияда ашу →",
  "champions.season.current": "Ағымдағы маусым",
  "champions.season.upcoming": "Жақын арада",
  "champions.season.past": "Өткен",
  "champions.about.title": "Кубок қалай жұмыс істейді",
  "champions.about.body": "Әр айда Кубок маусымын жаңа чемпион басқарады. Ұпай жинау үшін ЖИ-мен Қиын деңгейде ойнап жең — әр жеңіс 1 ұпай береді. Ай соңында ең көп ұпай жинаған ойыншы сезон чемпионымен жеке кездесуге шақырылады. Пішімі, күні мен орны жеке келісіледі.",
  "champions.points.title": "Жеңіс үшін ұпай",
  "champions.points.hotseat": "Hot-seat",
  "champions.points.aiEasy": "ЖИ · Жеңіл",
  "champions.points.aiMedium": "ЖИ · Орташа",
  "champions.points.aiHard": "ЖИ · Қиын",
  "champions.points.aiHard.desc": "Күшті ЖИ-ні жең (minimax + alpha-beta толық тереңдікте)",
  "champions.points.multi": "Мультиплеер",
  "champions.points.suffix": "ұпай",
  "champions.points.antiFarm": "Партия кемінде 8 жүріс және 30 секундке созылуы керек — жылдам берілуден қорғаныс.",
  "champions.points.excluded": "Hot-seat, ЖИ Жеңіл/Орташа және Мультиплеер ұпай әкелмейді — досыңмен оңай фарм жасауға болады.",
  "champions.standings.title": "Маусым кестесі",
  "champions.standings.empty": "Бұл маусымда әлі партия ойналмады",
  "champions.standings.notConfigured": "Кубок дерекқор қосылғанда іске қосылады.",
  "champions.standings.col.rank": "#",
  "champions.standings.col.player": "Ойыншы",
  "champions.standings.col.points": "Ұпай",
  "champions.standings.col.wins": "Жеңіс",
  "champions.standings.you": "Сен",
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
  return (key: string, vars?: Record<string, string | number>): string => {
    let s = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return s;
  };
}
