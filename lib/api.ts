/** Shared helpers for route handlers (server). */
import { NextResponse, type NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { AIConfigError, AIResponseError } from './ai';

export const CLIENT_ID_HEADER = 'x-client-id';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readClientId(req: NextRequest): string | null {
  const id = req.headers.get(CLIENT_ID_HEADER);
  return id && UUID_RE.test(id) ? id : null;
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Map any thrown error to a user-safe JSON response. */
export function errorResponse(err: unknown, context: string) {
  if (err instanceof AIConfigError) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  if (err instanceof AIResponseError) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
  if (err instanceof Groq.APIError) {
    if (err.status === 429) {
      return NextResponse.json(
        { error: 'The AI is rate-limited right now. Wait a few seconds and try again.' },
        { status: 429 },
      );
    }
    if (err.status === 401 || err.status === 403) {
      return NextResponse.json({ error: 'The AI key was rejected. Check GROQ_API_KEY in .env.local.' }, { status: 500 });
    }
  }
  console.error(`[${context}]`, err);
  return NextResponse.json({ error: `Couldn't ${context}. Please try again.` }, { status: 500 });
}

/** Trim + length-limit an untrusted string field. Returns null when missing/empty. */
export function text(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}
