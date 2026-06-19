import { createClient } from '@supabase/supabase-js';
import { InterviewSession } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interview Sessions
export async function saveInterviewSession(session: InterviewSession) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllSessions() {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}


export const supabaseSchema = `
-- Run this in your Supabase SQL editor
-- Drop old table if it exists with wrong columns
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

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth required for this app)
CREATE POLICY "Allow all" ON interview_sessions FOR ALL USING (true) WITH CHECK (true);
`;
