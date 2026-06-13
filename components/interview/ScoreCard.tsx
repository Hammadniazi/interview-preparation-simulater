'use client';

import { motion } from 'framer-motion';
import { AnswerEvaluation } from '@/lib/types';
import { getScoreColor, getScoreLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CheckCircle2, TrendingUp, MessageSquare, Target, Zap } from 'lucide-react';

interface ScoreCardProps {
  evaluation: AnswerEvaluation;
  questionNumber: number;
}

const scoreCategories = [
  { key: 'technicalKnowledge' as const, label: 'Technical', icon: Zap, color: 'from-violet-500 to-purple-500' },
  { key: 'communication' as const, label: 'Communication', icon: MessageSquare, color: 'from-blue-500 to-indigo-500' },
  { key: 'relevance' as const, label: 'Relevance', icon: Target, color: 'from-emerald-500 to-teal-500' },
  { key: 'confidence' as const, label: 'Confidence', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
];

export function ScoreCard({ evaluation, questionNumber }: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 rounded-xl border border-border/50 bg-card/50 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium">Q{questionNumber} Score</span>
        </div>
        <div className={cn('text-2xl font-bold', getScoreColor(evaluation.overallScore))}>
          {evaluation.overallScore}
          <span className="text-xs text-muted-foreground font-normal">/100</span>
        </div>
      </div>

      <div className="text-xs font-medium text-center py-0.5 px-2 rounded-full bg-muted">
        {getScoreLabel(evaluation.overallScore)}
      </div>

      {/* Score Bars */}
      <div className="space-y-2.5">
        {scoreCategories.map(({ key, label, icon: Icon, color }) => {
          const score = evaluation.score[key];
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
                <span className={cn('font-semibold', getScoreColor(score))}>{score}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${color}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
        {evaluation.feedback}
      </div>
    </motion.div>
  );
}
