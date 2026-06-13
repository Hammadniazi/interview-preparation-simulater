import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer } from '@/lib/gemini';
import { Difficulty, InterviewType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { question, answer, jobRole, difficulty, interviewType, questionIndex } = await req.json();

    if (!question || !answer || !jobRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!answer.trim() || answer.trim().length < 5) {
      return NextResponse.json({
        evaluation: {
          questionIndex: questionIndex ?? 0,
          question,
          answer,
          score: { technicalKnowledge: 0, communication: 0, relevance: 0, confidence: 0 },
          overallScore: 0,
          feedback: 'No answer was provided. Please provide a detailed response to receive proper evaluation.',
        },
      });
    }

    const evaluation = await evaluateAnswer(
      question,
      answer,
      jobRole,
      difficulty as Difficulty,
      interviewType as InterviewType
    );

    return NextResponse.json({ evaluation: { ...evaluation, questionIndex: questionIndex ?? 0 } });
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer. Please try again.' },
      { status: 500 }
    );
  }
}
