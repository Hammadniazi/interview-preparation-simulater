'use client';

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = (props: ToasterProps) => {
  const { resolvedTheme = 'light' } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      position="bottom-right"
      duration={4000}
      icons={{
        success: <CircleCheck className="h-4 w-4 text-good" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4 text-fair" />,
        error: <OctagonX className="h-4 w-4 text-poor" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: '!bg-surface !text-foreground !border-border !rounded-xl !shadow-lg !font-sans',
          description: '!text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
