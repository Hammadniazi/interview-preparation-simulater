import { NextRequest, NextResponse } from 'next/server';
import { generateFinalReport } from '@/lib/gemini';
import { InterviewSession, InterviewReport } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { session } = await req.json() as { session: InterviewSession };

    if (!session || !session.evaluations || session.evaluations.length === 0) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
    }

    const reportData = await generateFinalReport(
      session.candidateName,
      session.jobRole,
      session.difficulty,
      session.interviewType,
      session.evaluations
    );

    const report: InterviewReport = {
      ...reportData,
      sessionId: session.id,
      evaluations: session.evaluations,
      completedAt: session.completedAt ?? new Date(),
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Report not found' }, { status: 404 });
}
