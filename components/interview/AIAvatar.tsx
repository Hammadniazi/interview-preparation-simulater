'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIAvatarProps {
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AIAvatar({ isThinking = false, size = 'md' }: AIAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30`}
        animate={isThinking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Brain className={`${iconSizes[size]} text-white`} />
      </motion.div>
      {/* Pulse ring when thinking */}
      {isThinking && (
        <motion.div
          className={`absolute inset-0 ${sizes[size]} rounded-2xl border-2 border-violet-500`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {/* Online indicator */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
    </div>
  );
}
