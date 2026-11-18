'use client';

/**
 * Browser-side identity + history.
 *
 * - A random anonymous id identifies this browser to the API (no accounts).
 * - Reports are also cached locally, so the app works fully without Supabase
 *   and the report page loads instantly after an interview.
 */
import type { InterviewReport, SessionSummary } from './types';

const CLIENT_ID_KEY = 'iai:client-id';
const REPORT_KEY = (id: string) => `iai:report:${id}`;
const INDEX_KEY = 'iai:history';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked — non-fatal */
  }
}

export function getClientId(): string {
  let id = safeGet(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    safeSet(CLIENT_ID_KEY, id);
  }
  return id;
}

/** fetch() wrapper that attaches the anonymous client id and surfaces API errors. */
export async function apiFetch<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('x-client-id', getClientId());
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await fetch(input, { ...init, headers });
  } catch {
    throw new Error('Network error — check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export function toSummary(r: InterviewReport): SessionSummary {
  return {
    id: r.sessionId,
    candidateName: r.candidateName,
    jobRole: r.jobRole,
    difficulty: r.difficulty,
    interviewType: r.interviewType,
    overallScore: r.overallScore,
    scoreBreakdown: r.scoreBreakdown,
    completedAt: r.completedAt,
  };
}

export function saveLocalReport(report: InterviewReport) {
  safeSet(REPORT_KEY(report.sessionId), JSON.stringify(report));
  const index = getLocalHistory().filter((s) => s.id !== report.sessionId);
  index.unshift(toSummary(report));
  safeSet(INDEX_KEY, JSON.stringify(index.slice(0, 50)));
}

export function getLocalReport(id: string): InterviewReport | null {
  const raw = safeGet(REPORT_KEY(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InterviewReport;
  } catch {
    return null;
  }
}

export function getLocalHistory(): SessionSummary[] {
  const raw = safeGet(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Merge server + local rows, de-duplicated, newest first. */
export function mergeHistory(server: SessionSummary[], local: SessionSummary[]): SessionSummary[] {
  const map = new Map<string, SessionSummary>();
  for (const s of [...local, ...server]) map.set(s.id, s);
  return [...map.values()].sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
}
