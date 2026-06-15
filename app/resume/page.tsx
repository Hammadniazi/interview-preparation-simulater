'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, CheckCircle2, AlertCircle,
  Zap, Code, BookOpen, ArrowRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeAnalysis } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
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
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file && !textInput.trim()) {
      setError('Please upload a resume file or paste your resume text.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }
      if (textInput.trim()) {
        formData.append('text', textInput.trim());
      }

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTextInput('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Upload your resume and get AI-generated interview questions tailored to your background.
          </p>
        </motion.div>

        {!analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="upload">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="upload">File Upload</TabsTrigger>
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-4">
                    {/* Dropzone */}
                    <div
                      {...getRootProps()}
                      className={cn(
                        'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
                        isDragActive
                          ? 'border-violet-500 bg-violet-500/5'
                          : file
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'border-border hover:border-violet-500/50 hover:bg-muted/30'
                      )}
                    >
                      <input {...getInputProps()} />
                      <AnimatePresence mode="wait">
                        {file ? (
                          <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-2"
                          >
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setFile(null); }}
                              className="gap-1 text-xs"
                            >
                              <X className="w-3 h-3" />
                              Remove
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                          >
                            <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto" />
                            <div>
                              <p className="font-medium">
                                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                or click to browse files
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF, DOCX, TXT up to 5MB
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      PDF, DOCX, and TXT files are all supported. For scanned PDFs, use the &ldquo;Paste Text&rdquo; tab.
                    </p>
                  </TabsContent>

                  <TabsContent value="paste" className="mt-4">
                    <div className="space-y-2">
                      <Label>Paste your resume content</Label>
                      <Textarea
                        placeholder="Paste your resume text here... Include your work experience, skills, education, and any relevant projects."
                        className="min-h-[250px] text-sm resize-none"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {textInput.length} characters
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (!file && !textInput.trim())}
                  className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700 h-12 text-base font-semibold"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-lg">Analysis Complete</h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <X className="w-4 h-4" />
                New Analysis
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skills */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code className="w-4 h-4 text-violet-500" />
                    Detected Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card className="border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Profile Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Experience Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.experience.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Areas to Highlight More
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Suggested Questions */}
            <Card className="border-violet-500/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-500" />
                  Personalized Interview Questions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  These questions are generated based on your specific background and experience.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {analysis.suggestedQuestions.map((q, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm">{q}</p>
                    </motion.li>
                  ))}
                </ol>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to practice these questions with an AI interviewer?
                  </p>
                  <Link href="/interview/setup">
                    <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700">
                      Start Practice Interview
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
