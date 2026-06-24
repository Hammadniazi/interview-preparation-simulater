'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIAvatar } from './AIAvatar';
import { Message } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  isEvaluating: boolean;
  onSubmitAnswer: (answer: string) => void;
  candidateName: string;
  jobRole: string;
  isComplete: boolean;
  mcqOptions?: string[] | null;
}

const MCQ_LABELS = ['A', 'B', 'C', 'D'];

export function ChatInterface({
  messages,
  isLoading,
  isEvaluating,
  onSubmitAnswer,
  candidateName,
  jobRole,
  isComplete,
  mcqOptions,
}: ChatInterfaceProps) {
  const [answer, setAnswer] = useState('');
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isProcessing = isLoading || isEvaluating;
  const isMcq = !!(mcqOptions && mcqOptions.length === 4);

  // Each confirmed speech sentence is appended to the answer box
  const handleFinalTranscript = useCallback((text: string) => {
    setAnswer(prev => (prev ? prev + ' ' : '') + text);
  }, []);

  const { isListening, isSupported, interimTranscript, startListening, stopListening } =
    useSpeechRecognition(handleFinalTranscript);

  // Stop mic when interview ends or switches to MCQ (no free-text needed)
  useEffect(() => {
    if ((isComplete || isMcq) && isListening) stopListening();
  }, [isComplete, isMcq, isListening, stopListening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setSelectedMcq(null);
  }, [mcqOptions]);

  const handleSubmit = () => {
    if (isProcessing || isComplete) return;
    if (isMcq) {
      if (selectedMcq === null) return;
      const label = MCQ_LABELS[selectedMcq];
      onSubmitAnswer(`${label}) ${mcqOptions![selectedMcq]}`);
      setSelectedMcq(null);
    } else {
      const trimmed = answer.trim();
      if (!trimmed) return;
      if (isListening) stopListening();
      onSubmitAnswer(trimmed);
      setAnswer('');
      textareaRef.current?.focus();
    }
  };

  const handleMcqSelect = (index: number) => {
    if (isProcessing || isComplete) return;
    setSelectedMcq(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleListening = () => {
    if (!isSupported) return;
    isListening ? stopListening() : startListening();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <AIAvatar isThinking={isLoading} size="sm" />
        <div>
          <div className="font-semibold text-sm">InterviewAI</div>
          <div className="text-xs text-muted-foreground">
            {isLoading ? 'Generating question...' : isEvaluating ? 'Evaluating answer...' : `Interviewing for ${jobRole}`}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full', isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500')} />
          <span className="text-xs text-muted-foreground">
            {isProcessing ? 'Processing...' : 'Live'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <AIAvatar size="lg" />
              <h3 className="mt-4 font-semibold">Interview Starting</h3>
              <p className="text-sm text-muted-foreground mt-1">Preparing your first question...</p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {message.role === 'assistant' ? (
                  <div className="shrink-0 mt-1">
                    <AIAvatar size="sm" />
                  </div>
                ) : (
                  <div className="shrink-0 mt-1 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  message.role === 'assistant'
                    ? 'rounded-tl-sm bg-muted/60 dark:bg-muted/40'
                    : 'rounded-tr-sm bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-200 dark:border-violet-800'
                )}>
                  <p>{message.content}</p>
                  <div className={cn(
                    'text-[10px] mt-1.5 opacity-60',
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <AIAvatar size="sm" isThinking />
              <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-violet-500"
                      animate={{ y: ['0%', '-50%', '0%'] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {isEvaluating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2"
            >
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              Analyzing your response...
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <AIAvatar size="sm" />
              <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-200 dark:border-violet-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                <p className="font-medium text-violet-700 dark:text-violet-300">Interview Complete!</p>
                <p className="text-muted-foreground mt-1">
                  Excellent work, {candidateName}! I&apos;ve finished evaluating all your answers.
                  Your comprehensive report is being generated now.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            {isMcq ? (
              <div className="space-y-2">
                {mcqOptions!.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMcqSelect(index)}
                    disabled={isProcessing}
                    className={cn(
                      'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all duration-150',
                      selectedMcq === index
                        ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium'
                        : 'border-border hover:border-violet-300 hover:bg-muted/50',
                      isProcessing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className={cn(
                      'shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-colors',
                      selectedMcq === index
                        ? 'border-violet-500 bg-violet-500 text-white'
                        : 'border-border text-muted-foreground'
                    )}>
                      {MCQ_LABELS[index]}
                    </span>
                    {option}
                  </motion.button>
                ))}
                <Button
                  onClick={handleSubmit}
                  disabled={selectedMcq === null || isProcessing}
                  className="w-full mt-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Textarea + action buttons */}
                <div className="relative flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isListening
                        ? 'Speak now — your words will appear here...'
                        : isLoading
                        ? 'Waiting for question...'
                        : 'Type your answer... (Enter to submit, Shift+Enter for new line)'
                    }
                    className={cn(
                      'min-h-[80px] max-h-[200px] resize-none pr-24 text-sm transition-colors',
                      isListening && 'border-red-400 dark:border-red-500 focus-visible:ring-red-400'
                    )}
                    disabled={isProcessing}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-1.5">
                    {/* Mic button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleListening}
                      disabled={!isSupported || isProcessing}
                      title={
                        !isSupported
                          ? 'Voice input requires Chrome or Edge'
                          : isListening
                          ? 'Stop recording'
                          : 'Start voice input'
                      }
                      className={cn(
                        'h-8 w-8 transition-all',
                        isListening
                          ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-600'
                          : !isSupported
                          ? 'opacity-30 cursor-not-allowed'
                          : ''
                      )}
                    >
                      {isListening ? (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <MicOff className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Send button */}
                    <Button
                      size="icon"
                      onClick={handleSubmit}
                      disabled={!answer.trim() || isProcessing}
                      className="h-8 w-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Live listening indicator + interim transcript */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/5 border border-red-500/20 rounded-lg overflow-hidden"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 shrink-0">
                        Listening
                      </span>
                      {interimTranscript ? (
                        <span className="text-xs text-muted-foreground italic truncate">
                          &ldquo;{interimTranscript}&rdquo;
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Say your answer aloud...
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hint text */}
                {!isListening && (
                  <p className="text-xs text-muted-foreground text-center">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Be thorough and specific. The AI evaluates depth, clarity, and relevance.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
