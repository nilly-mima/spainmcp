'use client'

import { useState } from 'react'

type Tab = 'cli' | 'typescript'

function CopyIcon({ onClick }: { onClick: () => void }) {
  const [done, setDone] = useState(false)
  const handle = () => {
    onClick()
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }
  return (
    <button onClick={handle} className="text-stone-400 hover:text-stone-600 transition-colors shrink-0" title="Copiar">
      {done ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  )
}

function Block({ children, copyText }: { children: React.ReactNode; copyText: string }) {
  return (
    <div
      className="relative rounded-xl px-5 py-4 font-mono text-sm leading-7 text-stone-800 dark:text-stone-200"
      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
    >
      <div className="absolute top-3.5 right-4">
        <CopyIcon onClick={() => navigator.clipboard.writeText(copyText)} />
      </div>
      <div className="pr-6">{children}</div>
    </div>
  )
}

const g  = (t: string) => <span className="text-stone-400 italic">{t}</span>
const b  = (t: string) => <span className="text-blue-600">{t}</span>
const or = (t: string) => <span className="text-orange-600 font-medium">{t}</span>
const gr = (t: string) => <span className="text-emerald-600 italic">{t}</span>
const am = (t: string) => <span className="text-amber-700">{t}</span>

export default function HowToConnect() {
  const [tab, setTab] = useState<Tab>('cli')

  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">Conecta en segundos</h2>
        <p className="text-stone-500 dark:text-stone-400 max-w-md">
          Tres comandos. Tu IA conectada a cualquier herramienta del directorio.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--border)' }}>
        {(['cli', 'typescript'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white dark:bg-[var(--card)] text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            {t === 'cli' ? '>_ CLI' : 'ts TypeScript'}
          </button>
        ))}
      </div>

      {/* Code blocks */}
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {tab === 'cli' ? (
          <>
            <Block copyText="npm install -g @anthropic-ai/claude-code">
              <div>{g('# Paso 1 — Instala Claude Code')}</div>
              <div>{b('npm')} install -g @anthropic-ai/claude-code</div>
            </Block>

            <Block copyText="claude mcp add github">
              <div>{g('# Paso 2 — Añade un servidor MCP del directorio')}</div>
              <div>{or('claude')} mcp {b('add')} github</div>
              <div>{gr('# → ✓ GitHub MCP añadido correctamente')}</div>
            </Block>

            <Block copyText={'claude "Lista mis repositorios de GitHub"'}>
              <div>{g('# Paso 3 — Habla con Claude, ya tiene acceso')}</div>
              <div>{or('claude')} {am('"Lista mis repositorios de GitHub"')}</div>
            </Block>
          </>
        ) : (
          <>
            <Block copyText={`import Anthropic from "@anthropic-ai/sdk";\n\nconst client = new Anthropic();`}>
              <div>{b('import')} Anthropic {b('from')} {am('"@anthropic-ai/sdk"')}<span className="text-stone-700">;</span></div>
              <div>&nbsp;</div>
              <div><span className="text-blue-600">const</span> client = <span className="text-blue-600">new</span> <span className="text-stone-700">Anthropic()</span><span className="text-stone-700">;</span></div>
            </Block>

            <Block copyText={`const response = await client.messages.create({\n  model: "claude-opus-4-5",\n  max_tokens: 1024,\n  mcp_servers: [{ type: "url", url: "https://mcp.github.com" }],\n  messages: [{ role: "user", content: "Lista mis repositorios" }],\n});`}>
              <div><span className="text-blue-600">const</span> response = <span className="text-blue-600">await</span> client.messages.<span className="text-orange-600">create</span>({'({'}</div>
              <div>&nbsp; model: {am('"claude-opus-4-5"')},</div>
              <div>&nbsp; max_tokens: <span className="text-teal-600">1024</span>,</div>
              <div>&nbsp; mcp_servers: [{'{'} type: {am('"url"')}, url: {am('"https://mcp.github.com"')} {'}'}],</div>
              <div>&nbsp; messages: [{'{'} role: {am('"user"')}, content: {am('"Lista mis repos"')} {'}'}],</div>
              <div>{'});'}</div>
            </Block>
          </>
        )}
      </div>
    </section>
  )
}
