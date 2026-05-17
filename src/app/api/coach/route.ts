import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Color, Move } from "@/lib/checkers/types";

export const runtime = "nodejs";

type Body = {
  history: Move[];
  winner: Color | "draw" | null;
  yourColor: Color;
  durationSec: number;
  locale?: "en" | "ru" | "kk";
};

const LOCALE_BRIEF: Record<"en" | "ru" | "kk", string> = {
  en: `Reply in ENGLISH. Output only plain English text — no Russian or Kazakh words. Tone: a friendly, slightly snarky checkers coach talking to a friend over tea.`,
  ru: `Отвечай НА РУССКОМ языке. Только русский текст. Тон: опытный, чуть язвительный шашечный тренер, говорящий с другом за чаем.`,
  kk: `Жауапты ҚАЗАҚ тілінде бер. Тек қазақша мәтін. Стиль: тәжірибелі, сәл әзілшіл дойбы жаттықтырушысы досымен шай үстінде сөйлесіп отырғандай.`,
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
  const locale = body.locale === "en" || body.locale === "kk" || body.locale === "ru" ? body.locale : "ru";
  if (!Array.isArray(history)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (history.length > 200) {
    return NextResponse.json({ error: "History too long for analysis" }, { status: 400 });
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

  const prompt = `You are a checkers coach analysing a finished game of RUSSIAN CHECKERS (8x8 board, mandatory captures, flying king).

GAME:
- Player played ${yourColor === "white" ? "gold (bottom side)" : "blue (top side)"}
- Duration: ${Math.floor(durationSec / 60)} min ${durationSec % 60} sec
- Outcome: ${outcome}
- Total moves: ${history.length}
- Captures made: ${captureCount}
- Kings crowned: ${kingCount}
${isShort ? "- IMPORTANT: the game is very short, not much happened — don't pretend to do a deep analysis, say it honestly." : ""}

MOVES (notation: 1.a3-b4 = move from a3 to b4, 1.a3:c5 = capture):
${movesText}

OUTPUT REQUIREMENTS:
- NO headers, numbering, or bullet markers — flowing conversational prose only
- DO NOT repeat the numbers (time, outcome, move count) — player already sees them above
- Vary the structure every time — do not follow a "style → best move → worst move → advice" template
- Reference SPECIFIC moves by number (e.g., "on move five...")
- No filler, no "general checkers principles" — only what YOU see in THIS game
- Pick tone based on situation: lost quickly = friendly jab; long and skillful = sincere praise; silly blunder = kind nose-tap
- Length: 3-5 short paragraphs, max 180 words
- NO markdown (no **, _, #, *)

${LOCALE_BRIEF[locale]}`;

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
