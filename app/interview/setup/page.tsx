'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, User, Briefcase, Zap, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Difficulty, InterviewType, JOB_ROLES, DIFFICULTY_LABELS, INTERVIEW_TYPE_LABELS } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AIAvatar } from '@/components/interview/AIAvatar';

const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const interviewTypes: InterviewType[] = ['technical', 'behavioral', 'system-design', 'mixed', 'hr'];

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  intermediate: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  advanced: 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400',
  expert: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
};

const interviewTypeIcons: Record<InterviewType, string> = {
  technical: '💻',
  behavioral: '🧠',
  'system-design': '🏗️',
  mixed: '🔀',
  hr: '🤝',
};

export default function InterviewSetupPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [isStarting, setIsStarting] = useState(false);

  const canStart = candidateName.trim().length > 1 && jobRole.length > 0;

  const handleStart = async () => {
    if (!canStart) return;
    setIsStarting(true);
    const sessionId = generateId();
    const params = new URLSearchParams({
      name: candidateName.trim(),
      role: jobRole,
      difficulty,
      type: interviewType,
    });
    router.push(`/interview/${sessionId}?${params}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 pt-8"
        >
          <div className="flex justify-center mb-4">
            <AIAvatar size="lg" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Setup Your Interview</h1>
          <p className="text-muted-foreground mt-2">
            Configure your mock interview session. The AI will generate 10 tailored questions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Interview Configuration</CardTitle>
              <CardDescription>All fields are required to generate personalized questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Candidate Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4 text-violet-600" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Alex Johnson"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* Job Role */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="w-4 h-4 text-violet-600" />
                  Target Role
                </Label>
                <Select onValueChange={setJobRole} value={jobRole}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select the role you're interviewing for" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="w-4 h-4 text-violet-600" />
                  Difficulty Level
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105',
                        difficulty === d
                          ? difficultyColors[d]
                          : 'border-border hover:border-muted-foreground/40'
                      )}
                    >
                      <div className="font-semibold text-sm">{DIFFICULTY_LABELS[d]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Type */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                  Interview Type
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {interviewTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setInterviewType(type)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all duration-200',
                        interviewType === type
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-border hover:border-muted-foreground/40'
                      )}
                    >
                      <div className="text-lg mb-1">{interviewTypeIcons[type]}</div>
                      <div className={cn(
                        'font-semibold text-xs',
                        interviewType === type ? 'text-violet-700 dark:text-violet-400' : ''
                      )}>
                        {INTERVIEW_TYPE_LABELS[type]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {canStart && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4"
                >
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-2">Session Summary</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{candidateName}</Badge>
                    <Badge variant="secondary">{jobRole}</Badge>
                    <Badge variant="secondary">{DIFFICULTY_LABELS[difficulty]}</Badge>
                    <Badge variant="secondary">{INTERVIEW_TYPE_LABELS[interviewType]}</Badge>
                    <Badge variant="secondary">10 Questions</Badge>
                  </div>
                </motion.div>
              )}

              {/* Start Button */}
              <Button
                onClick={handleStart}
                disabled={!canStart || isStarting}
                className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700 h-12 text-base font-semibold shadow-lg shadow-violet-500/20"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              {!canStart && (
                <p className="text-xs text-muted-foreground text-center">
                  Please fill in your name and select a role to continue.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
