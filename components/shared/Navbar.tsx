'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/interview/setup', label: 'Practice', match: '/interview' },
  { href: '/resume', label: 'Resume review', match: '/resume' },
  { href: '/dashboard', label: 'History', match: '/dashboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const inInterview = pathname.startsWith('/interview');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-200',
        scrolled || open ? 'border-border bg-background/90 backdrop-blur-md' : 'border-transparent bg-background/0',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, match }) => {
            const active = pathname.startsWith(match);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-foreground"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {!inInterview && (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/interview/setup">Start a session</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            className="border-t border-border md:hidden"
          >
            <ul className="space-y-1 px-4 py-3">
              {navLinks.map(({ href, label, match }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={pathname.startsWith(match) ? 'page' : undefined}
                    className="flex h-11 items-center rounded-lg px-3 text-[15px] text-foreground/85 hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="w-full">
                  <Link href="/interview/setup">Start a session</Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
