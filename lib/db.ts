/**
 * Supabase persistence — SERVER ONLY.
 *
 * Uses the service-role key, so it must never be imported from a client
 * component. Row-level security on the table blocks the public anon key
 * entirely; every read/write is scoped to the caller's anonymous client id.
 *
 * If Supabase is not configured the app still works: history falls back
 * to the browser (see lib/history.ts).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { InterviewReport, SessionSummary } from './types';
import { isDifficulty, isInterviewType } from './types';

let client: SupabaseClient | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function db(): SupabaseClient {
  if (typeof window !== 'undefined') throw new Error('lib/db must only be used on the server');
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const TABLE = 'interview_sessions';

export async function saveReport(clientId: string, report: InterviewReport): Promise<void> {
  const { error } = await db()
    .from(TABLE)
    .upsert({
      id: report.sessionId,
      client_id: clientId,
      candidate_name: report.candidateName,
      job_role: report.jobRole,
      difficulty: report.difficulty,
      interview_type: report.interviewType,
      overall_score: report.overallScore,
      status: 'completed',
      report,
      completed_at: report.completedAt,
    });
  if (error) throw error;
}

export async function getReport(clientId: string, sessionId: string): Promise<InterviewReport | null> {
  const { data, error } = await db()
    .from(TABLE)
    .select('report')
    .eq('id', sessionId)
    .eq('client_id', clientId)
    .maybeSingle();
  if (error) throw error;
  return (data?.report as InterviewReport | undefined) ?? null;
}

interface Row {
  id: string;
  candidate_name: string;
  job_role: string;
  difficulty: string;
  interview_type: string;
  overall_score: number | null;
  completed_at: string;
  scoreBreakdown: SessionSummary['scoreBreakdown'];
}

export async function listSessions(clientId: string, limit = 50): Promise<SessionSummary[]> {
  const { data, error } = await db()
    .from(TABLE)
    .select('id, candidate_name, job_role, difficulty, interview_type, overall_score, completed_at, scoreBreakdown:report->scoreBreakdown')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    candidateName: r.candidate_name,
    jobRole: r.job_role,
    difficulty: isDifficulty(r.difficulty) ? r.difficulty : 'intermediate',
    interviewType: isInterviewType(r.interview_type) ? r.interview_type : 'technical',
    overallScore: r.overall_score ?? 0,
    scoreBreakdown: r.scoreBreakdown ?? null,
    completedAt: r.completed_at,
  }));
}
