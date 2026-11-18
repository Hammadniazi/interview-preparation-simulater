'use client';

import { motion } from 'framer-motion';
import { SCORE_DIMENSIONS, type ScoreBreakdown } from '@/lib/types';
import { bandFill, cn, scoreBand } from '@/lib/utils';

/** Four labelled bars. Colour follows the score band; the number is always shown. */
export function ScoreBars({ score, className, dense }: { score: ScoreBreakdown; className?: string; dense?: boolean }) {
  return (
    <dl className={cn('grid gap-x-6', dense ? 'grid-cols-2 gap-y-2.5' : 'gap-y-4', className)}>
      {SCORE_DIMENSIONS.map(({ key, short }, i) => {
        const v = score[key];
        return (
          <div key={key}>
            <div className="flex justify-between text-xs">
              <dt className="text-muted-foreground">{short}</dt>
              <dd className="font-medium tabular-nums">{v}</dd>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn('h-full origin-left rounded-full', bandFill[scoreBand(v)])}
                style={{ width: `${v}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        );
      })}
    </dl>
  );
}
