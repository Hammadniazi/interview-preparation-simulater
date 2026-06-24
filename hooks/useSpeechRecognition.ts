'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Use a local interface so we never reference the global SpeechRecognition
// type that Next.js's build worker fails to resolve even with lib:["dom"].
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface RecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): { transcript: string };
  [index: number]: { transcript: string };
}

interface RecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: { length: number; item(i: number): RecognitionResult; [i: number]: RecognitionResult };
}

interface RecognitionErrorEvent extends Event {
  readonly error: string;
}

type RecognitionConstructor = new () => Recognition;

function getRecognitionClass(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Wraps the Web Speech API for continuous voice-to-text input.
 *
 * - Fires `onFinalTranscript` each time a sentence is confirmed.
 * - `interimTranscript` holds the in-progress phrase for live preview.
 * - Auto-restarts when Chrome silently ends the session after ~60 s of
 *   silence (happens even with continuous:true).
 */
export function useSpeechRecognition(
  onFinalTranscript: (text: string) => void
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<Recognition | null>(null);
  const shouldRestartRef = useRef(false);
  const callbackRef = useRef(onFinalTranscript);
  const startSessionRef = useRef<() => void>(() => {});

  // Keep callback ref current without triggering recognition restarts
  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  });

  useEffect(() => {
    setIsSupported(getRecognitionClass() !== null);
  }, []);

  const startSession = useCallback(() => {
    const SR = getRecognitionClass();
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (event: RecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          callbackRef.current(text.trim());
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (event: RecognitionErrorEvent) => {
      // no-speech = expected silence; audio-capture = mic warmup — not real errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') return;
      shouldRestartRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
    };

    rec.onend = () => {
      setInterimTranscript('');
      if (shouldRestartRef.current) {
        // Chrome ends the session after ~60 s of silence; restart transparently
        startSessionRef.current();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // Swallow "already started" errors from rapid toggles
    }
  }, []);

  useEffect(() => {
    startSessionRef.current = startSession;
  }, [startSession]);

  const startListening = useCallback(() => {
    if (!getRecognitionClass()) return;
    shouldRestartRef.current = true;
    setIsListening(true);
    startSession();
  }, [startSession]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Abort on unmount (covers navigating away mid-interview)
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { isListening, isSupported, interimTranscript, startListening, stopListening };
}
