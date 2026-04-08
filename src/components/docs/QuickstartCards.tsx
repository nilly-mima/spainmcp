'use client';

import { PlugZap, Rocket } from 'lucide-react';
import Link from 'next/link';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PlugZap,
  Rocket,
};

interface QuickstartCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export function QuickstartCard({ title, description, href, icon }: QuickstartCardProps) {
  const Icon = ICONS[icon] ?? PlugZap;
  return (
    <Link
      href={href}
      className="block rounded-lg border border-[var(--border)] p-5 no-underline transition-colors hover:bg-[var(--border)]/30 dark:hover:bg-white/5"
    >
      <Icon className="mb-4 h-6 w-6 text-[var(--muted)]" />
      <p className="mb-1 text-sm font-semibold text-[var(--foreground)]">{title}</p>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </Link>
  );
}

export function QuickstartCards({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  );
}
