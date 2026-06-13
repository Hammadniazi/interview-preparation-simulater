'use client';

import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ScoreBreakdown as ScoreBreakdownType } from '@/lib/types';
import { getScoreColor, getScoreLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ScoreBreakdownProps {
  overallScore: number;
  scoreBreakdown: ScoreBreakdownType;
}

export function ScoreBreakdown({ overallScore, scoreBreakdown }: ScoreBreakdownProps) {
  const radarData = [
    { category: 'Technical', score: scoreBreakdown.technicalKnowledge, fullMark: 100 },
    { category: 'Communication', score: scoreBreakdown.communication, fullMark: 100 },
    { category: 'Relevance', score: scoreBreakdown.relevance, fullMark: 100 },
    { category: 'Confidence', score: scoreBreakdown.confidence, fullMark: 100 },
  ];

  const categories = [
    { label: 'Technical Knowledge', value: scoreBreakdown.technicalKnowledge, color: 'from-violet-500 to-purple-500' },
    { label: 'Communication', value: scoreBreakdown.communication, color: 'from-blue-500 to-indigo-500' },
    { label: 'Relevance', value: scoreBreakdown.relevance, color: 'from-emerald-500 to-teal-500' },
    { label: 'Confidence', value: scoreBreakdown.confidence, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Score */}
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-border/50 bg-card/50">
        <div className="relative w-40 h-40 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-violet-600"
              stroke="url(#scoreGradient)"
              strokeDasharray={`${2 * Math.PI * 45}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - overallScore / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={cn('text-4xl font-black', getScoreColor(overallScore))}
            >
              {overallScore}
            </motion.span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <h3 className="font-bold text-xl">{getScoreLabel(overallScore)}</h3>
        <p className="text-sm text-muted-foreground text-center mt-1">Overall Interview Score</p>
      </div>

      {/* Radar Chart */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <h3 className="font-semibold mb-4 text-sm">Performance Radar</h3>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Bars */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl border border-border/50 bg-card/30"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{label}</span>
              <span className={cn('font-bold', getScoreColor(value))}>{value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 + 0.3 }}
                className={`h-full rounded-full bg-gradient-to-r ${color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
