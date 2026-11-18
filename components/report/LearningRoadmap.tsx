import type { LearningWeek } from '@/lib/types';
import { Reveal } from '@/components/shared/Reveal';

export function LearningRoadmap({ roadmap }: { roadmap: LearningWeek[] }) {
  return (
    <ol className="relative space-y-0">
      {roadmap.map((week, i) => (
        <Reveal as="li" key={`${week.week}-${i}`} delay={i * 0.05} className="relative grid gap-4 pb-10 pl-10 last:pb-0 sm:grid-cols-[140px_1fr] sm:pl-0">
          {/* timeline rail */}
          {i < roadmap.length - 1 && (
            <span aria-hidden className="absolute top-8 bottom-1 left-[11.5px] w-px bg-border sm:left-[151.5px]" />
          )}
          <span
            aria-hidden
            className="absolute top-1 left-0 grid h-6 w-6 place-items-center rounded-full border border-border-strong bg-background text-[11px] font-medium tabular-nums sm:left-[140px]"
          >
            {week.week}
          </span>

          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground sm:pt-1.5">Week {week.week}</p>

          <div className="sm:pl-12">
            <h3 className="font-display text-2xl leading-snug">{week.title}</h3>
            {week.goal && (
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Goal — </span>
                {week.goal}
              </p>
            )}
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {week.topics.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Study</h4>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {week.topics.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {week.resources.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Resources</h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
                    {week.resources.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span aria-hidden className="text-muted-foreground">→</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
