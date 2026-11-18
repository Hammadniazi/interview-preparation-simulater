'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';

const MAX_CHARS = 6000;

export function Composer({ disabled, onSubmit }: { disabled: boolean; onSubmit: (text: string) => void }) {
  const [answer, setAnswer] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const onFinal = useCallback((t: string) => setAnswer((prev) => (prev ? `${prev} ${t}` : t).slice(0, MAX_CHARS)), []);
  const { isListening, isSupported, interimTranscript, startListening, stopListening } = useSpeechRecognition(onFinal);

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const canSend = !disabled && answer.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    if (isListening) stopListening();
    onSubmit(answer.trim());
    setAnswer('');
    ref.current?.focus();
  };

  // Stop the mic whenever input becomes unavailable.
  useEffect(() => {
    if (disabled && isListening) stopListening();
  }, [disabled, isListening, stopListening]);

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-poor opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-poor" />
            </span>
            <span className="font-medium text-foreground">Listening</span>
            <span className="truncate italic">{interimTranscript || 'Speak your answer…'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'rounded-xl border bg-surface transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20',
          isListening ? 'border-poor/60' : 'border-border-strong',
          disabled && 'opacity-60',
        )}
      >
        <label htmlFor="answer" className="sr-only">
          Your answer
        </label>
        <textarea
          id="answer"
          ref={ref}
          value={answer}
          maxLength={MAX_CHARS}
          disabled={disabled}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={disabled ? 'Waiting for the interviewer…' : 'Type your answer, or use the microphone'}
          rows={3}
          className="block max-h-64 min-h-24 w-full resize-none bg-transparent px-4 pt-3.5 text-base leading-relaxed placeholder:text-muted-foreground/80 focus:outline-none disabled:cursor-not-allowed sm:text-[15px] [field-sizing:content]"
        />
        <div className="flex items-center justify-between gap-3 px-2.5 pb-2.5">
          <p className="pl-1.5 text-xs text-muted-foreground tabular-nums">
            {words > 0 ? `${words} word${words === 1 ? '' : 's'}` : (
              <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={isListening ? 'secondary' : 'ghost'}
              size="icon"
              className={cn('h-9 w-9', isListening && 'text-poor')}
              onClick={isListening ? stopListening : startListening}
              disabled={disabled || !isSupported}
              aria-pressed={isListening}
              aria-label={!isSupported ? 'Voice input needs Chrome or Edge' : isListening ? 'Stop voice input' : 'Start voice input'}
              title={!isSupported ? 'Voice input needs Chrome or Edge' : undefined}
            >
              {isListening ? <Square className="fill-current" /> : <Mic />}
            </Button>
            <Button type="button" size="icon" className="h-9 w-9" onClick={submit} disabled={!canSend} aria-label="Send answer">
              <ArrowUp />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
