import type { Locale } from "./i18n";

export type LocalizedString = Record<Locale, string>;

export type Champion = {
  id: string;
  name: LocalizedString;
  title: LocalizedString;
  achievement: LocalizedString;
  bio: LocalizedString;
  bornYear: number;
  fideRating: number;
  photo: string | null;
  wikipediaUrl: string;
};

// Ordered list — rotation seasons start in May 2026 and cycle through this list.
// Each champion holds "Champion of the Season" status for one calendar month,
// then the cup rolls to the next champion.
//
// Adding a new champion? Append to the end — rotation handles the rest.
//
// Photos: stored in /public/champions/. Sourced from Wikimedia Commons under
// their respective free licenses. See /public/champions/CREDITS.md for attribution.
// `photo: null` → UI falls back to a stylized initials avatar.

export const CHAMPIONS: Champion[] = [
  {
    id: "bibisara",
    name: {
      en: "Bibisara Assaubayeva",
      ru: "Бибисара Асаубаева",
      kk: "Бибісара Асаубаева",
    },
    title: {
      en: "Three-time Women's World Blitz Champion",
      ru: "Трёхкратная чемпионка мира по блицу среди женщин",
      kk: "Әйелдер арасындағы блиц бойынша үш дүркін әлем чемпионы",
    },
    achievement: {
      en: "World Blitz Champion 2021, 2022, 2025",
      ru: "Чемпионка мира по блицу: 2021, 2022, 2025",
      kk: "Блиц бойынша әлем чемпионы: 2021, 2022, 2025",
    },
    bio: {
      en: "Born 2004 in Almaty. Earned the Grandmaster title in 2025 and finished second at the Women's Candidates Tournament 2026. One of the most recognised young athletes in Kazakhstan.",
      ru: "Родилась в 2004 году в Алматы. Получила титул гроссмейстера в 2025 году, заняла второе место на Турнире претенденток 2026. Одна из самых узнаваемых молодых спортсменок Казахстана.",
      kk: "2004 жылы Алматыда туған. 2025 жылы гроссмейстер атағын алды, 2026 жылы үміткерлер турнирінде екінші орынды иеленді. Қазақстанның ең танымал жас спортшыларының бірі.",
    },
    bornYear: 2004,
    fideRating: 2527,
    photo: "/champions/bibisara.jpg",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bibisara_Assaubayeva",
  },
  {
    id: "zhansaya",
    name: {
      en: "Zhansaya Abdumalik",
      ru: "Жансая Абдумалик",
      kk: "Жансая Әбдімәлік",
    },
    title: {
      en: "First Kazakh woman Grandmaster",
      ru: "Первая казахстанская женщина-гроссмейстер",
      kk: "Қазақстаннан шыққан тұңғыш әйел гроссмейстер",
    },
    achievement: {
      en: "Grandmaster (2021) · Asian Champion",
      ru: "Гроссмейстер (2021) · Чемпионка Азии",
      kk: "Гроссмейстер (2021) · Азия чемпионы",
    },
    bio: {
      en: "Born 2000. The first woman from Kazakhstan and Central Asia to earn the full Grandmaster title (2021). Peaked at world No. 11 among female players.",
      ru: "Родилась в 2000 году. Первая женщина из Казахстана и Центральной Азии, получившая титул гроссмейстера (2021). Поднималась до 11-й строчки мирового женского рейтинга.",
      kk: "2000 жылы туған. Қазақстан мен Орталық Азиядан шыққан гроссмейстер атағын алған тұңғыш әйел (2021). Әйелдер арасындағы әлемдік рейтингте 11-орынға дейін көтерілген.",
    },
    bornYear: 2000,
    fideRating: 2468,
    photo: "/champions/zhansaya.jpg",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Zhansaya_Abdumalik",
  },
  {
    id: "dinara",
    name: {
      en: "Dinara Saduakassova",
      ru: "Динара Садуакасова",
      kk: "Динара Сәдуақасова",
    },
    title: {
      en: "Two-time World Youth Champion",
      ru: "Двукратная чемпионка мира среди юниоров",
      kk: "Жасөспірімдер арасындағы екі дүркін әлем чемпионы",
    },
    achievement: {
      en: "World Junior Girls Champion 2016",
      ru: "Чемпионка мира среди девушек до 20 лет (2016)",
      kk: "20 жасқа дейінгі қыздар арасындағы әлем чемпионы (2016)",
    },
    bio: {
      en: "Born 1996. Won the World Youth Chess Championship twice and the World Junior Girls Championship 2016. Was the youngest player at the 2012 Olympiad, earning the Woman Grandmaster title at fifteen.",
      ru: "Родилась в 1996 году. Двукратная чемпионка мира среди юниоров и победительница чемпионата мира среди девушек до 20 лет 2016 года. Самая молодая участница Олимпиады-2012, получившая титул женского гроссмейстера в 15 лет.",
      kk: "1996 жылы туған. Жасөспірімдер арасындағы әлем чемпионатын екі рет жеңіп, 2016 жылы 20 жасқа дейінгі қыздар арасындағы әлем чемпионы атанды. 2012 жылғы Олимпиаданың ең жас қатысушысы болып, 15 жасында әйелдер гроссмейстері атағын алды.",
    },
    bornYear: 1996,
    fideRating: 2435,
    photo: "/champions/dinara.jpg",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Dinara_Saduakassova",
  },
  {
    id: "darmen",
    name: {
      en: "Darmen Sadvakasov",
      ru: "Дармен Садвакасов",
      kk: "Дәрмен Сәдуақасов",
    },
    title: {
      en: "Five-time National Champion of Kazakhstan",
      ru: "Пятикратный чемпион Казахстана",
      kk: "Қазақстанның бес дүркін чемпионы",
    },
    achievement: {
      en: "World Junior Champion 1998 · Grandmaster",
      ru: "Чемпион мира среди юниоров (1998) · Гроссмейстер",
      kk: "Жасөспірімдер арасындағы әлем чемпионы (1998) · Гроссмейстер",
    },
    bio: {
      en: "Born 1979 in Almaty. Won the World Junior Championship in 1998, earning the Grandmaster title. Five-time Kazakhstan national champion (2001, 2003, 2004, 2006, 2007) with notable wins against Korchnoi and Karpov.",
      ru: "Родился в 1979 году в Алматы. Победитель чемпионата мира среди юниоров 1998 года, получивший титул гроссмейстера. Пятикратный чемпион Казахстана (2001, 2003, 2004, 2006, 2007), обыграл Корчного и Карпова.",
      kk: "1979 жылы Алматыда туған. 1998 жылы жасөспірімдер арасындағы әлем чемпионатын жеңіп, гроссмейстер атағын алды. Қазақстанның бес дүркін чемпионы (2001, 2003, 2004, 2006, 2007), Корчной мен Карповты жеңген.",
    },
    bornYear: 1979,
    fideRating: 2629,
    photo: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/Darmen_Sadvakasov",
  },
  {
    id: "murtas",
    name: {
      en: "Murtas Kazhgaleyev",
      ru: "Муртас Кажгалеев",
      kk: "Мұртас Қажғалиев",
    },
    title: {
      en: "Asian Games Rapid Champion",
      ru: "Чемпион Азиатских игр по быстрым шахматам",
      kk: "Азия ойындарының жедел шахматтан чемпионы",
    },
    achievement: {
      en: "Asian Games rapid gold 2006 · Grandmaster",
      ru: "Золото Азиатских игр в рапиде 2006 · Гроссмейстер",
      kk: "2006 жылғы Азия ойындарының жедел шахматтағы алтын жүлдегері",
    },
    bio: {
      en: "Born 1973. Earned the Grandmaster title in 1998. Won the men's individual rapid tournament at the 2006 Asian Games in Doha and the Paris City Chess Championship twice (2006, 2009).",
      ru: "Родился в 1973 году. Получил титул гроссмейстера в 1998 году. Победил в индивидуальном рапиде на Азиатских играх 2006 года в Дохе и дважды выигрывал Чемпионат Парижа (2006, 2009).",
      kk: "1973 жылы туған. 1998 жылы гроссмейстер атағын алды. 2006 жылы Дохада өткен Азия ойындарының жедел шахматтан жеке чемпионы атанып, Париж чемпионатын екі рет жеңіп алды (2006, 2009).",
    },
    bornYear: 1973,
    fideRating: 2518,
    photo: "/champions/murtas.jpg",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Murtas_Kazhgaleyev",
  },
  {
    id: "rinat",
    name: {
      en: "Rinat Jumabayev",
      ru: "Ринат Жумабаев",
      kk: "Ринат Жұмабаев",
    },
    title: {
      en: "Kazakhstan Champion · World Cup contender",
      ru: "Чемпион Казахстана · Участник Кубка мира",
      kk: "Қазақстан чемпионы · Әлем кубогының қатысушысы",
    },
    achievement: {
      en: "Defeated world #2 Caruana at the 2021 World Cup",
      ru: "Победил Каруану (тогда №2 в мире) на Кубке мира 2021",
      kk: "2021 жылғы Әлем кубогында әлемнің 2-нөмірі Каруананы жеңді",
    },
    bio: {
      en: "Born 1989. Kazakhstan Chess Champion 2014. Famously defeated Fabiano Caruana — then world No. 2 — at the 2021 Chess World Cup. Won the Open Master Tournament at Biel International Chess Festival 2024.",
      ru: "Родился в 1989 году. Чемпион Казахстана 2014 года. Прославился победой над Фабиано Каруаной (тогда №2 в мире) на Кубке мира 2021. Выиграл Open Master Tournament на Биельском фестивале в 2024.",
      kk: "1989 жылы туған. 2014 жылғы Қазақстан чемпионы. 2021 жылғы Әлем кубогында әлемнің 2-нөмірі Фабиано Каруананы жеңіп даңқ қазанды. 2024 жылы Биель халықаралық шахмат фестивалінде Open Master турнирін жеңіп алды.",
    },
    bornYear: 1989,
    fideRating: 2542,
    photo: "/champions/rinat.jpg",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Rinat_Jumabayev",
  },
];

