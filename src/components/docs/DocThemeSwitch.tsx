'use client';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
function cn(...classes: (string | undefined | false)[]) { return classes.filter(Boolean).join(' '); }

export function DocThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Cambiar tema"
      className={cn(
        'inline-flex items-center rounded-full border p-1 overflow-hidden',
        className,
      )}
    >
      {(['light', 'dark'] as const).map((key) => {
        const Icon = key === 'light' ? Sun : Moon;
        const active = resolvedTheme === key;
        return (
          <Icon
            key={key}
            fill="currentColor"
            className={cn(
              'size-6.5 p-1.5 rounded-full',
              active
                ? 'bg-fd-accent text-fd-accent-foreground'
                : 'text-fd-muted-foreground',
            )}
          />
        );
      })}
    </button>
  );
}
