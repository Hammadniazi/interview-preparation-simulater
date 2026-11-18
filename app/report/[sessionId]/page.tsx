'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Enter, Reveal } from '@/components/shared/Reveal';
import { ScoreSummary } from '@/components/report/ScoreSummary';
import { LearningRoadmap } from '@/components/report/LearningRoadmap';
import { QuestionReview } from '@/components/report/QuestionReview';
import { ReportExport } from '@/components/report/ReportExport';
import { apiFetch, getLocalReport, saveLocalReport } from '@/lib/history';
import { DIFFICULTY_LABELS, INTERVIEW_TYPE_LABELS, type InterviewReport } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type Load = { status: 'loading' } | { status: 'ready'; report: InterviewReport } | { status: 'missing'; message: string };

function List({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'fair' | 'neutral' }) {
  if (!items.length) return null;
  const dot = tone === 'good' ? 'bg-good' : tone === 'fair' ? 'bg-fair' : 'bg-foreground/40';
  return (
    <Reveal className="border-t border-border pt-5">
      <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((s) => (
          <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
            <span aria-hidden className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {s}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const local = getLocalReport(sessionId);
    if (local) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after mount
      setLoad({ status: 'ready', report: local });
      return;
    }
    apiFetch<{ report: InterviewReport }>(`/api/interview/generate-report?sessionId=${encodeURIComponent(sessionId)}`)
      .then(({ report }) => {
        saveLocalReport(report);
        if (!cancelled) setLoad({ status: 'ready', report });
      })
      .catch((err: Error) => !cancelled && setLoad({ status: 'missing', message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (load.status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 pt-32 sm:px-6" aria-busy="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (load.status === 'missing') {
    return (
      <div className="mx-auto max-w-md px-4 pt-40 text-center">
        <h1 className="font-display text-4xl">We couldn&apos;t find this report.</h1>
        <p className="mt-3 text-muted-foreground">
          Reports are only available in the browser that created them. {load.message}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">View history</Link>
          </Button>
          <Button asChild>
            <Link href="/interview/setup">New session</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { report } = load;
  const firstName = report.candidateName.split(' ')[0];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6 sm:pt-36">
      <Enter>
        <p className="text-sm text-muted-foreground">
          Debrief · {formatDate(report.completedAt)}
        </p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              {firstName}, here&apos;s how it went.
            </h1>
            <p className="mt-4 text-muted-foreground">
              {report.jobRole} · {DIFFICULTY_LABELS[report.difficulty]} · {INTERVIEW_TYPE_LABELS[report.interviewType]} ·{' '}
              {report.evaluations.length} questions
            </p>
          </div>
          <div className="flex gap-2">
            <ReportExport report={report} />
            <Button asChild>
              <Link href="/interview/setup">New session</Link>
            </Button>
          </div>
        </div>
      </Enter>

      <Enter delay={0.08} className="mt-12">
        <ScoreSummary overallScore={report.overallScore} scoreBreakdown={report.scoreBreakdown} />
      </Enter>

      <Tabs defaultValue="summary" className="mt-14">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
          <TabsTrigger value="plan">Four-week plan</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            <List title="What went well" items={report.strengths} tone="good" />
            <List title="What to work on" items={report.weaknesses} tone="fair" />
          </div>

          {report.skillGaps.length > 0 && (
            <Reveal className="mt-10 border-t border-border pt-5">
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Skill gaps</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {report.skillGaps.map((g) => (
                  <li key={g} className="rounded-full border border-border-strong px-3 py-1 text-sm">
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {report.recommendations.length > 0 && (
            <Reveal className="mt-10 border-t border-border pt-5">
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Next steps</h3>
              <ol className="mt-4 grid gap-5 sm:grid-cols-2">
                {report.recommendations.map((r, i) => (
                  <li key={r} className="flex gap-4">
                    <span className="font-display text-3xl leading-none text-accent tabular-nums">{i + 1}</span>
                    <span className="pt-1 text-[15px] leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </TabsContent>

        <TabsContent value="answers">
          <QuestionReview evaluations={report.evaluations} />
        </TabsContent>

        <TabsContent value="plan">
          {report.learningRoadmap.length > 0 ? (
            <LearningRoadmap roadmap={report.learningRoadmap} />
          ) : (
            <p className="text-muted-foreground">No plan was generated for this session.</p>
          )}
        </TabsContent>
      </Tabs>

      <Reveal className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-border pt-10 sm:flex-row sm:items-center">
        <p className="font-display text-3xl">Run it again while it&apos;s fresh.</p>
        <Button asChild size="lg" className="group">
          <Link href="/interview/setup">
            Start another session <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </Reveal>
    </div>
  );
}
