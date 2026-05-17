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
  if (history.length > 200) {
    return NextResponse.json({ error: "Слишком длинная партия для анализа" }, { status: 400 });
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

  const captureCount = history.reduce((sum, m) => sum + (m.captures?.length ?? 0), 0);
  const kingCount = history.filter((m) => m.becomesKing).length;
  const isShort = history.length < 8;

  const prompt = `Ты — опытный, чуть язвительный шашечный тренер. Только что закончилась партия в РУССКИЕ ШАШКИ (8х8, обязательные взятия, длинная дамка). Разбери её ЖИВО, как будто говоришь с другом за чаем.

ПАРТИЯ:
- Игрок играл ${yourColor === "white" ? "золотыми (снизу)" : "синими (сверху)"}
- Длительность: ${Math.floor(durationSec / 60)} мин ${durationSec % 60} сек
- Исход: ${outcome}
- Всего ходов: ${history.length}
- Взятий совершено: ${captureCount}
- Дамок появилось: ${kingCount}
${isShort ? "- ВАЖНО: партия очень короткая, многого не успело произойти — не натягивай глубокий анализ, скажи это честно" : ""}

ХОДЫ (нотация: 1.a3-b4 = ход с a3 на b4, 1.a3:c5 = взятие):
${movesText}

ТРЕБОВАНИЯ К ОТВЕТУ:
- НИКАКИХ заголовков, нумерации, маркеров — только живая разговорная речь
- НЕ повторяй цифры (время, исход, число ходов) — игрок их уже видел сверху
- Структуру меняй каждый раз — не следуй шаблону «стиль → лучший ход → худший ход → совет»
- Ссылайся на КОНКРЕТНЫЕ ходы партии по номеру (например, «на пятом ходу...»)
- Без воды, без «общих принципов шашек» — только то что видишь в ЭТОЙ партии
- Тон выбери под ситуацию: коротко проиграл = бодро подколи; долго и грамотно = искренне похвали; глупая ошибка = по-доброму ткни носом
- Длина: 3-5 коротких абзацев, не больше 180 слов
- БЕЗ markdown (никаких **, _, #, *)`;

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { temperature: 1.0, topP: 0.95 },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ analysis: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: `Gemini error: ${message}` }, { status: 500 });
  }
}
