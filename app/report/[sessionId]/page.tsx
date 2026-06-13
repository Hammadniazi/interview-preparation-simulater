'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, Target, TrendingUp, AlertTriangle, BookOpen, ChevronDown, ChevronUp, ArrowLeft, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreBreakdown } from '@/components/report/ScoreBreakdown';
import { LearningRoadmap } from '@/components/report/LearningRoadmap';
import { ReportExport } from '@/components/report/ReportExport';
import { InterviewReport } from '@/lib/types';
import { getScoreColor, getScoreLabel, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReportPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const candidateName = searchParams.get('name') || 'Candidate';

  useEffect(() => {
    // First check sessionStorage (immediate data from the interview)
    const stored = sessionStorage.getItem(`report-${sessionId}`);
    if (stored) {
      try {
        setReport(JSON.parse(stored));
        setIsLoading(false);
        return;
      } catch {}
    }

    // Fallback: fetch from API (Supabase)
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interview/generate-report?sessionId=${sessionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setReport(data.report);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Report not found');
      } finally {
        setIsLoading(false);
      }
    };

    // Wait a bit for report generation to complete
    const timer = setTimeout(fetchReport, 1000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  // Store report in session when received from interview flow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('report-ready', (e: Event) => {
        const custom = e as CustomEvent<InterviewReport>;
        setReport(custom.detail);
        sessionStorage.setItem(`report-${sessionId}`, JSON.stringify(custom.detail));
        setIsLoading(false);
      });
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex gap-1 justify-center mb-4">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-violet-500"
                animate={{ y: ['0%', '-60%', '0%'] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <h2 className="text-xl font-bold">Generating Your Report</h2>
          <p className="text-muted-foreground text-sm mt-1">Analyzing your performance with AI...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Report Unavailable</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {error || 'This report could not be found. It may have been generated but not yet saved.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <Button onClick={() => router.push('/interview/setup')} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
              <RotateCcw className="w-4 h-4" />
              New Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h1 className="text-2xl font-bold">Interview Report</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {report.candidateName} · {report.jobRole} · {formatDate(report.completedAt)}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{report.difficulty}</Badge>
                <Badge variant="secondary">{report.interviewType}</Badge>
                <Badge variant="secondary">{report.evaluations?.length || 10} Questions</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/interview/setup')}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Interview
              </Button>
              <ReportExport report={report} />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Overall Score', value: `${report.overallScore}`, suffix: '/100', color: getScoreColor(report.overallScore), icon: Trophy },
            { label: 'Performance', value: getScoreLabel(report.overallScore), suffix: '', color: 'text-foreground', icon: TrendingUp },
            { label: 'Strengths', value: `${report.strengths?.length || 0}`, suffix: ' areas', color: 'text-emerald-500', icon: Target },
            { label: 'Growth Areas', value: `${report.weaknesses?.length || 0}`, suffix: ' areas', color: 'text-orange-500', icon: AlertTriangle },
          ].map(({ label, value, suffix, color, icon: Icon }) => (
            <Card key={label} className="border-border/50">
              <CardContent className="p-4 text-center">
                <Icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <div className={cn('text-2xl font-black', color)}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{suffix}</div>
                <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreBreakdown
                    overallScore={report.overallScore}
                    scoreBreakdown={report.scoreBreakdown}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-4">
              {report.evaluations?.map((evaluation, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4">
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-muted-foreground">Q{i + 1}</span>
                            <span className={cn('text-xs font-bold', getScoreColor(evaluation.overallScore))}>
                              {evaluation.overallScore}/100
                            </span>
                          </div>
                          <p className="text-sm font-medium line-clamp-2">{evaluation.question}</p>
                        </div>
                        {expandedQ === i ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        )}
                      </div>
                    </button>

                    {expandedQ === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-3"
                      >
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Your Answer</p>
                          <p className="text-sm">{evaluation.answer}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(evaluation.score).map(([key, val]) => (
                            <div key={key} className="text-center bg-muted/20 rounded-lg p-2">
                              <div className={cn('text-lg font-bold', getScoreColor(val as number))}>{val as number}</div>
                              <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
                          <p className="text-xs font-medium text-violet-700 dark:text-violet-400 mb-1">Feedback</p>
                          <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <Card className="border-emerald-500/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.strengths?.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.weaknesses?.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Skill Gaps */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    Skill Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.skillGaps?.map((gap, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{gap}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {report.recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-500" />
                    Your 30-Day Learning Roadmap
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Personalized plan to close your skill gaps and land {report.jobRole} roles.
                  </p>
                </CardHeader>
                <CardContent>
                  {report.learningRoadmap?.length > 0 ? (
                    <LearningRoadmap roadmap={report.learningRoadmap} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No roadmap data available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Ready to practice again?</p>
          <Button
            onClick={() => router.push('/interview/setup')}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700"
          >
            <RotateCcw className="w-4 h-4" />
            Start Another Interview
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
