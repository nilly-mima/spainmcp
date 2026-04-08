'use client';

import { Library } from 'lucide-react';
import Link from 'next/link';

interface ConceptCardProps {
  title: string;
  description: string;
  href: string;
}

export function ConceptCard({ title, description, href }: ConceptCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-[var(--border)] p-4 no-underline transition-colors hover:bg-[var(--border)]/30 dark:hover:bg-white/5"
    >
      <Library className="mb-3 h-5 w-5 text-[var(--muted)]" />
      <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
