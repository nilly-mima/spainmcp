'use client';
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(systemDark ? 'dark' : 'light');
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  return { theme, setTheme, resolvedTheme: theme };
}
