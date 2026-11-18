import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Enter } from '@/components/shared/Reveal';
import { SampleSession } from './SampleSession';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-60 dark:opacity-30" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <Enter>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              Mock interviews for 20 roles, beginner to expert
            </p>
          </Enter>

          <Enter delay={0.06}>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.98] tracking-[-0.02em]">
              Practise the interview <em className="text-accent">before</em> it counts.
            </h1>
          </Enter>

          <Enter delay={0.12}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A realistic interviewer for your role and level. Ten questions, specific feedback on every answer,
              and a four-week plan built from where you actually struggled.
            </p>
          </Enter>

          <Enter delay={0.18}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="group">
                <Link href="/interview/setup">
                  Start a session
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/resume">Review my resume</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Free · No sign-up · About 20 minutes</p>
          </Enter>
        </div>

        <Enter delay={0.2} y={16}>
          <SampleSession />
        </Enter>
      </div>
    </section>
  );
}
