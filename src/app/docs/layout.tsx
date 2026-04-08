import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { DocThemeSwitch } from '@/components/docs/DocThemeSwitch';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

const linkCls = "flex items-center justify-between px-2 py-1.5 text-sm text-fd-muted-foreground hover:text-fd-foreground rounded-md hover:bg-fd-accent/50 transition-colors"
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5M9.5 2.5V7"/>
  </svg>
)
function SidebarFooter() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2 border-t border-fd-border">
      <a href="https://discord.gg/spainmcp" target="_blank" rel="noopener noreferrer" className={linkCls}>
        Soporte <ExternalIcon />
      </a>
      <a href="https://discord.gg/spainmcp" target="_blank" rel="noopener noreferrer" className={linkCls}>
        Discord <ExternalIcon />
      </a>
    </div>
  )
}

function NavThemeSwitch() {
  return <DocThemeSwitch className="scale-[0.8] origin-left" />
}

// Sin <a> propio — Fumadocs envuelve el ReactNode en <a href={nav.url}>
const Logo = () => (
  <span className="flex items-center gap-2 font-bold text-base hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#2563EB"/>
      <rect x="11" y="1"  width="8" height="8" rx="2" fill="#2563EB"/>
      <rect x="1"  y="11" width="8" height="8" rx="2" fill="#2563EB"/>
      <rect x="11" y="11" width="8" height="8" rx="2" fill="#2563EB"/>
    </svg>
    SpainMCP
  </span>
);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{ enabled: false }}
      i18n={{ locale: 'es', translations: { toc: 'En esta página', tocNoHeadings: 'Sin encabezados', lastUpdate: 'Última actualización', searchNoResult: 'Sin resultados', previousPage: 'Anterior', nextPage: 'Siguiente', chooseLanguage: 'Elige idioma', feedbackQuestion: '¿Te ha sido útil esta página?', feedbackYes: 'Sí', feedbackNo: 'No' } }}
    >
      <DocsLayout
        tree={source.pageTree}
        nav={{
          title: <Logo />,
          url: '/',
          transparentMode: 'none',
          children: <NavThemeSwitch />,
        }}
        themeSwitch={{ enabled: false }}
        sidebar={{
          banner: null,
          collapsible: false,
          footer: <SidebarFooter />,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
