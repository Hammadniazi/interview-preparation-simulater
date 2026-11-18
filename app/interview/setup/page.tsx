'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Enter } from '@/components/shared/Reveal';
import {
  DIFFICULTIES,
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  INTERVIEW_TYPES,
  INTERVIEW_TYPE_HINTS,
  INTERVIEW_TYPE_LABELS,
  JOB_ROLES,
  TOTAL_QUESTIONS,
  isDifficulty,
  isInterviewType,
  type Difficulty,
  type InterviewType,
} from '@/lib/types';
import { cn, generateId } from '@/lib/utils';

const LAST_CONFIG_KEY = 'iai:last-setup';

function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  labels,
  hints,
  columns,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
  hints: Record<T, string>;
  columns: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className={cn('mt-3 grid gap-2', columns)}>
        {options.map((opt) => {
          const checked = value === opt;
          return (
            <label
              key={opt}
              className={cn(
                'relative flex min-h-16 flex-col justify-center rounded-lg border px-3.5 py-3 transition-[border-color,background-color,box-shadow] duration-150',
                'has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/25',
                checked
                  ? 'border-foreground bg-surface shadow-[inset_0_0_0_1px_var(--foreground)]'
                  : 'border-border bg-surface/60 hover:border-border-strong',
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={checked}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{labels[opt]}</span>
              <span className="mt-0.5 text-xs leading-snug text-muted-foreground">{hints[opt]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function InterviewSetupPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [submitted, setSubmitted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Restore the last configuration — most people practise the same role repeatedly.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_CONFIG_KEY);
      if (!raw) return;
      const c = JSON.parse(raw);
      /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from storage */
      if (typeof c.candidateName === 'string') setCandidateName(c.candidateName);
      if (typeof c.jobRole === 'string' && (JOB_ROLES as readonly string[]).includes(c.jobRole)) setJobRole(c.jobRole);
      if (isDifficulty(c.difficulty)) setDifficulty(c.difficulty);
      if (isInterviewType(c.interviewType)) setInterviewType(c.interviewType);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      /* ignore */
    }
  }, []);

  const nameError = candidateName.trim().length < 2 ? 'Enter your name (at least 2 characters).' : null;
  const roleError = !jobRole ? 'Choose the role you are interviewing for.' : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError) return document.getElementById('name')?.focus();
    if (roleError) return document.getElementById('role')?.focus();

    setIsStarting(true);
    const config = { candidateName: candidateName.trim(), jobRole, difficulty, interviewType };
    try {
      localStorage.setItem(LAST_CONFIG_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams({
      name: config.candidateName,
      role: config.jobRole,
      difficulty,
      type: interviewType,
    });
    router.push(`/interview/${generateId()}?${params}`);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-36">
      <Enter className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-sm text-muted-foreground">New session</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">Set the scene.</h1>
        <p className="mt-5 max-w-md text-muted-foreground">
          The interviewer adapts to the role and level you choose. Expect {TOTAL_QUESTIONS} questions that get harder as
          you go.
        </p>
        <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-mono text-xs text-foreground tabular-nums">~20m</span> Typical session length
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-foreground tabular-nums">4×</span> Scores per answer, plus one concrete fix
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-foreground tabular-nums">PDF</span> Exportable debrief and study plan
          </li>
        </ul>
      </Enter>

      <Enter delay={0.08}>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-border bg-surface p-5 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                autoComplete="given-name"
                placeholder="Alex"
                value={candidateName}
                maxLength={80}
                onChange={(e) => setCandidateName(e.target.value)}
                aria-invalid={submitted && !!nameError}
                aria-describedby={submitted && nameError ? 'name-error' : undefined}
              />
              {submitted && nameError && (
                <p id="name-error" role="alert" className="text-xs text-poor">
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Target role</Label>
              <Select value={jobRole} onValueChange={(v) => v && setJobRole(v)}>
                <SelectTrigger
                  id="role"
                  aria-invalid={submitted && !!roleError}
                  aria-describedby={submitted && roleError ? 'role-error' : undefined}
                >
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitted && roleError && (
                <p id="role-error" role="alert" className="text-xs text-poor">
                  {roleError}
                </p>
              )}
            </div>
          </div>

          <ChoiceGroup
            legend="Level"
            name="difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={setDifficulty}
            labels={DIFFICULTY_LABELS}
            hints={DIFFICULTY_HINTS}
            columns="grid-cols-2 sm:grid-cols-4"
          />

          <ChoiceGroup
            legend="Interview style"
            name="type"
            options={INTERVIEW_TYPES}
            value={interviewType}
            onChange={setInterviewType}
            labels={INTERVIEW_TYPE_LABELS}
            hints={INTERVIEW_TYPE_HINTS}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          />

          <div className="flex flex-col-reverse items-stretch gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {jobRole ? `${jobRole} · ${DIFFICULTY_LABELS[difficulty]} · ${INTERVIEW_TYPE_LABELS[interviewType]}` : `${TOTAL_QUESTIONS} questions`}
            </p>
            <Button type="submit" size="lg" disabled={isStarting} className="group">
              {isStarting ? (
                <>
                  <Loader2 className="animate-spin" /> Preparing…
                </>
              ) : (
                <>
                  Begin interview
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Enter>
    </div>
  );
}
