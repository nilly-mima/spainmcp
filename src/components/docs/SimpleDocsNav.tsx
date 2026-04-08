'use client';

import { usePathname } from 'fumadocs-core/framework';
import { useFooterItems } from 'fumadocs-ui/utils/use-footer-items';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'fumadocs-core/link';
import { DocsFooter } from './DocsFooter';

export function SimpleDocsNav() {
  const footerList = useFooterItems();
  const pathname = usePathname();

  const { previous, next } = useMemo(() => {
    const idx = footerList.findIndex((item) => pathname === item.url || pathname.startsWith(item.url + '/'));
    if (idx === -1) return {};
    return { previous: footerList[idx - 1], next: footerList[idx + 1] };
  }, [footerList, pathname]);

  return (
    <>
      <div className={`grid gap-4 ${previous && next ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {previous && (
          <Link
            href={previous.url}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <ChevronLeft size={16} />
            Anterior
          </Link>
        )}
        {next && (
          <Link
            href={next.url}
            className="flex items-center justify-end gap-2 rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Siguiente
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <DocsFooter />
    </>
  );
}
