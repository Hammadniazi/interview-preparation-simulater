'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Enter, Reveal } from '@/components/shared/Reveal';
import { ScoreChart } from '@/components/dashboard/ScoreChart';
import { ScoreBars } from '@/components/interview/ScoreBars';
import { ScorePill } from '@/components/interview/ScorePill';
import { apiFetch, getLocalHistory, mergeHistory } from '@/lib/history';
import { DIFFICULTY_LABELS, INTERVIEW_TYPE_LABELS, SCORE_DIMENSIONS, type SessionSummary } from '@/lib/types';
import { average, averageBreakdown, formatDate, formatShortDate } from '@/lib/utils';

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-t border-border pt-4">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-5xl leading-none tabular-nums">{value}</dd>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);

  useEffect(() => {
    const local = getLocalHistory();
    apiFetch<{ sessions: SessionSummary[] }>('/api/sessions')
      .then(({ sessions: server }) => setSessions(mergeHistory(server, local)))
      .catch(() => setSessions(mergeHistory([], local)));
  }, []);

  const stats = useMemo(() => {
    if (!sessions?.length) return null;
    const scores = sessions.map((s) => s.overallScore);
    const chronological = [...sessions].reverse();
    const recent = chronological.slice(-3);
    const earlier = chronological.slice(-6, -3);
    const trend = earlier.length ? average(recent.map((s) => s.overallScore)) - average(earlier.map((s) => s.overallScore)) : null;
    const breakdowns = sessions.flatMap((s) => (s.scoreBreakdown ? [s.scoreBreakdown] : []));
    const dims = breakdowns.length ? averageBreakdown(breakdowns) : null;
    const weakest = dims ? SCORE_DIMENSIONS.reduce((a, b) => (dims[b.key] < dims[a.key] ? b : a)) : null;
    return {
      total: sessions.length,
      avg: average(scores),
      best: Math.max(...scores),
      trend,
      dims,
      weakest,
      chart: chronological.slice(-20).map((s) => ({ label: formatShortDate(s.completedAt), score: s.overallScore, role: s.jobRole })),
    };
  }, [sessions]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-24 sm:px-6 sm:pt-36">
      <Enter className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">History</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">Your progress.</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">Sessions completed in this browser. Only you can see them.</p>
        </div>
        <Button asChild className="group self-start sm:self-auto">
          <Link href="/interview/setup">
            New session <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </Enter>

      {sessions === null ? (
        <div className="mt-14 space-y-6" aria-busy="true">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !stats ? (
        <Enter delay={0.08} className="mt-14 rounded-2xl border border-dashed border-border-strong px-6 py-20 text-center">
          <h2 className="font-display text-3xl">Nothing here yet.</h2>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            Finish your first session and your scores, trends and reports will appear here.
          </p>
          <Button asChild className="mt-8">
            <Link href="/interview/setup">Start your first session</Link>
          </Button>
        </Enter>
      ) : (
        <>
          <Enter delay={0.06}>
            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              <Stat label="Sessions" value={String(stats.total)} />
              <Stat label="Average" value={String(stats.avg)} note="out of 100" />
              <Stat label="Best" value={String(stats.best)} note="out of 100" />
              <Stat
                label="Trend"
                value={stats.trend === null ? '—' : `${stats.trend > 0 ? '+' : ''}${stats.trend}`}
                note={stats.trend === null ? 'Needs 4+ sessions' : 'Last 3 vs previous 3'}
              />
            </dl>
          </Enter>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Reveal className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-sm font-medium">Score over time</h2>
              <div className="mt-4">
                {stats.chart.length > 1 ? (
                  <ScoreChart data={stats.chart} />
                ) : (
                  <p className="grid h-56 place-items-center text-center text-sm text-muted-foreground">
                    Complete one more session to see your trend.
                  </p>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.05} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-sm font-medium">Average by dimension</h2>
              {stats.dims ? (
                <>
                  <ScoreBars score={stats.dims} className="mt-6" />
                  {stats.weakest && (
                    <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
                      Focus next on <span className="font-medium text-foreground">{stats.weakest.label.toLowerCase()}</span>. It&apos;s
                      your lowest average.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">Dimension scores appear for new sessions.</p>
              )}
            </Reveal>
          </div>

          <Reveal className="mt-14">
            <h2 className="text-sm font-medium">All sessions</h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/report/${s.id}`}
                    className="group flex flex-col gap-2 py-4 transition-colors hover:bg-muted/50 sm:-mx-3 sm:flex-row sm:items-center sm:gap-6 sm:rounded-lg sm:px-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.jobRole}</p>
                      <p className="text-xs text-muted-foreground">
                        {DIFFICULTY_LABELS[s.difficulty]} · {INTERVIEW_TYPE_LABELS[s.interviewType]} · {formatDate(s.completedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScorePill score={s.overallScore} />
                      <ArrowUpRight
                        aria-hidden
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </>
      )}
    </div>
  );
}
