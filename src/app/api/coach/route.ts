import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Color, Move } from "@/lib/checkers/types";

export const runtime = "nodejs";

type Body = {
  history: Move[];
  winner: Color | "draw" | null;
  yourColor: Color;
  durationSec: number;
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI Coach не настроен — нет GEMINI_API_KEY" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { history, winner, yourColor, durationSec } = body;
  if (!Array.isArray(history)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const movesText = history
    .map((m, i) => {
      const from = `${String.fromCharCode(97 + m.from.c)}${8 - m.from.r}`;
      const to = `${String.fromCharCode(97 + m.to.c)}${8 - m.to.r}`;
      const sep = m.captures.length > 0 ? ":" : "-";
      const crown = m.becomesKing ? " (стал дамкой)" : "";
      const player = i % 2 === 0 ? "Золотые" : "Синие";
      return `${i + 1}. ${player}: ${from}${sep}${to}${crown}`;
    })
    .join("\n");

  const outcome =
    winner === "draw"
      ? "ничья"
      : winner === yourColor
      ? "пользователь выиграл"
      : "пользователь проиграл";

  const prompt = `Ты — личный шашечный тренер. Проанализируй партию в РУССКИЕ ШАШКИ (8х8, обязательные взятия, длинная дамка).

ПАРТИЯ:
Пользователь играл ${yourColor === "white" ? "золотыми" : "синими"}.
Длительность: ${Math.floor(durationSec / 60)} мин ${durationSec % 60} сек.
Исход: ${outcome}.
Ходов: ${history.length}.

ХОДЫ:
${movesText}

ЗАДАЧА:
Напиши КОРОТКИЙ разбор (2-4 абзаца, итого не более 200 слов) на русском. Включи:
1. Общая оценка партии и стиль игрока
2. Лучший момент пользователя (укажи ход номер N)
3. Худшая ошибка пользователя (укажи ход номер N и что нужно было сделать)
4. Конкретный совет на следующую партию

Тон — дружелюбный наставник. Без воды и общих фраз. БЕЗ markdown-разметки (без * и #).`;

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ analysis: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: `Gemini error: ${message}` }, { status: 500 });
  }
}
