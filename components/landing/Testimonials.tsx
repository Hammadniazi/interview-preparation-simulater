'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer at Google',
    avatar: 'SC',
    bg: 'from-violet-400 to-purple-500',
    content: 'InterviewAI helped me land my dream job at Google. The AI questions were surprisingly close to the actual interview, and the feedback was incredibly detailed and actionable.',
    stars: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Software Engineer at Meta',
    avatar: 'MJ',
    bg: 'from-blue-400 to-indigo-500',
    content: 'I practiced for 2 weeks using InterviewAI before my Meta interviews. The system design questions were excellent and the personalized roadmap helped me fill critical gaps.',
    stars: 5,
  },
  {
    name: 'Priya Patel',
    role: 'ML Engineer at OpenAI',
    avatar: 'PP',
    bg: 'from-emerald-400 to-teal-500',
    content: 'The resume analysis feature is brilliant. It identified skills I had that I wasn\'t even highlighting, and the practice questions matched my background perfectly.',
    stars: 5,
  },
  {
    name: 'David Kim',
    role: 'Backend Developer at Stripe',
    avatar: 'DK',
    bg: 'from-orange-400 to-red-500',
    content: 'Went from bombing interviews to 3 offers in 6 weeks. The real-time scoring and specific feedback on each answer made all the difference in my preparation.',
    stars: 5,
  },
  {
    name: 'Emma Wilson',
    role: 'Full Stack Developer at Airbnb',
    avatar: 'EW',
    bg: 'from-pink-400 to-rose-500',
    content: 'The behavioral interview practice is outstanding. The AI gives feedback on both content and how you structure your answers. My communication score jumped 30 points!',
    stars: 5,
  },
  {
    name: 'Alex Thompson',
    role: 'Cloud Architect at AWS',
    avatar: 'AT',
    bg: 'from-cyan-400 to-blue-500',
    content: 'The 30-day learning roadmap was exactly what I needed. Each week had clear goals and specific resources. Went from intermediate to landing a senior architect role.',
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 tracking-wider uppercase">
            Success Stories
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2 mb-4">
            Loved by engineers worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who leveled up their interview skills with InterviewAI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/30 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-violet-600/20 absolute top-4 right-4" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.bg} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
