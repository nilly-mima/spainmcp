import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

const HTTP_METHODS: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#22c55e', color: '#fff' },
  POST:   { bg: '#3b82f6', color: '#fff' },
  PUT:    { bg: '#f59e0b', color: '#fff' },
  PATCH:  { bg: '#8b5cf6', color: '#fff' },
  DELETE: { bg: '#ef4444', color: '#fff' },
};

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) return;
    if (icon in HTTP_METHODS) {
      const { bg, color } = HTTP_METHODS[icon];
      return createElement('span', {
        style: {
          background: bg, color,
          fontSize: '0.52rem', fontWeight: 700,
          padding: '1px 5px', borderRadius: '3px',
          letterSpacing: '0.04em', lineHeight: 1.4,
          flexShrink: 0, fontFamily: 'monospace',
        },
      }, icon);
    }
    if (icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
});
