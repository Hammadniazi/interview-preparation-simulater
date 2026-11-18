'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { InterviewReport } from '@/lib/types';
import { DIFFICULTY_LABELS, INTERVIEW_TYPE_LABELS, SCORE_DIMENSIONS } from '@/lib/types';
import { formatDate, getScoreLabel } from '@/lib/utils';

const INK: [number, number, number] = [23, 24, 28];
const MUTED: [number, number, number] = [92, 94, 102];
const ACCENT: [number, number, number] = [30, 107, 78];

export function ReportExport({ report }: { report: InterviewReport }) {
  const [busy, setBusy] = useState(false);

  const exportPdf = async () => {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
      const margin = 20;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const maxW = pageW - margin * 2;
      let y = margin;

      const ensure = (h: number) => {
        if (y + h > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };
      const write = (text: string, size = 10, opts: { bold?: boolean; color?: [number, number, number]; font?: 'helvetica' | 'times'; gap?: number } = {}) => {
        doc.setFont(opts.font ?? 'helvetica', opts.bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...(opts.color ?? INK));
        const lines = doc.splitTextToSize(text, maxW) as string[];
        const lh = size * 0.45;
        ensure(lines.length * lh);
        doc.text(lines, margin, y);
        y += lines.length * lh + (opts.gap ?? 2);
      };
      const section = (title: string) => {
        y += 4;
        ensure(14);
        doc.setDrawColor(220, 216, 206);
        doc.line(margin, y, pageW - margin, y);
        y += 7;
        write(title.toUpperCase(), 8, { bold: true, color: MUTED, gap: 3 });
      };
      const bullets = (items: string[]) => items.forEach((t) => write(`•  ${t}`, 10, { gap: 1.5 }));

      write('InterviewAI — Interview debrief', 9, { color: MUTED, gap: 4 });
      write(`${report.candidateName} · ${report.jobRole}`, 22, { font: 'times', gap: 3 });
      write(
        `${DIFFICULTY_LABELS[report.difficulty]} · ${INTERVIEW_TYPE_LABELS[report.interviewType]} · ${formatDate(report.completedAt)}`,
        10,
        { color: MUTED, gap: 6 },
      );

      write(`${report.overallScore}/100`, 34, { font: 'times', color: ACCENT, gap: 2 });
      write(getScoreLabel(report.overallScore), 11, { bold: true, gap: 4 });
      SCORE_DIMENSIONS.forEach(({ key, label }) => write(`${label}: ${report.scoreBreakdown[key]}/100`, 10, { gap: 1 }));

      section('Strengths');
      bullets(report.strengths);
      section('Areas to improve');
      bullets(report.weaknesses);
      section('Skill gaps');
      bullets(report.skillGaps);
      section('Recommendations');
      report.recommendations.forEach((r, i) => write(`${i + 1}.  ${r}`, 10, { gap: 1.5 }));

      section('Four-week plan');
      report.learningRoadmap.forEach((w) => {
        write(`Week ${w.week} — ${w.title}`, 12, { font: 'times', gap: 1.5 });
        if (w.goal) write(`Goal: ${w.goal}`, 9, { color: MUTED, gap: 1.5 });
        w.topics.forEach((t) => write(`•  ${t}`, 9, { gap: 1 }));
        if (w.resources.length) write(`Resources: ${w.resources.join('; ')}`, 9, { color: MUTED, gap: 4 });
      });

      section('Question by question');
      report.evaluations.forEach((e, i) => {
        write(`Q${i + 1} · ${e.overallScore}/100`, 9, { bold: true, color: MUTED, gap: 1 });
        write(e.question, 10, { bold: true, gap: 1.5 });
        write(e.feedback, 9, { color: MUTED, gap: 4 });
      });

      const slug = report.candidateName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'candidate';
      doc.save(`interview-debrief-${slug}-${report.sessionId.slice(0, 8)}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error('PDF export failed', err);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={exportPdf} disabled={busy} variant="outline">
      {busy ? <Loader2 className="animate-spin" /> : <Download />}
      {busy ? 'Exporting…' : 'Export PDF'}
    </Button>
  );
}
