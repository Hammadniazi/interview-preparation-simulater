-- InterviewAI — Supabase schema
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Security model: there are no user accounts. Each browser has a random
-- anonymous id (client_id). All reads/writes go through Next.js API routes
-- using the SERVICE ROLE key, which bypasses RLS. RLS is enabled with NO
-- policies, so the public anon key can read or write nothing.

CREATE TABLE IF NOT EXISTS interview_sessions (
  id             TEXT PRIMARY KEY,
  client_id      TEXT,
  candidate_name TEXT NOT NULL,
  job_role       TEXT NOT NULL,
  difficulty     TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  overall_score  INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'completed',
  report         JSONB,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration for the earlier version of this table.
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS report JSONB;

CREATE INDEX IF NOT EXISTS interview_sessions_client_completed_idx
  ON interview_sessions (client_id, completed_at DESC);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Remove the old world-readable/writable policy.
DROP POLICY IF EXISTS "Allow all" ON interview_sessions;

-- Optional: old rows have no owner and will never be shown. Delete them with:
-- DELETE FROM interview_sessions WHERE client_id IS NULL;
