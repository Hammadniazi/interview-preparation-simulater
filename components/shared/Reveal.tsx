'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + short rise when scrolled into view. One shared motion vocabulary for the whole app. */
export function Reveal({
  delay = 0,
  y = 12,
  once = true,
  as = 'div',
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number; once?: boolean; as?: 'div' | 'li' }) {
  const Comp = (as === 'li' ? motion.li : motion.div) as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      {...props}
    />
  );
}

/** Same as Reveal but plays on mount (for above-the-fold content). */
export function Enter({ delay = 0, y = 10, ...props }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      {...props}
    />
  );
}
