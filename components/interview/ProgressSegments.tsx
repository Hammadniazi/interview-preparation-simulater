import { cn } from '@/lib/utils';

/** Ten-segment progress bar — reads at a glance without a percentage. */
export function ProgressSegments({ total, completed, current }: { total: number; completed: number; current: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Interview progress"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      aria-valuetext={`${completed} of ${total} questions answered`}
      className="flex gap-1"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors duration-500',
            i < completed ? 'bg-accent' : i === current ? 'bg-foreground/40' : 'bg-border',
          )}
        />
      ))}
    </div>
  );
}
