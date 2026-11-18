import { NextResponse, type NextRequest } from 'next/server';
import { generateInterviewQuestion } from '@/lib/ai';
import { badRequest, errorResponse, text } from '@/lib/api';
import { isDifficulty, isInterviewType, TOTAL_QUESTIONS } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const jobRole = text(body?.jobRole, 100);
  const { difficulty, interviewType } = body ?? {};
  const questionIndex = Number(body?.questionIndex ?? 0);
  const previousQuestions: string[] = Array.isArray(body?.previousQuestions)
    ? body.previousQuestions.filter((q: unknown) => typeof q === 'string').slice(0, TOTAL_QUESTIONS).map((q: string) => q.slice(0, 600))
    : [];

  if (!jobRole || !isDifficulty(difficulty) || !isInterviewType(interviewType)) {
    return badRequest('Missing or invalid interview settings.');
  }
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= TOTAL_QUESTIONS) {
    return badRequest('Invalid question index.');
  }

  try {
    const q = await generateInterviewQuestion(jobRole, difficulty, interviewType, questionIndex, previousQuestions);
    return NextResponse.json(q);
  } catch (err) {
    return errorResponse(err, 'generate the next question');
  }
}
