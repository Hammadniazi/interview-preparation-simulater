'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

/** Resolve CSS colour tokens to concrete values (SVG presentation attributes can't use var()). */
export function useThemeColors<T extends string>(names: readonly T[]): Record<T, string> {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<Record<T, string>>(
    () => Object.fromEntries(names.map((n) => [n, 'currentColor'])) as Record<T, string>,
  );
  const key = names.join(',');

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must read computed styles after the theme class applies
    setColors(Object.fromEntries(key.split(',').map((n) => [n, style.getPropertyValue(`--${n}`).trim() || 'currentColor'])) as Record<T, string>);
  }, [resolvedTheme, key]);

  return colors;
}
