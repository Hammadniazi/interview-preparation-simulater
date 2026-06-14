import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestion } from '@/lib/gemini';
import { Difficulty, InterviewType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { jobRole, difficulty, interviewType, questionIndex, previousQuestions } = await req.json();

    if (!jobRole || !difficulty || !interviewType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const generated = await generateInterviewQuestion(
      jobRole,
      difficulty as Difficulty,
      interviewType as InterviewType,
      questionIndex ?? 0,
      previousQuestions ?? []
    );

    return NextResponse.json(generated);
  } catch (error) {
    console.error('Error generating question:', error);
    const message = String(error);
    if (message.includes('429') || message.includes('rate_limit')) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (message.includes('401') || message.includes('api_key') || message.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your GROQ_API_KEY in .env.local' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to generate question. Please check your GROQ_API_KEY in .env.local' },
      { status: 500 }
    );
  }
}
