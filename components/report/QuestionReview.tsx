'use client';

import { ChevronDown } from 'lucide-react';
import type { AnswerEvaluation } from '@/lib/types';
import { ScorePill } from '@/components/interview/ScorePill';
import { ScoreBars } from '@/components/interview/ScoreBars';

export function QuestionReview({ evaluations }: { evaluations: AnswerEvaluation[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {evaluations.map((e, i) => (
        <details key={i} className="group">
          <summary className="flex min-h-16 list-none items-start gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span className="w-7 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="flex-1 text-[15px] leading-snug">{e.question}</span>
            <ScorePill score={e.overallScore} className="shrink-0" />
            <ChevronDown
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="grid gap-6 pb-6 pl-11 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Your answer</h4>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{e.answer || '—'}</p>
              </div>
              <div className="rounded-lg bg-accent-soft/60 p-4">
                <h4 className="text-xs font-medium text-accent">Feedback</h4>
                <p className="mt-1.5 text-sm leading-relaxed">{e.feedback}</p>
              </div>
            </div>
            <ScoreBars score={e.score} />
          </div>
        </details>
      ))}
    </div>
  );
}
