'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedTime?: number;
}

export function ProgressIndicator({
  currentQuestion,
  totalQuestions,
  elapsedTime,
}: ProgressIndicatorProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  const minutes = Math.floor((elapsedTime ?? 0) / 60);
  const seconds = ((elapsedTime ?? 0) % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Question {Math.min(currentQuestion + 1, totalQuestions)} of {totalQuestions}
        </span>
        <div className="flex items-center gap-4">
          {elapsedTime !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{minutes}:{seconds}</span>
            </div>
          )}
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{ scale: i === currentQuestion ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {i < currentQuestion ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : i === currentQuestion ? (
              <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            ) : (
              <Circle className={cn(
                'w-4 h-4',
                i === currentQuestion + 1 ? 'text-muted-foreground' : 'text-muted-foreground/40'
              )} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
