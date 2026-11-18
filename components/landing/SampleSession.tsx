'use client';

import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

const scores = [
  { label: 'Technical', value: 82 },
  { label: 'Communication', value: 74 },
  { label: 'Relevance', value: 88 },
  { label: 'Confidence', value: 70 },
];

/** An illustrative (clearly labelled) preview of one question → answer → feedback cycle. */
export function SampleSession() {
  return (
    <figure className="relative">
      <div className="rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-30px_rgb(23_24_28/0.25)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 text-xs text-muted-foreground">
          <span>Frontend Developer · Intermediate</span>
          <span className="tabular-nums">Question 4 of 10</span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
            className="font-display text-[22px] leading-snug"
          >
            A product page re-renders on every keystroke in its search box. Walk me through how you&apos;d find and fix it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
            className="ml-6 rounded-xl rounded-tr-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground/85"
          >
            I&apos;d profile with React DevTools first to confirm what re-renders. Usually the search state lives too high, so
            I&apos;d move it down, memoise the list, and debounce the query…
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="rounded-xl border border-border p-4"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Feedback</span>
              <span className="font-display text-3xl leading-none tabular-nums">
                79<span className="text-base text-muted-foreground">/100</span>
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              {scores.map((s, i) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="tabular-nums">{s.value}</dd>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full origin-left rounded-full bg-accent"
                      style={{ width: `${s.value}%` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.5 + i * 0.08, duration: 0.8, ease: EASE }}
                    />
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Good instinct to measure first. Name the specific hook (<code className="font-mono text-[13px]">useDeferredValue</code>{' '}
              or a debounce) and say how you&apos;d verify the fix.
            </p>
          </motion.div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">Example of the feedback you get after each answer</figcaption>
    </figure>
  );
}
