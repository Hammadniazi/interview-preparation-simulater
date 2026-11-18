'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { isDifficulty, isInterviewType, type InterviewConfig } from '@/lib/types';

// Client-only: the session restores itself from sessionStorage, which doesn't exist on the server.
const InterviewSession = dynamic(
  () => import('@/components/interview/InterviewSession').then((m) => m.InterviewSession),
  {
    ssr: false,
    loading: () => <div className="h-dvh" aria-busy="true" />,
  },
);

export default function InterviewSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const search = useSearchParams();

  const name = search.get('name')?.trim().slice(0, 80);
  const role = search.get('role')?.trim().slice(0, 100);
  const difficulty = search.get('difficulty');
  const type = search.get('type');

  if (!name || !role || !isDifficulty(difficulty) || !isInterviewType(type)) {
    return (
      <div className="mx-auto max-w-md px-4 pt-40 text-center">
        <h1 className="font-display text-4xl">This session link is incomplete.</h1>
        <p className="mt-3 text-muted-foreground">Set up a new interview to get started.</p>
        <Button asChild className="mt-8">
          <Link href="/interview/setup">Set up an interview</Link>
        </Button>
      </div>
    );
  }

  const config: InterviewConfig = { sessionId, candidateName: name, jobRole: role, difficulty, interviewType: type };
  return <InterviewSession config={config} />;
}
