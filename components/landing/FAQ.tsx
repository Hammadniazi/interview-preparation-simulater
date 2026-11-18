import { Plus } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';

const faqs = [
  {
    q: 'Is it really free?',
    a: 'Yes. There is no account and no paywall. The AI runs on Groq, so sessions are fast.',
  },
  {
    q: 'How accurate is the scoring?',
    a: 'It is a calibrated estimate from a large language model, not a hiring decision. Use it to spot patterns across sessions, like vague answers or missing examples, rather than chasing a single number.',
  },
  {
    q: 'What happens to my answers?',
    a: 'Answers are sent to the AI provider to be scored. Finished reports are saved to this browser, and to the app database if one is configured, linked to an anonymous ID that only this browser holds.',
  },
  {
    q: 'Can I use my voice?',
    a: 'Yes, in Chrome and Edge. Press the microphone, speak, and your words appear in the answer box so you can edit before sending.',
  },
];

export function FAQ() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Questions, answered.</h2>
        </Reveal>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group py-1">
              <summary className="flex min-h-14 list-none items-center justify-between gap-6 py-3 text-left font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <Plus aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
