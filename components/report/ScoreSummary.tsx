'use client';

import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import type { ScoreBreakdown } from '@/lib/types';
import { cn, getScoreColor, getScoreLabel } from '@/lib/utils';
import { ScoreBars } from '@/components/interview/ScoreBars';

function useCountUp(target: number) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, reduce]);
  return reduce ? target : value;
}

export function ScoreSummary({ overallScore, scoreBreakdown }: { overallScore: number; scoreBreakdown: ScoreBreakdown }) {
  const shown = useCountUp(overallScore);
  return (
    <div className="grid gap-8 rounded-2xl border border-border bg-surface p-6 sm:p-8 md:grid-cols-[auto_1fr] md:gap-14">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Overall</p>
        <p
          className={cn('mt-3 font-display text-[clamp(4.5rem,12vw,7rem)] leading-[0.85] tabular-nums', getScoreColor(overallScore))}
          aria-label={`${overallScore} out of 100`}
        >
          {shown}
        </p>
        <p className="mt-3 text-sm">
          <span className="font-medium">{getScoreLabel(overallScore)}</span>
          <span className="text-muted-foreground"> · out of 100</span>
        </p>
      </div>
      <div className="md:border-l md:border-border md:pl-14">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">By dimension</p>
        <ScoreBars score={scoreBreakdown} />
      </div>
    </div>
  );
}
