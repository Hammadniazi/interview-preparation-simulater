import { Reveal } from '@/components/shared/Reveal';

const features = [
  {
    title: 'Questions for your actual job',
    body: 'Twenty roles, from frontend to engineering manager, at four levels. Technical, behavioral, system design, HR or a mix.',
  },
  {
    title: 'Feedback you can act on',
    body: 'Not "great answer!" Each response gets four calibrated scores and the single most useful thing to change next time.',
  },
  {
    title: 'Speak or type',
    body: 'Answer out loud with voice input in Chrome or Edge to practise the way you will actually be interviewed.',
  },
  {
    title: 'Questions from your resume',
    body: 'Upload a PDF or DOCX and get the questions an interviewer would most likely ask about your own experience.',
  },
  {
    title: 'A plan, not just a score',
    body: 'Your debrief ends with four weeks of topics, well-known resources and a measurable goal for each week.',
  },
  {
    title: 'Private by default',
    body: 'No account needed. Your history is tied to this browser only and is never shown to anyone else.',
  },
];

export function Features() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="text-sm text-muted-foreground">What you get</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Built to make the real thing feel familiar.
          </h2>
        </Reveal>

        <dl className="grid gap-x-10 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 0.06} className="border-t border-border py-6">
              <dt className="font-semibold">{f.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
