'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy, TrendingUp, BarChart3, Target, ArrowRight,
  Calendar, Clock, Brain, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreChart } from '@/components/dashboard/ScoreChart';
import { WeakAreaChart } from '@/components/dashboard/WeakAreaChart';
import { DashboardStats, SupabaseSession } from '@/lib/types';
import { getScoreColor, getScoreLabel, formatDate, truncate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockStats: DashboardStats = {
  totalInterviews: 0,
  averageScore: 0,
  bestScore: 0,
  improvementRate: 0,
  recentSessions: [],
  scoreHistory: [],
  weakAreas: [],
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Use empty state if API fails
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Interviews',
      value: stats.totalInterviews,
      suffix: '',
      icon: Brain,
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
    },
    {
      title: 'Average Score',
      value: stats.averageScore,
      suffix: '/100',
      icon: Trophy,
      color: getScoreColor(stats.averageScore),
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Best Score',
      value: stats.bestScore,
      suffix: '/100',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Performance',
      value: stats.averageScore > 0 ? getScoreLabel(stats.averageScore) : '—',
      suffix: '',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your interview performance and progress.</p>
          </div>
          <Link href="/interview/setup">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700">
              New Interview
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : (
                    <>
                      <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <div className={cn('text-2xl font-black', typeof card.value === 'number' ? card.color : '')}>
                        {card.value}
                        {card.suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{card.suffix}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">{card.title}</div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Score Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-600" />
                  Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <ScoreChart data={stats.scoreHistory} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weak Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  Weak Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <WeakAreaChart data={stats.weakAreas} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Recent Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : stats.recentSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No interviews yet</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Complete your first AI mock interview to see your performance data here.
                  </p>
                  <Link href="/interview/setup">
                    <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
                      Start First Interview
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSessions.map((session: SupabaseSession, i: number) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-violet-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{truncate(session.job_role, 30)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs">{session.difficulty}</Badge>
                            <Badge variant="secondary" className="text-xs">{session.interview_type}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(session.completed_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={cn('text-xl font-black', getScoreColor(session.overall_score))}>
                            {session.overall_score}
                          </div>
                          <div className="text-xs text-muted-foreground">/100</div>
                        </div>
                        <Link href={`/report/${session.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
        >
          {[
            {
              title: 'Practice Interview',
              description: 'Start a new AI mock interview',
              href: '/interview/setup',
              icon: Brain,
              gradient: 'from-violet-600 to-indigo-600',
            },
            {
              title: 'Resume Analysis',
              description: 'Get personalized questions from your CV',
              href: '/resume',
              icon: FileText,
              gradient: 'from-blue-600 to-cyan-600',
            },
            {
              title: 'View Dashboard',
              description: 'Track your progress over time',
              href: '/dashboard',
              icon: BarChart3,
              gradient: 'from-emerald-600 to-teal-600',
            },
          ].map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="border-border/50 hover:shadow-md hover:border-violet-500/30 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
