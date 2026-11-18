import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Hanken_Grotesk, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Navbar } from '@/components/shared/Navbar';

const display = Instrument_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const body = Hanken_Grotesk({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'InterviewAI — mock interviews with honest feedback',
    template: '%s · InterviewAI',
  },
  description:
    'Practise realistic job interviews, get specific feedback on every answer, and leave with a four-week plan to close your gaps.',
  keywords: ['interview preparation', 'mock interview', 'job interview practice', 'interview feedback'],
  openGraph: {
    title: 'InterviewAI — mock interviews with honest feedback',
    description:
      'Practise realistic job interviews, get specific feedback on every answer, and leave with a four-week plan.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f3ee' },
    { media: '(prefers-color-scheme: dark)', color: '#131312' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-[15px] leading-relaxed antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
