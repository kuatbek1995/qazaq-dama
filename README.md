# Qazaq Dama 🏔️

> **Шашки нового поколения. Қазақстаннан әлемге.**

3-минутные шашечные дуэли против ИИ, мультиплеер по ссылке, AI-тренер на русском и лидерборд городов Казахстана. Не «ещё один сайт для шашек» — а локальный продукт со своим стилем и своей нишей.

🚀 **Live demo:** [qazaq-dama.vercel.app](https://qazaq-dama.vercel.app)

---

## Что внутри

| Уровень из ТЗ | Реализовано |
|---|---|
| **Слабый** — статическая доска, фигуры двигаются | ✅ |
| **Средний** — полные правила (диагонали, обязательные взятия, дамка, multi-jump, длинная дамка по правилам русских шашек), hot-seat, сохранение в LocalStorage | ✅ |
| **Сильный** — AI с 3 уровнями (minimax + alpha-beta), история ходов, **3-минутный блиц-таймер**, тёмная тема, подсказки ходов, адаптив | ✅ |
| **Великий** — мультиплеер по ссылке (Supabase Realtime), AI-тренер на русском (Gemini), лидерборд городов Казахстана, ниша «Qazaq Dama Blitz», `Upgrade to Pro` | ✅ |

## Бизнес-логика

- **Ниша:** «3-минутные дуэли + AI-разбор + лидерборд городов» — целевая аудитория 18-35, KZ + диаспора.
- **Монетизация:** Pro $2/мес — эксклюзивные темы досок (Юрта, Степь, Тенгри), безлимитный AI-тренер, турниры.
- **Сетевой эффект:** мультиплеер по ссылке = каждая партия = +1 потенциальный пользователь.
- **Локальное позиционирование:** дизайн в национальной палитре (золото/синий), лидерборд по казахстанским городам.

## Стек

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript
- **Стиль:** Tailwind CSS v4 + кастомная казахстанская палитра
- **Анимация:** Framer Motion 12 + canvas-confetti
- **Бэкенд:** Supabase (Realtime channels для мультиплеера, Postgres для лидерборда)
- **AI:** Google Gemini Flash (бесплатный tier) для постматч-разбора
- **Деплой:** Vercel
- **Иконки:** Lucide React

## Локальный запуск

```bash
git clone https://github.com/kuatbek1995/qazaq-dama.git
cd qazaq-dama
npm install
cp .env.local.example .env.local
# Заполни env переменные (см. ниже)
npm run dev
```

## Переменные окружения

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
GEMINI_API_KEY=AIzaSy...
```

- **Supabase:** https://supabase.com/dashboard → создай проект → Settings → API.
- **Gemini:** https://aistudio.google.com/apikey → Create API key (бесплатно, без карты).

Без Supabase/Gemini приложение **работает** — просто мультиплеер и AI-коуч покажут «функция недоступна».

## Подготовка Supabase

После создания проекта в Supabase, открой **SQL Editor → New query**, вставь содержимое `supabase/schema.sql` и нажми **Run**. Это создаёт таблицу `scores` для лидерборда.

## Roadmap (v2)

- 🔐 Настоящая аутентификация (Supabase Auth — magic link)
- 📊 Рейтинговая система Эло
- 🏆 Турниры на 4-8 игроков
- 🎨 Покупка скинов через Stripe
- 🤖 AI с разными стилями игры («Степной волк», «Тенгри», «Дервиш»)
- 📱 PWA + офлайн-режим
- 🇰🇿 Казахская локализация
- 📺 Spectator mode + replays

## Структура

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Главная (меню + игра)
│   ├── leaderboard/page.tsx      # Лидерборд городов
│   ├── m/[matchId]/page.tsx      # Мультиплеер по ссылке
│   └── api/coach/route.ts        # Gemini proxy для AI-тренера
├── components/
│   ├── game/
│   │   ├── CheckersGame.tsx      # Главный оркестратор
│   │   ├── MultiplayerGame.tsx   # Реалтайм игра по ссылке
│   │   ├── Board.tsx             # Доска 8×8
│   │   ├── Piece.tsx             # Шашка с анимациями
│   │   ├── GameSidebar.tsx
│   │   ├── EndScreen.tsx         # Финал + AI-тренер + конфетти
│   │   └── Menu.tsx
│   ├── IdentityModal.tsx
│   ├── ProUpgradeModal.tsx
│   └── Leaderboard.tsx
├── lib/
│   ├── checkers/
│   │   ├── engine.ts             # Правила, валидация, multi-jump
│   │   ├── ai.ts                 # Minimax + alpha-beta
│   │   └── types.ts
│   ├── supabase.ts
│   ├── identity.ts
│   ├── scores.ts
│   └── utils.ts
└── supabase/schema.sql
```

## Лицензия

MIT