// Season anchor: May 2026 (cup launches with Bibisara).
// Each season = one calendar month. Index cycles through CHAMPIONS.
const SEASON_ANCHOR_YEAR = 2026;
const SEASON_ANCHOR_MONTH = 5; // 1-indexed

/**
 * Returns the current season identifier in YYYY-MM form,
 * e.g. "2026-05". Derived from the local clock.
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return `${y}-${m.toString().padStart(2, "0")}`;
}

/**
 * Parses a YYYY-MM season identifier and returns the champion holding that season.
 */
export function getChampionForSeason(season: string): Champion {
  const [yStr, mStr] = season.split("-");
  const y = Number.parseInt(yStr, 10);
  const m = Number.parseInt(mStr, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return CHAMPIONS[0];
  const monthsFromAnchor =
    (y - SEASON_ANCHOR_YEAR) * 12 + (m - SEASON_ANCHOR_MONTH);
  const idx = ((monthsFromAnchor % CHAMPIONS.length) + CHAMPIONS.length) % CHAMPIONS.length;
  return CHAMPIONS[idx];
}

/**
 * Convenience: champion holding the current season.
 */
export function getCurrentChampion(): Champion {
  return getChampionForSeason(getCurrentSeason());
}

/**
 * Returns days remaining in the current season (until end of current month, local time).
 */
export function daysLeftInSeason(): number {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const msLeft = endOfMonth.getTime() - now.getTime();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

/**
 * Human-readable season label per locale, e.g. "May 2026" / "Май 2026" / "Мамыр 2026".
 */
export function formatSeason(season: string, locale: Locale): string {
  const [yStr, mStr] = season.split("-");
  const m = Number.parseInt(mStr, 10);
  if (!Number.isFinite(m) || m < 1 || m > 12) return season;
  const months: Record<Locale, string[]> = {
    en: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    ru: [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
    ],
    kk: [
      "Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым",
      "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан",
    ],
  };
  return `${months[locale][m - 1]} ${yStr}`;
}
