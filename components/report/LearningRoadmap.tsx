'use client';

import { motion } from 'framer-motion';
import { LearningWeek } from '@/lib/types';
import { BookOpen, CheckSquare, Target, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LearningRoadmapProps {
  roadmap: LearningWeek[];
}

const weekColors = [
  'border-violet-500/50 bg-violet-500/5',
  'border-blue-500/50 bg-blue-500/5',
  'border-emerald-500/50 bg-emerald-500/5',
  'border-orange-500/50 bg-orange-500/5',
];

const weekBadgeColors = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
];

export function LearningRoadmap({ roadmap }: LearningRoadmapProps) {
  return (
    <div className="space-y-4">
      {roadmap.map((week, index) => (
        <motion.div
          key={week.week}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative p-5 rounded-xl border-2 ${weekColors[index % weekColors.length]}`}
        >
          {/* Week badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${weekBadgeColors[index % weekBadgeColors.length]}`}>
                Week {week.week}
              </span>
              <h3 className="font-semibold text-sm">{week.title}</h3>
            </div>
          </div>

          {/* Goal */}
          <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg bg-background/60">
            <Target className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">{week.goal}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Topics */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Topics to Study</span>
              </div>
              <ul className="space-y-1.5">
                {week.topics.map((topic, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <CheckSquare className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Resources</span>
              </div>
              <ul className="space-y-1.5">
                {week.resources.map((resource, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span className="text-muted-foreground">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
