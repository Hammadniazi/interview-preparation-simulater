# InterviewAI

Mock interviews with honest, specific feedback. Pick a role and level, answer ten questions (typed or spoken),
and get scores on every answer plus a debrief and a four-week study plan.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix primitives · Framer Motion ·
Recharts · Groq (gpt-oss-120b by default, configurable) · Supabase (optional) · jsPDF

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add GROQ_API_KEY
npm run dev
```

Open http://localhost:3000.

### Optional: Supabase

1. Create a project and run `supabase/schema.sql` in the SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Without Supabase, everything still works and history is kept in the browser.

## How it fits together

```
app/
  page.tsx                     landing
  interview/setup              session configuration
  interview/[sessionId]        live interview (client-only; resumes after refresh)
  report/[sessionId]           debrief: summary, per-answer review, plan, PDF export
  dashboard                    history for this browser
  resume                       resume → likely questions
  api/
    interview/generate-question
    interview/evaluate-answer  (MCQ scored deterministically; open answers by the model)
    interview/generate-report  POST: generate + persist · GET: fetch own report
    sessions                   history for the calling browser
    resume/analyze
lib/
  ai.ts        every LLM call: JSON mode, validation/coercion, prompt-injection fencing
  db.ts        Supabase (server-only, service role, scoped by client id)
  history.ts   anonymous client id, fetch wrapper, local report cache
  api.ts       route helpers: error mapping, input limits
hooks/
  useInterview.ts          reducer state machine with per-step retry
  useSpeechRecognition.ts  Web Speech API voice input
```

### Privacy model

No accounts. Each browser gets a random id stored in `localStorage`. The API only returns rows that match it,
and the table's row-level security blocks the public anon key completely.

## Design

"Paper & Ink": warm paper, near-black ink, and one deep-green accent. Instrument Serif for display type and
Hanken Grotesk for text. Score colours (green / ochre / brick) always come with a number and a label. Motion is
one shared ease-out curve, short durations, and respects `prefers-reduced-motion`. Tokens live in
`app/globals.css`.
