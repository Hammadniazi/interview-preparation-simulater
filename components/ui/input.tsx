import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-base text-foreground transition-colors placeholder:text-muted-foreground/80 hover:border-foreground/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px] aria-[invalid=true]:border-poor',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
