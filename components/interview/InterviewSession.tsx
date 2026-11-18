'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInterview } from '@/hooks/useInterview';
import { DIFFICULTY_LABELS, INTERVIEW_TYPE_LABELS, TOTAL_QUESTIONS, type InterviewConfig } from '@/lib/types';
import { average, averageBreakdown, cn, getScoreColor } from '@/lib/utils';
import { ProgressSegments } from './ProgressSegments';
import { ScoreBars } from './ScoreBars';
import { ScorePill } from './ScorePill';
import { Composer } from './Composer';
import { McqOptions } from './McqOptions';

const EASE = [0.22, 1, 0.36, 1] as const;

function Typing({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-foreground" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      {label}
    </div>
  );
}

export function InterviewSession({ config }: { config: InterviewConfig }) {
  const router = useRouter();
  const { state, currentQuestion, canAnswer, answeredCount, submitAnswer, retry } = useInterview(config);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { phase, index, questions, answers, evaluations, error } = state;
  const latest = evaluations[evaluations.length - 1];
  const running = evaluations.length ? average(evaluations.map((e) => e.overallScore)) : null;

  // Keep the newest content in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [phase, index, evaluations.length]);

  // Report ready → go to it.
  useEffect(() => {
    if (phase === 'done') router.replace(`/report/${config.sessionId}`);
  }, [phase, router, config.sessionId]);

  const statusLabel =
    phase === 'question'
      ? 'Writing the next question…'
      : phase === 'evaluate'
        ? 'Reviewing your answer…'
        : phase === 'report' || phase === 'done'
          ? 'Writing your debrief…'
          : null;

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col px-4 pt-16 sm:px-6">
      {/* Session header */}
      <div className="space-y-3 border-b border-border py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium">{config.jobRole}</h1>
            <p className="text-xs text-muted-foreground">
              {DIFFICULTY_LABELS[config.difficulty]} · {INTERVIEW_TYPE_LABELS[config.interviewType]} · {config.candidateName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground tabular-nums">
              Question {Math.min(index + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
            </span>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/interview/setup">End session</Link>
            </Button>
          </div>
        </div>
        <ProgressSegments total={TOTAL_QUESTIONS} completed={answeredCount} current={index} />
      </div>

      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Transcript + composer */}
        <section className="flex min-h-0 flex-col" aria-label="Interview transcript">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto py-8 pr-1" aria-live="polite">
            <ol className="mx-auto max-w-2xl space-y-10">
              {questions.map((q, i) => {
                const evaluation = evaluations[i];
                const answer = answers[i];
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Question {i + 1}
                      </p>
                      <p className="mt-2 font-display text-[clamp(1.35rem,2.6vw,1.7rem)] leading-snug">{q.question}</p>
                    </div>

                    {answer && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ml-auto max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-[15px] leading-relaxed sm:max-w-[80%]"
                      >
                        <span className="sr-only">Your answer: </span>
                        {answer}
                      </motion.div>
                    )}

                    {evaluation && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="rounded-xl border border-border bg-surface p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Feedback</span>
                          <ScorePill score={evaluation.overallScore} />
                        </div>
                        <p className="mt-2.5 text-sm leading-relaxed text-foreground/85">{evaluation.feedback}</p>
                        <ScoreBars score={evaluation.score} dense className="mt-4 lg:hidden" />
                      </motion.div>
                    )}
                  </motion.li>
                );
              })}
            </ol>

            <div className="mx-auto mt-8 max-w-2xl">
              <AnimatePresence mode="wait">
                {statusLabel && (
                  <motion.div key={statusLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Typing label={statusLabel} />
                  </motion.div>
                )}
                {phase === 'error' && error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-poor/30 bg-poor-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-poor" />
                      <div className="text-sm">
                        <p className="font-medium">
                          {error.failed === 'question'
                            ? "Couldn't load the next question."
                            : error.failed === 'evaluate'
                              ? "Couldn't score that answer. It's saved, so you won't lose it."
                              : "Couldn't write your debrief. Your answers are saved."}
                        </p>
                        <p className="mt-0.5 text-muted-foreground">{error.message}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={retry} className="shrink-0 bg-surface">
                      <RotateCcw /> Try again
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {phase !== 'report' && phase !== 'done' && !(phase === 'error' && error?.failed === 'report') && (
            <div className="mx-auto w-full max-w-2xl border-t border-border pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {currentQuestion?.mcq ? (
                <McqOptions
                  key={index}
                  options={currentQuestion.mcq.options}
                  disabled={!canAnswer}
                  onSubmit={(i) =>
                    submitAnswer({ text: `${'ABCD'[i]}) ${currentQuestion.mcq!.options[i]}`, mcqSelected: i })
                  }
                />
              ) : (
                <Composer disabled={!canAnswer} onSubmit={(text) => submitAnswer({ text })} />
              )}
            </div>
          )}
        </section>

        {/* Side panel (desktop) */}
        <aside className="hidden overflow-y-auto py-8 lg:block" aria-label="Scores">
          <div className="space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Running score</p>
              <p className={cn('mt-2 font-display text-6xl leading-none tabular-nums', running !== null && getScoreColor(running))}>
                {running ?? '—'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {running !== null ? `Average across ${evaluations.length} answer${evaluations.length === 1 ? '' : 's'}` : 'Appears after your first answer'}
              </p>
            </div>

            {evaluations.length > 0 && (
              <div className="border-t border-border pt-6">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  By dimension
                </p>
                <ScoreBars score={averageBreakdown(evaluations.map((e) => e.score))} />
              </div>
            )}

            {latest && (
              <div className="border-t border-border pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Last answer · Q{latest.questionIndex + 1}
                </p>
                <ScoreBars score={latest.score} dense />
              </div>
            )}

            <div className="border-t border-border pt-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Good answers usually…</p>
              <ul className="mt-3 space-y-2">
                <li>Lead with the answer, then explain.</li>
                <li>Use one specific example with a result.</li>
                <li>Say what you would measure or check.</li>
                <li>Use STAR for “tell me about a time”.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
