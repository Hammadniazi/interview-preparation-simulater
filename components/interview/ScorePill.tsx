import { bandSoft, cn, getScoreLabel, scoreBand } from '@/lib/utils';

export function ScorePill({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums',
        bandSoft[scoreBand(score)],
        className,
      )}
    >
      {score}
      <span className="opacity-80">· {getScoreLabel(score)}</span>
    </span>
  );
}
