import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getAllSessions } = await import('@/lib/supabase');
    const sessions = await getAllSessions();

    const completedSessions = sessions.filter((s: { status: string }) => s.status === 'completed');
    const scores = completedSessions.map((s: { overall_score: number }) => s.overall_score ?? 0);

    const totalInterviews = completedSessions.length;
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const scoreHistory = completedSessions.slice(0, 10).map((s: {
      completed_at: string;
      overall_score: number;
      job_role: string;
    }) => ({
      date: new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.overall_score ?? 0,
      role: s.job_role,
    }));

    return NextResponse.json({
      totalInterviews,
      averageScore,
      bestScore,
      improvementRate: 0,
      recentSessions: completedSessions.slice(0, 5),
      scoreHistory,
      weakAreas: [],
    });
  } catch {
    // Return mock data if Supabase isn't configured
    return NextResponse.json({
      totalInterviews: 0,
      averageScore: 0,
      bestScore: 0,
      improvementRate: 0,
      recentSessions: [],
      scoreHistory: [],
      weakAreas: [],
    });
  }
}
