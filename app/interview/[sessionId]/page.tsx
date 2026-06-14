'use client';

import { use, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/interview/ChatInterface';
import { ProgressIndicator } from '@/components/interview/ProgressIndicator';
import { ScoreCard } from '@/components/interview/ScoreCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInterview } from '@/hooks/useInterview';
import { Difficulty, InterviewType, DIFFICULTY_LABELS, INTERVIEW_TYPE_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function InterviewSessionPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportFetched = useRef(false);

  const candidateName = searchParams.get('name') || 'Candidate';
  const jobRole = searchParams.get('role') || 'Software Engineer';
  const difficulty = (searchParams.get('difficulty') || 'intermediate') as Difficulty;
  const interviewType = (searchParams.get('type') || 'technical') as InterviewType;

  const {
    session,
    isLoading,
    isEvaluating,
    isComplete,
    submitAnswer,
    currentMcqOptions,
    error,
  } = useInterview({
    sessionId,
    candidateName,
    jobRole,
    difficulty,
    interviewType,
  });

  // Navigate to report when complete and report is ready
  useEffect(() => {
    if (isComplete && !reportFetched.current) {
      reportFetched.current = true;
      // Small delay to show completion message
      setTimeout(() => {
        router.push(`/report/${sessionId}?name=${encodeURIComponent(candidateName)}&role=${encodeURIComponent(jobRole)}`);
      }, 3000);
    }
  }, [isComplete, sessionId, router, candidateName, jobRole]);

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
            <Button onClick={() => router.push('/interview/setup')} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
              New Session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-4 gap-4">
        {/* Left: Chat */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden min-h-[calc(100vh-8rem)]"
        >
          {/* Progress bar at top */}
          <div className="p-4 border-b border-border/50">
            {/* Info badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">{candidateName}</Badge>
              <Badge variant="secondary" className="text-xs">{jobRole}</Badge>
              <Badge variant="secondary" className="text-xs">{DIFFICULTY_LABELS[difficulty]}</Badge>
              <Badge variant="secondary" className="text-xs">{INTERVIEW_TYPE_LABELS[interviewType]}</Badge>
            </div>
            {session ? (
              <ProgressIndicator
                currentQuestion={session.currentQuestionIndex}
                totalQuestions={10}
              />
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-hidden">
            {session ? (
              <ChatInterface
                messages={session.messages}
                isLoading={isLoading}
                isEvaluating={isEvaluating}
                onSubmitAnswer={submitAnswer}
                candidateName={candidateName}
                jobRole={jobRole}
                isComplete={isComplete}
                mcqOptions={currentMcqOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex gap-1 justify-center mb-3">
                    {[0,1,2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-violet-500"
                        animate={{ y: ['0%', '-50%', '0%'] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Initializing interview...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Score Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-80 flex flex-col gap-4"
        >
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
            <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
              Live Scores
            </h2>
            {session && session.evaluations.length > 0 ? (
              <ScrollArea className="max-h-[calc(100vh-16rem)]">
                <div className="space-y-3 pr-2">
                  {session.evaluations.slice(-3).reverse().map((evaluation, i) => (
                    <ScoreCard
                      key={evaluation.questionIndex}
                      evaluation={evaluation}
                      questionNumber={evaluation.questionIndex + 1}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-xs text-muted-foreground">
                  Scores appear here after each answer
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
            <h3 className="font-semibold text-sm mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                Use the STAR method for behavioral questions
              </li>
              <li className="flex gap-2">
                <span>•</span>
                Be specific with examples and metrics
              </li>
              <li className="flex gap-2">
                <span>•</span>
                Think out loud to show your reasoning
              </li>
              <li className="flex gap-2">
                <span>•</span>
                Aim for 2-3 minute answers
              </li>
            </ul>
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"
            >
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">Interview Complete!</p>
              <p className="text-xs text-muted-foreground mt-1">Generating your report...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
