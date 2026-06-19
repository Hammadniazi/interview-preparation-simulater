import { createClient } from '@supabase/supabase-js';
import { InterviewSession } from './types';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

export async function saveInterviewSession(session: InterviewSession) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getSupabase() as any)
    .from('interview_sessions')
    .upsert({
      id: session.id,
      candidate_name: session.candidateName,
      job_role: session.jobRole,
      difficulty: session.difficulty,
      interview_type: session.interviewType,
      overall_score: session.overallScore ?? 0,
      status: 'completed',
      completed_at: session.completedAt ?? new Date(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInterviewSession(sessionId: string) {
  const { data, error } = await getSupabase()
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllSessions() {
  const { data, error } = await getSupabase()
    .from('interview_sessions')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export const supabaseSchema = `
-- Run this in your Supabase SQL editor
DROP TABLE IF EXISTS interview_sessions CASCADE;

CREATE TABLE interview_sessions (
  id TEXT PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  job_role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON interview_sessions FOR ALL USING (true) WITH CHECK (true);
`;
