'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Wraps the Web Speech API for continuous voice-to-text input.
 *
 * - Fires `onFinalTranscript` each time a sentence is confirmed
 * - `interimTranscript` holds the in-progress phrase for live preview
 * - Auto-restarts transparently when Chrome ends the session after silence
 */
export function useSpeechRecognition(
  onFinalTranscript: (text: string) => void
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  // Stable ref so closures inside recognition callbacks always call the latest version
  const callbackRef = useRef(onFinalTranscript);
  const startSessionRef = useRef<() => void>(() => {});

  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  });

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  const startSession = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
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

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      // no-speech = expected silence; audio-capture = mic not ready yet — not real errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') return;
      shouldRestartRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
    };

    rec.onend = () => {
      setInterimTranscript('');
      if (shouldRestartRef.current) {
        // Chrome ends the session after ~60 s of silence even with continuous:true.
        // Restart transparently so the user never notices.
        startSessionRef.current();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // Another instance may already be running; ignore the error
    }
  }, []);

  // Keep the ref pointing at the latest startSession
  useEffect(() => {
    startSessionRef.current = startSession;
  }, [startSession]);

  const startListening = useCallback(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;
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
