'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, FileText, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Enter, Reveal } from '@/components/shared/Reveal';
import { apiFetch } from '@/lib/history';
import type { ResumeAnalysis } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_SIZE = 5 * 1024 * 1024;

function Section({ title, items, delay = 0 }: { title: string; items: string[]; delay?: number }) {
  if (!items.length) return null;
  return (
    <Reveal delay={delay} className="border-t border-border pt-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((s) => (
          <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
            <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
            {s}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default function ResumePage() {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected[0]) {
      const code = rejected[0].errors[0]?.code;
      setError(code === 'file-too-large' ? 'That file is larger than 5 MB.' : 'Upload a PDF, DOCX or TXT file.');
      return;
    }
    if (accepted[0]) {
      setFile(accepted[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: MAX_SIZE,
  });

  const ready = tab === 'upload' ? !!file : pasted.trim().length >= 50;

  const analyze = async () => {
    if (!ready) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const form = new FormData();
      if (tab === 'upload' && file) form.append('resume', file);
      else form.append('text', pasted.trim());
      const { analysis } = await apiFetch<{ analysis: ResumeAnalysis }>('/api/resume/analyze', { method: 'POST', body: form });
      setAnalysis(analysis);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPasted('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6 sm:pt-36">
      <Enter className="max-w-2xl">
        <p className="text-sm text-muted-foreground">Resume review</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
          {analysis ? 'What an interviewer will see.' : 'See your resume through an interviewer’s eyes.'}
        </h1>
        {!analysis && (
          <p className="mt-5 text-muted-foreground">
            Upload your resume and get the questions you are most likely to be asked about it, plus what to strengthen.
          </p>
        )}
      </Enter>

      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            className="mt-12 max-w-3xl rounded-2xl border border-border bg-surface p-5 sm:p-8"
          >
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'paste')}>
              <TabsList>
                <TabsTrigger value="upload">Upload a file</TabsTrigger>
                <TabsTrigger value="paste">Paste text</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  {...getRootProps()}
                  className={cn(
                    'grid min-h-56 cursor-pointer place-items-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25',
                    isDragActive ? 'border-accent bg-accent-soft/50' : 'border-border-strong hover:bg-muted/50',
                  )}
                >
                  <input {...getInputProps()} aria-label="Upload resume file" />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-8 w-8 text-accent" aria-hidden />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="h-7 w-7 text-muted-foreground" aria-hidden />
                      <p className="font-medium">{isDragActive ? 'Drop it here' : 'Drop your resume, or click to browse'}</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX or TXT · up to 5 MB</p>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Scanned PDFs can&apos;t be read. Paste the text instead.</p>
              </TabsContent>

              <TabsContent value="paste">
                <div className="space-y-2">
                  <Label htmlFor="resume-text">Resume text</Label>
                  <Textarea
                    id="resume-text"
                    value={pasted}
                    maxLength={20000}
                    onChange={(e) => setPasted(e.target.value)}
                    placeholder="Paste your experience, skills, education and projects…"
                    className="min-h-64"
                    aria-describedby="resume-text-help"
                  />
                  <p id="resume-text-help" className="text-xs text-muted-foreground tabular-nums">
                    {pasted.trim().length < 50 ? `At least 50 characters · ${pasted.trim().length} so far` : `${pasted.length} characters`}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div role="alert" className="mt-6 flex gap-3 rounded-lg bg-poor-soft p-3.5 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-poor" aria-hidden />
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end border-t border-border pt-6">
              <Button size="lg" onClick={analyze} disabled={!ready || isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" /> Reading your resume…
                  </>
                ) : (
                  'Analyse resume'
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={reset}>
                Analyse another
              </Button>
            </div>

            <Reveal className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Questions you&apos;re likely to get
              </h2>
              <ol className="mt-6 space-y-6">
                {analysis.suggestedQuestions.map((q, i) => (
                  <li key={q} className="flex gap-5">
                    <span className="font-display text-3xl leading-none text-accent tabular-nums">{i + 1}</span>
                    <p className="pt-1 font-display text-xl leading-snug">{q}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 border-t border-border pt-6">
                <Button asChild className="group">
                  <Link href="/interview/setup">
                    Practise in a live session <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </Reveal>

            {analysis.skills.length > 0 && (
              <Reveal className="mt-12 border-t border-border pt-5">
                <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Skills we found</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {analysis.skills.map((s) => (
                    <li key={s} className="rounded-full border border-border-strong px-3 py-1 text-sm">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              <Section title="Strengths" items={analysis.strengths} />
              <Section title="Strengthen before interviews" items={analysis.improvements} delay={0.05} />
              <Section title="Experience highlights" items={analysis.experience} />
              <Section title="Education" items={analysis.education} delay={0.05} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
