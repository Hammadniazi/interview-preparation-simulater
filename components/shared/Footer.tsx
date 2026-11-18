import Link from 'next/link';
import { Logo } from './Logo';

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Hammadniazi' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hammad-khan-902bb7b7/' },
  { label: 'Portfolio', href: 'https://hammad-portfolio-site.netlify.app/' },
];

const productLinks = [
  { label: 'Practice interview', href: '/interview/setup' },
  { label: 'Resume review', href: '/resume' },
  { label: 'History', href: '/dashboard' },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">
            A quiet place to rehearse interviews and get specific, honest feedback before it counts.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Product</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {productLinks.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-foreground/85 underline-offset-4 hover:text-foreground hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Maker</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {socialLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/85 underline-offset-4 hover:text-foreground hover:underline"
                >
                  {label} <span aria-hidden>↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} InterviewAI</p>
          <p>Built by Hammad · AI inference by Groq</p>
        </div>
      </div>
    </footer>
  );
}
