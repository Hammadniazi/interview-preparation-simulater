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

    // Try to save to Supabase (non-blocking, graceful fallback)
    try {
      const { saveInterviewSession, saveInterviewReport } = await import('@/lib/supabase');
      await saveInterviewSession(session);
      await saveInterviewReport(report);
    } catch (dbError) {
      console.warn('Supabase save failed (continuing without persistence):', dbError);
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const { getInterviewReport } = await import('@/lib/supabase');
    const report = await getInterviewReport(sessionId);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }
}
