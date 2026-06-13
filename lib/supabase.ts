import { createClient } from '@supabase/supabase-js';
import { InterviewSession, InterviewReport } from './types';

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
      status: session.status,
      current_question_index: session.currentQuestionIndex,
      questions: session.questions,
      messages: session.messages,
      evaluations: session.evaluations,
      started_at: session.startedAt,
      completed_at: session.completedAt,
      overall_score: session.overallScore,
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

// Interview Reports
export async function saveInterviewReport(report: InterviewReport) {
  const { data, error } = await supabase
    .from('interview_reports')
    .upsert({
      session_id: report.sessionId,
      candidate_name: report.candidateName,
      job_role: report.jobRole,
      difficulty: report.difficulty,
      interview_type: report.interviewType,
      overall_score: report.overallScore,
      score_breakdown: report.scoreBreakdown,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      skill_gaps: report.skillGaps,
      recommendations: report.recommendations,
      learning_roadmap: report.learningRoadmap,
      evaluations: report.evaluations,
      completed_at: report.completedAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInterviewReport(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_reports')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export const supabaseSchema = `
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS interview_sessions (
  id TEXT PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  job_role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_question_index INTEGER DEFAULT 0,
  questions JSONB DEFAULT '[]',
  messages JSONB DEFAULT '[]',
  evaluations JSONB DEFAULT '[]',
  overall_score NUMERIC,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES interview_sessions(id),
  candidate_name TEXT NOT NULL,
  job_role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  overall_score NUMERIC NOT NULL,
  score_breakdown JSONB NOT NULL,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  skill_gaps JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  learning_roadmap JSONB DEFAULT '[]',
  evaluations JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (optional for demo)
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_reports ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (configure auth policies for production)
CREATE POLICY "Allow all" ON interview_sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON interview_reports FOR ALL USING (true);
`;
