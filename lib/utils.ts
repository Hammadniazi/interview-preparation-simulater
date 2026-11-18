import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ScoreBreakdown } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function averageBreakdown(items: ScoreBreakdown[]): ScoreBreakdown {
  return {
    technicalKnowledge: average(items.map((s) => s.technicalKnowledge)),
    communication: average(items.map((s) => s.communication)),
    relevance: average(items.map((s) => s.relevance)),
    confidence: average(items.map((s) => s.confidence)),
  };
}

export function clampScore(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/* ---------------- Score bands ----------------
   Status colour is never the only signal: every band has a text label. */

export type ScoreBand = 'good' | 'fair' | 'poor';

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs work';
  return 'Weak';
}

export const bandText: Record<ScoreBand, string> = {
  good: 'text-good',
  fair: 'text-fair',
  poor: 'text-poor',
};

export const bandFill: Record<ScoreBand, string> = {
  good: 'bg-good',
  fair: 'bg-fair',
  poor: 'bg-poor',
};

export const bandSoft: Record<ScoreBand, string> = {
  good: 'bg-good-soft text-good',
  fair: 'bg-fair-soft text-fair',
  poor: 'bg-poor-soft text-poor',
};

export function getScoreColor(score: number): string {
  return bandText[scoreBand(score)];
}
