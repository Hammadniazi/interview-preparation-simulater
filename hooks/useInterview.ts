'use client';

/**
 * Interview session state machine.
 *
 *   question ──► answer ──submit──► evaluate ──► question … (×10)
 *                                       └──(last)──► report ──► done
 *   any async step ──fail──► error ──retry──► (the step that failed)
 *
 * Each async step is driven by an effect keyed on `phase`, so retrying is
 * just "go back to that phase". State is mirrored to sessionStorage so a
 * refresh resumes the interview instead of starting over.
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { AnswerEvaluation, GeneratedQuestion, InterviewConfig, InterviewReport } from '@/lib/types';
import { TOTAL_QUESTIONS } from '@/lib/types';
import { apiFetch, saveLocalReport } from '@/lib/history';

type AsyncPhase = 'question' | 'evaluate' | 'report';
export type Phase = AsyncPhase | 'answer' | 'done' | 'error';

export interface PendingAnswer {
  text: string;
  mcqSelected?: number;
}

export interface InterviewState {
  config: InterviewConfig;
  phase: Phase;
  index: number;
  questions: GeneratedQuestion[];
  answers: string[];
  evaluations: AnswerEvaluation[];
  pending: PendingAnswer | null;
  error: { message: string; failed: AsyncPhase } | null;
  report: InterviewReport | null;
}

type Action =
  | { type: 'question-ready'; question: GeneratedQuestion }
  | { type: 'submit'; answer: PendingAnswer }
  | { type: 'evaluated'; evaluation: AnswerEvaluation }
  | { type: 'report-ready'; report: InterviewReport }
  | { type: 'fail'; failed: AsyncPhase; message: string }
  | { type: 'retry' };

function reducer(state: InterviewState, action: Action): InterviewState {
  switch (action.type) {
    case 'question-ready': {
      const questions = [...state.questions];
      questions[state.index] = action.question;
      return { ...state, questions, phase: 'answer' };
    }
    case 'submit': {
      if (state.phase !== 'answer') return state;
      const answers = [...state.answers];
      answers[state.index] = action.answer.text;
      return { ...state, answers, pending: action.answer, phase: 'evaluate' };
    }
    case 'evaluated': {
      const evaluations = [...state.evaluations];
      evaluations[state.index] = action.evaluation;
      const isLast = state.index + 1 >= TOTAL_QUESTIONS;
      return {
        ...state,
        evaluations,
        pending: null,
        phase: isLast ? 'report' : 'question',
        index: isLast ? state.index : state.index + 1,
      };
    }
    case 'report-ready':
      return { ...state, report: action.report, phase: 'done' };
    case 'fail':
      return { ...state, phase: 'error', error: { message: action.message, failed: action.failed } };
    case 'retry':
      return state.error ? { ...state, phase: state.error.failed, error: null } : state;
  }
}

const storageKey = (id: string) => `iai:live:${id}`;

function initState(config: InterviewConfig): InterviewState {
  try {
    const raw = sessionStorage.getItem(storageKey(config.sessionId));
    if (raw) {
      const saved = JSON.parse(raw) as InterviewState;
      if (saved.config?.sessionId === config.sessionId) return saved;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return {
    config,
    phase: 'question',
    index: 0,
    questions: [],
    answers: [],
    evaluations: [],
    pending: null,
    error: null,
    report: null,
  };
}

const message = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong.');

export function useInterview(config: InterviewConfig) {
  const [state, dispatch] = useReducer(reducer, config, initState);
  // Guards against duplicate requests (React Strict Mode runs effects twice in dev).
  const inFlight = useRef<string | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(state.config.sessionId), JSON.stringify(state));
    } catch {
      /* non-fatal */
    }
  }, [state]);

  useEffect(() => {
    const { phase, index, config: c } = state;
    if (phase !== 'question' && phase !== 'evaluate' && phase !== 'report') return;

    const key = `${phase}:${index}`;
    if (inFlight.current === key) return;
    inFlight.current = key;
    const release = () => {
      if (inFlight.current === key) inFlight.current = null;
    };

    if (phase === 'question') {
      apiFetch<GeneratedQuestion>('/api/interview/generate-question', {
        method: 'POST',
        body: JSON.stringify({
          jobRole: c.jobRole,
          difficulty: c.difficulty,
          interviewType: c.interviewType,
          questionIndex: index,
          previousQuestions: state.questions.slice(0, index).map((q) => q.question),
        }),
      })
        .then((question) => dispatch({ type: 'question-ready', question }))
        .catch((err) => dispatch({ type: 'fail', failed: 'question', message: message(err) }))
        .finally(release);
    }

    if (phase === 'evaluate' && state.pending) {
      const q = state.questions[index];
      const mcq =
        q?.mcq && state.pending.mcqSelected !== undefined
          ? { options: q.mcq.options, correctIndex: q.mcq.correctIndex, selectedIndex: state.pending.mcqSelected }
          : undefined;
      apiFetch<{ evaluation: AnswerEvaluation }>('/api/interview/evaluate-answer', {
        method: 'POST',
        body: JSON.stringify({
          question: q?.question,
          answer: state.pending.text,
          mcq,
          jobRole: c.jobRole,
          difficulty: c.difficulty,
          interviewType: c.interviewType,
          questionIndex: index,
        }),
      })
        .then(({ evaluation }) => dispatch({ type: 'evaluated', evaluation: { ...evaluation, questionIndex: index } }))
        .catch((err) => dispatch({ type: 'fail', failed: 'evaluate', message: message(err) }))
        .finally(release);
    }

    if (phase === 'report') {
      apiFetch<{ report: InterviewReport }>('/api/interview/generate-report', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: c.sessionId,
          candidateName: c.candidateName,
          jobRole: c.jobRole,
          difficulty: c.difficulty,
          interviewType: c.interviewType,
          evaluations: state.evaluations,
        }),
      })
        .then(({ report }) => {
          saveLocalReport(report);
          dispatch({ type: 'report-ready', report });
        })
        .catch((err) => dispatch({ type: 'fail', failed: 'report', message: message(err) }))
        .finally(release);
    }
    // The step only depends on phase/index; other fields are read from the snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.index]);

  const submitAnswer = useCallback((answer: PendingAnswer) => dispatch({ type: 'submit', answer }), []);
  const retry = useCallback(() => dispatch({ type: 'retry' }), []);

  return {
    state,
    currentQuestion: state.questions[state.index] ?? null,
    canAnswer: state.phase === 'answer',
    answeredCount: state.evaluations.filter(Boolean).length,
    submitAnswer,
    retry,
  };
}
