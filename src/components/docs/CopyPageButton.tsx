'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Copy, ChevronDown, FileText } from 'lucide-react';

function DropdownItem({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 w-full px-4 py-3 hover:bg-fd-muted transition-colors text-left"
    >
      <span className="mt-0.5 text-fd-muted-foreground flex-shrink-0">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-fd-foreground">{label}</span>
        <span className="block text-xs text-fd-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

function ChatGPTIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5zM12 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
    </svg>
  );
}

export function CopyPageButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const apiPath = pathname.replace(/^\/docs/, '/api/docs');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function getMarkdown() {
    const res = await fetch(apiPath);
    return res.text();
  }

  async function copyPage() {
    const text = await getMarkdown();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  }

  function viewMarkdown() {
    window.open(apiPath, '_blank');
    setOpen(false);
  }

  async function openInClaude() {
    const markdown = await getMarkdown();
    const prompt = `Lee esta documentación de SpainMCP y responde mis preguntas:\n\n${markdown}`;
    window.open(
      `https://claude.ai/new?q=${encodeURIComponent(prompt.slice(0, 4000))}`,
      '_blank',
    );
    setOpen(false);
  }

  async function openInChatGPT() {
    const markdown = await getMarkdown();
    const prompt = `Read this SpainMCP documentation and answer my questions:\n\n${markdown}`;
    window.open(
      `https://chatgpt.com/?q=${encodeURIComponent(prompt.slice(0, 4000))}`,
      '_blank',
    );
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <div className="flex items-center border border-fd-border rounded-lg overflow-hidden text-sm">
        <button
          onClick={copyPage}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-fd-muted transition-colors text-fd-foreground"
        >
          <Copy size={14} />
          {copied ? 'Copiado!' : 'Copiar página'}
        </button>
        <div className="w-px h-6 bg-fd-border" />
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center px-2 py-1.5 hover:bg-fd-muted transition-colors text-fd-foreground"
          aria-label="Más opciones"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-68 min-w-64 bg-fd-background border border-fd-border rounded-lg shadow-lg overflow-hidden">
          <DropdownItem
            icon={<Copy size={15} />}
            label="Copiar página"
            desc="Copiar página como Markdown para LLMs"
            onClick={copyPage}
          />
          <DropdownItem
            icon={<FileText size={15} />}
            label="Ver como Markdown ↗"
            desc="Ver esta página como texto plano"
            onClick={viewMarkdown}
          />
          <DropdownItem
            icon={<ChatGPTIcon />}
            label="Abrir en ChatGPT ↗"
            desc="Haz preguntas sobre esta página"
            onClick={openInChatGPT}
          />
          <DropdownItem
            icon={<ClaudeIcon />}
            label="Abrir en Claude ↗"
            desc="Haz preguntas sobre esta página"
            onClick={openInClaude}
          />
        </div>
      )}
    </div>
  );
}
