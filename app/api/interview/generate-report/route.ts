import { NextResponse, type NextRequest } from 'next/server';
import { generateFinalReport } from '@/lib/ai';
import { badRequest, errorResponse, readClientId, text } from '@/lib/api';
import { getReport, isDbConfigured, saveReport } from '@/lib/db';
import { isDifficulty, isInterviewType, TOTAL_QUESTIONS, type AnswerEvaluation, type InterviewReport } from '@/lib/types';
import { clampScore } from '@/lib/utils';

function sanitizeEvaluations(v: unknown): AnswerEvaluation[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > TOTAL_QUESTIONS) return null;
  return v.map((e, i) => ({
    questionIndex: Number.isInteger(e?.questionIndex) ? e.questionIndex : i,
    question: String(e?.question ?? '').slice(0, 800),
    answer: String(e?.answer ?? '').slice(0, 6000),
    feedback: String(e?.feedback ?? '').slice(0, 2000),
    overallScore: clampScore(e?.overallScore),
    score: {
      technicalKnowledge: clampScore(e?.score?.technicalKnowledge),
      communication: clampScore(e?.score?.communication),
      relevance: clampScore(e?.score?.relevance),
      confidence: clampScore(e?.score?.confidence),
    },
  }));
}

/** Generate the final report and (if Supabase is configured) persist it for this browser. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const sessionId = text(body?.sessionId, 64);
  const candidateName = text(body?.candidateName, 80) ?? 'Candidate';
  const jobRole = text(body?.jobRole, 100);
  const { difficulty, interviewType } = body ?? {};
  const evaluations = sanitizeEvaluations(body?.evaluations);

  if (!sessionId || !jobRole || !isDifficulty(difficulty) || !isInterviewType(interviewType) || !evaluations) {
    return badRequest('Invalid session data.');
  }

  try {
    const data = await generateFinalReport(candidateName, jobRole, difficulty, interviewType, evaluations);
    const report: InterviewReport = {
      ...data,
      sessionId,
      evaluations,
      completedAt: new Date().toISOString(),
    };

    let saved = false;
    const clientId = readClientId(req);
    if (clientId && isDbConfigured()) {
      try {
        await saveReport(clientId, report);
        saved = true;
      } catch (err) {
        console.error('[save report]', err);
      }
    }
    return NextResponse.json({ report, saved });
  } catch (err) {
    return errorResponse(err, 'generate your report');
  }
}

/** Fetch a saved report. Only returns reports owned by the calling browser. */
export async function GET(req: NextRequest) {
  const sessionId = text(req.nextUrl.searchParams.get('sessionId'), 64);
  const clientId = readClientId(req);
  if (!sessionId) return badRequest('Session id is required.');
  if (!clientId || !isDbConfigured()) {
    return NextResponse.json({ error: 'Report not found on this device.' }, { status: 404 });
  }
  try {
    const report = await getReport(clientId, sessionId);
    if (!report) return NextResponse.json({ error: 'Report not found on this device.' }, { status: 404 });
    return NextResponse.json({ report });
  } catch (err) {
    return errorResponse(err, 'load this report');
  }
}
