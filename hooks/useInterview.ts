'use client';

import { useState, useCallback, useEffect } from 'react';
import { InterviewSession, Message, AnswerEvaluation, Difficulty, InterviewType } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface UseInterviewOptions {
  sessionId: string;
  candidateName: string;
  jobRole: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
}

interface UseInterviewReturn {
  session: InterviewSession | null;
  currentQuestion: string | null;
  isLoading: boolean;
  isEvaluating: boolean;
  isComplete: boolean;
  submitAnswer: (answer: string) => Promise<void>;
  error: string | null;
}

export function useInterview(options: UseInterviewOptions): UseInterviewReturn {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextQuestion = useCallback(async (
    currentSession: InterviewSession,
    questionIndex: number
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/interview/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobRole: currentSession.jobRole,
          difficulty: currentSession.difficulty,
          interviewType: currentSession.interviewType,
          questionIndex,
          previousQuestions: currentSession.questions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentQuestion(data.question);

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.question,
        timestamp: new Date(),
      };

      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: [...prev.questions, data.question],
          messages: [...prev.messages, aiMessage],
          currentQuestionIndex: questionIndex,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    const initial: InterviewSession = {
      id: options.sessionId,
      candidateName: options.candidateName,
      jobRole: options.jobRole,
      difficulty: options.difficulty,
      interviewType: options.interviewType,
      status: 'active',
      currentQuestionIndex: 0,
      questions: [],
      messages: [],
      evaluations: [],
      startedAt: new Date(),
      createdAt: new Date(),
    };
    setSession(initial);
    fetchNextQuestion(initial, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!session || !currentQuestion) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: answer,
      timestamp: new Date(),
    };

    setSession(prev => prev ? { ...prev, messages: [...prev.messages, userMessage] } : prev);
    setIsEvaluating(true);

    try {
      const evalRes = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer,
          jobRole: session.jobRole,
          difficulty: session.difficulty,
          interviewType: session.interviewType,
          questionIndex: session.currentQuestionIndex,
        }),
      });
      const evalData = await evalRes.json();
      if (!evalRes.ok) throw new Error(evalData.error);

      const evaluation: AnswerEvaluation = {
        ...evalData.evaluation,
        questionIndex: session.currentQuestionIndex,
      };

      const nextIndex = session.currentQuestionIndex + 1;
      const updatedSession: InterviewSession = {
        ...session,
        messages: [...session.messages, userMessage],
        evaluations: [...session.evaluations, evaluation],
        currentQuestionIndex: nextIndex,
      };

      if (nextIndex >= 10) {
        // Interview complete
        const allEvals = [...updatedSession.evaluations, evaluation];
        const finalSession = {
          ...updatedSession,
          evaluations: allEvals,
          status: 'completed' as const,
          completedAt: new Date(),
          overallScore: Math.round(
            allEvals.reduce((s, e) => s + e.overallScore, 0) / allEvals.length
          ),
        };
        setSession(finalSession);
        setIsComplete(true);

        // Generate report and store in sessionStorage for report page
        const reportRes = await fetch('/api/interview/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: finalSession }),
        });
        const reportData = await reportRes.json();
        if (reportData.report && typeof window !== 'undefined') {
          sessionStorage.setItem(`report-${finalSession.id}`, JSON.stringify(reportData.report));
        }
      } else {
        setSession(updatedSession);
        await fetchNextQuestion(updatedSession, nextIndex);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  }, [session, currentQuestion, fetchNextQuestion]);

  return { session, currentQuestion, isLoading, isEvaluating, isComplete, submitAnswer, error };
}
