'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Link from 'next/link'

export default function ApiKeysPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user?.email) {
        router.replace('/login?next=/account/api-keys')
        return
      }
      setEmail(user.email)

      const res = await fetch(`/api/account/keys?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const json = await res.json()
        setHasKey(json.has_key ?? false)
      }
      setLoading(false)
    })
  }, [router])

  async function handleGetKey() {
    setLoading(true)
    const res = await fetch('/api/keys/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()
    if (json.success) {
      alert(`Tu nueva API key: ${json.key}\n\nGuárdala ahora — no se mostrará de nuevo.`)
      setHasKey(true)
    } else {
      alert(`Error: ${json.error}`)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col gap-4">
        <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Mis API Keys</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{email}</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[var(--foreground)]">API Key de SpainMCP</p>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Necesaria para publicar MCPs via CLI o API
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
            hasKey
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              : 'bg-stone-50 dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-700'
          }`}>
            {hasKey ? 'Activa' : 'Sin key'}
          </span>
        </div>

        {hasKey ? (
          <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-4 text-sm text-[var(--muted)]">
            <p>Tu key termina en <span className="font-mono">••••</span> (por seguridad no la mostramos).</p>
            <p className="mt-2">Si la has perdido, genera una nueva — la anterior quedará invalidada.</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No tienes ninguna key activa. Genera una para empezar a publicar MCPs.
          </p>
        )}

        <button
          onClick={handleGetKey}
          disabled={loading}
          className="self-start px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {hasKey ? 'Regenerar key' : 'Generar key'}
        </button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-sm text-[var(--muted)] flex flex-col gap-2">
        <p className="font-medium text-[var(--foreground)]">Cómo usar tu key</p>
        <code className="font-mono text-xs bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-lg block">
          spainmcp publish --key sk-spainmcp-...
        </code>
        <Link href="/docs" className="text-orange-600 hover:underline text-xs">Ver documentación →</Link>
      </div>
    </div>
  )
}
