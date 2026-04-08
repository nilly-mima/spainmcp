'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

export function PageFeedback() {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  if (voted) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {voted === 'yes' ? '¡Gracias por tu respuesta!' : 'Gracias. Trabajaremos para mejorarla.'}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-[var(--muted)]">¿Te ha sido útil esta página?</span>
      <div className="flex gap-2">
        <button
          onClick={() => setVoted('yes')}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
        >
          <ThumbsUp size={14} />
          Sí
        </button>
        <button
          onClick={() => setVoted('no')}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
        >
          <ThumbsDown size={14} />
          No
        </button>
      </div>
    </div>
  );
}
