'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const featured = {
  name: 'Marcus Johnson',
  role: 'Software Engineer at Meta',
  avatar: 'MJ',
  bg: 'from-blue-400 to-indigo-500',
  content: 'I practiced for 2 weeks using InterviewAI before my Meta interviews. The system design questions were excellent and the personalized roadmap helped me fill critical gaps. I went in more confident than I\'ve ever felt.',
  stars: 5,
};

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
    content: 'Went from bombing interviews to 3 offers in 6 weeks. The real-time scoring and specific feedback on each answer made all the difference.',
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

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

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

        {/* Featured testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 mb-6"
        >
          <Quote className="w-10 h-10 text-violet-500/20 absolute top-6 right-6" />
          <StarRating count={featured.stars} />
          <p className="text-base sm:text-lg leading-relaxed text-foreground mt-4 mb-6 max-w-3xl">
            &ldquo;{featured.content}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${featured.bg} flex items-center justify-center text-white text-sm font-bold`}>
              {featured.avatar}
            </div>
            <div>
              <div className="font-semibold text-sm">{featured.name}</div>
              <div className="text-xs text-muted-foreground">{featured.role}</div>
            </div>
          </div>
        </motion.div>

        {/* Grid of remaining testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:grid-cols-5 xl:gap-4">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="relative p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/30 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <Quote className="w-6 h-6 text-violet-600/15 absolute top-4 right-4" />
              <StarRating count={t.stars} />
              <p className="text-sm leading-relaxed text-muted-foreground my-4 flex-1">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-xs">{t.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
