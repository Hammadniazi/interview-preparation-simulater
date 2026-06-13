# InterviewAI — AI-Powered Interview Preparation Simulator

A production-quality SaaS application built with Next.js 16, Gemini AI, and Supabase.

## Features

- **AI Interview Simulator** — 10 dynamically generated questions per session
- **Real-Time Scoring** — 4-dimension evaluation (Technical, Communication, Relevance, Confidence)
- **Detailed Reports** — Strengths, weaknesses, skill gaps, recommendations
- **30-Day Learning Roadmap** — Personalized improvement plan
- **Resume Analysis** — Upload CV to get tailored questions
- **Dashboard Analytics** — Score trends and performance tracking
- **PDF Export** — Download your interview report
- **Dark/Light Mode** — Fully themed UI

## Quick Start

### 1. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your keys (see below).

### 2. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key" → Create key → Copy it

### 3. Run Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
