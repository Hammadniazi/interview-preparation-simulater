import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestion } from '@/lib/gemini';
import { Difficulty, InterviewType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { jobRole, difficulty, interviewType, questionIndex, previousQuestions } = await req.json();

    if (!jobRole || !difficulty || !interviewType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const question = await generateInterviewQuestion(
      jobRole,
      difficulty as Difficulty,
      interviewType as InterviewType,
      questionIndex ?? 0,
      previousQuestions ?? []
    );

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: 'Failed to generate question. Please check your API key.' },
      { status: 500 }
    );
  }
}
