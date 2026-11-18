import { NextResponse, type NextRequest } from 'next/server';
import { readClientId } from '@/lib/api';
import { isDbConfigured, listSessions } from '@/lib/db';

/** History for the calling browser. `synced: false` means the client should rely on local history. */
export async function GET(req: NextRequest) {
  const clientId = readClientId(req);
  if (!clientId || !isDbConfigured()) {
    return NextResponse.json({ sessions: [], synced: false });
  }
  try {
    const sessions = await listSessions(clientId);
    return NextResponse.json({ sessions, synced: true });
  } catch (err) {
    console.error('[list sessions]', err);
    return NextResponse.json({ sessions: [], synced: false });
  }
}
