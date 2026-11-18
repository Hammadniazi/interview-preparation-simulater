import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/shared/Reveal';

export function CTA() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-primary-foreground sm:px-14 sm:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Your next interview is a rehearsal away.
          </h2>
          <Button asChild size="lg" className="group self-start bg-primary-foreground text-primary hover:bg-primary-foreground/90 md:self-auto">
            <Link href="/interview/setup">
              Start a session
              <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
