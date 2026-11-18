'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LETTERS = ['A', 'B', 'C', 'D'];

export function McqOptions({
  options,
  disabled,
  onSubmit,
}: {
  options: string[];
  disabled: boolean;
  onSubmit: (index: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selected !== null && !disabled) onSubmit(selected);
      }}
      className="space-y-3"
    >
      <fieldset disabled={disabled}>
        <legend className="sr-only">Choose one answer</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option, i) => {
            const checked = selected === i;
            return (
              <motion.label
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'flex min-h-12 items-start gap-3 rounded-lg border bg-surface px-3.5 py-3 text-sm transition-[border-color,box-shadow] duration-150',
                  'has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/25',
                  checked ? 'border-foreground shadow-[inset_0_0_0_1px_var(--foreground)]' : 'border-border hover:border-border-strong',
                  disabled && 'cursor-not-allowed opacity-60',
                )}
              >
                <input
                  type="radio"
                  name="mcq"
                  className="sr-only"
                  checked={checked}
                  onChange={() => setSelected(i)}
                />
                <span
                  aria-hidden
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-medium transition-colors',
                    checked ? 'border-foreground bg-foreground text-background' : 'border-border-strong text-muted-foreground',
                  )}
                >
                  {LETTERS[i]}
                </span>
                <span className="pt-0.5 leading-snug">{option}</span>
              </motion.label>
            );
          })}
        </div>
      </fieldset>
      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || selected === null}>
          Submit answer
        </Button>
      </div>
    </form>
  );
}
