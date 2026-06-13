'use client';

import { motion } from 'framer-motion';
import { Settings, MessageSquare, BarChart3, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Settings,
    title: 'Configure Your Interview',
    description: 'Choose your target role, experience level, difficulty, and interview type. Get a fully personalized session.',
    color: 'from-violet-600 to-purple-600',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Practice with AI',
    description: 'Answer 10 dynamically generated questions in a realistic chat interface. The AI adapts based on your responses.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Get Instant Analysis',
    description: 'Receive detailed scores across 4 dimensions with specific feedback on every answer you give.',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    number: '04',
    icon: Download,
    title: 'Follow Your Roadmap',
    description: 'Download your full report with a personalized 30-day learning plan to close your skill gaps.',
    color: 'from-orange-600 to-red-600',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 tracking-wider uppercase">
            Simple Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2 mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From setup to improvement in 4 straightforward steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              <div className="flex justify-center mb-6">
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                </div>
              </div>
              <div className="text-5xl font-black text-muted-foreground/10 absolute top-4 left-1/2 -translate-x-1/2 select-none">
                {step.number}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
