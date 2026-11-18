import { Reveal } from '@/components/shared/Reveal';

const steps = [
  { title: 'Set the scene', body: 'Pick the role, level and interview style. Beginner sessions use multiple choice; the rest are open answers.' },
  { title: 'Answer ten questions', body: 'Type or speak your answers. Questions get harder as you go, and never repeat within a session.' },
  { title: 'Read the feedback', body: 'Every answer is scored on technical depth, communication, relevance and confidence, with one concrete fix.' },
  { title: 'Follow the plan', body: 'Finish with a debrief and a four-week study plan aimed at the gaps you showed. Export it as a PDF.' },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-sm text-muted-foreground">How a session works</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Twenty minutes, start to debrief.
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.06} className="flex flex-col bg-background p-6 sm:p-7">
                <span className="font-display text-5xl leading-none text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-8 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
