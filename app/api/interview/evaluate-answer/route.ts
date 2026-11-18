import { NextResponse, type NextRequest } from 'next/server';
import { evaluateAnswer, evaluateMcq } from '@/lib/ai';
import { badRequest, errorResponse, text } from '@/lib/api';
import { isDifficulty, isInterviewType } from '@/lib/types';

const MIN_ANSWER_CHARS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = text(body?.question, 800);
  const jobRole = text(body?.jobRole, 100);
  const { difficulty, interviewType, mcq } = body ?? {};
  const questionIndex = Number(body?.questionIndex ?? 0);

  if (!question || !jobRole || !isDifficulty(difficulty) || !isInterviewType(interviewType)) {
    return badRequest('Missing or invalid fields.');
  }

  try {
    // Multiple choice (beginner)
    if (mcq) {
      const options: unknown = mcq.options;
      const correctIndex = Number(mcq.correctIndex);
      const selectedIndex = Number(mcq.selectedIndex);
      const valid =
        Array.isArray(options) &&
        options.length === 4 &&
        options.every((o) => typeof o === 'string') &&
        [correctIndex, selectedIndex].every((n) => Number.isInteger(n) && n >= 0 && n < 4);
      if (!valid) return badRequest('Invalid multiple-choice answer.');
      const evaluation = await evaluateMcq(question, options as string[], correctIndex, selectedIndex, jobRole);
      return NextResponse.json({ evaluation: { ...evaluation, questionIndex } });
    }

    // Open answer
    const answer = text(body?.answer, 6000);
    if (!answer) return badRequest('Write an answer before submitting.');
    if (answer.length < MIN_ANSWER_CHARS) {
      return NextResponse.json({
        evaluation: {
          questionIndex,
          question,
          answer,
          score: { technicalKnowledge: 0, communication: 0, relevance: 0, confidence: 0 },
          overallScore: 0,
          feedback: 'That answer was too short to evaluate. Aim for a few sentences with a concrete example.',
        },
      });
    }
    const evaluation = await evaluateAnswer(question, answer, jobRole, difficulty, interviewType);
    return NextResponse.json({ evaluation: { ...evaluation, questionIndex } });
  } catch (err) {
    return errorResponse(err, 'evaluate your answer');
  }
}
