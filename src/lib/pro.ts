const PRO_KEY = "qazaq-dama:pro-v1";
const THEME_KEY = "qazaq-dama:board-theme-v1";

export type ProStatus = {
  email: string;
  since: string;
  sessionId: string;
};

export type BoardTheme = "classic" | "yurta" | "steppe" | "tengri";

export const THEMES: { id: BoardTheme; name: string; subtitle: string; pro: boolean }[] = [
  { id: "classic", name: "Классика", subtitle: "Тёмно-синяя ночь", pro: false },
  { id: "yurta", name: "Юрта", subtitle: "Тёплая терракотовая пустыня", pro: true },
  { id: "steppe", name: "Степь", subtitle: "Изумрудная равнина", pro: true },
  { id: "tengri", name: "Тенгри", subtitle: "Космическая лазурь", pro: true },
];

export function loadProStatus(): ProStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PRO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProStatus;
    if (!parsed?.email || !parsed?.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProStatus(status: ProStatus): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRO_KEY, JSON.stringify(status));
  } catch {
    // ignore quota
  }
}

export function isPro(): boolean {
  return loadProStatus() !== null;
}

export function loadTheme(): BoardTheme {
  if (typeof window === "undefined") return "classic";
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === "yurta" || raw === "steppe" || raw === "tengri" || raw === "classic") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "classic";
}

export function saveTheme(theme: BoardTheme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch {
    // ignore
  }
}

export function applyTheme(theme: BoardTheme): void {
  if (typeof document === "undefined") return;
  if (theme === "classic") {
    delete document.documentElement.dataset.boardTheme;
  } else {
    document.documentElement.dataset.boardTheme = theme;
  }
}
