import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Wordmark: a speech-mark glyph + serif name. No gradient tile, no brain icon. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2', className)} aria-label="InterviewAI home">
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground transition-transform duration-200 group-hover:-rotate-6"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v4A2.5 2.5 0 0 1 11.5 11H7l-3.2 2.6c-.33.27-.8.03-.8-.39V11A2.5 2.5 0 0 1 2 8.5v-4Z" />
        </svg>
      </span>
      <span className="font-display text-[22px] leading-none tracking-tight">
        Interview<span className="italic text-accent">AI</span>
      </span>
    </Link>
  );
}
