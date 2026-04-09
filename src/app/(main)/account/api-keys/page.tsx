'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'
import { usePlan } from '@/hooks/usePlan'

type ApiKey = {
  id: string
  key_preview: string
  name: string
  is_default: boolean
  created_at: string
}

export default function ApiKeysPage() {
  const router = useRouter()
  const { tier } = usePlan()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user?.email) {
        router.replace('/login?redirect=/account/api-keys')
        return
      }
      setEmail(user.email)
      await loadKeys(user.email)
      setLoading(false)
    })
  }, [router])

  async function loadKeys(e?: string) {
    const res = await fetch(`/api/account/keys?email=${encodeURIComponent(e || email)}`)
    if (res.ok) {
      const json = await res.json()
      if (json.keys) {
        setKeys(json.keys)
      } else if (json.has_key) {
        setKeys([{ id: '1', key_preview: '••••••••dbe8', name: 'Unnamed Key', is_default: true, created_at: new Date().toISOString() }])
      } else {
        setKeys([])
      }
    }
  }

  async function handleCreate() {
    if (tier === 'free' && keys.length >= 3) {
      setShowUpgradeModal(true)
      return
    }
    setLoading(true)
    const res = await fetch('/api/keys/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.status === 403) {
      setShowUpgradeModal(true)
      setLoading(false)
      return
    }
    const json = await res.json()
    if (json.success) {
      alert(`Tu nueva API key: ${json.key}\n\nGuardala ahora — no se mostrara de nuevo.`)
      await loadKeys()
    } else {
      alert(`Error: ${json.error}`)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Estas seguro? Esta accion no se puede deshacer.')) return
    const res = await fetch(`/api/account/keys?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setKeys(k => k.filter(key => key.id !== id))
    } else {
      alert('Error al eliminar la key')
    }
  }

  function handleEditStart(key: ApiKey) {
    setEditingId(key.id)
    setEditName(key.name)
  }

  async function handleEditSave() {
    if (editingId) {
      const res = await fetch(`/api/account/keys?email=${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: editName }),
      })
      if (res.ok) {
        setKeys(k => k.map(key => key.id === editingId ? { ...key, name: editName } : key))
      } else {
        alert('Error al actualizar el nombre')
      }
    }
    setEditingId(null)
  }

  function handleEditCancel() {
    setEditingId(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">API Keys</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gestiona las API keys para acceder a SpainMCP de forma programatica.{' '}
          <a href="/docs/clientes/token-scoping" target="_blank" className="text-blue-600 hover:underline">Saber mas</a>
        </p>
      </div>

      {/* Plan limit notice */}
      {tier === 'free' && (
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 text-sm">
          <span className="text-amber-700 dark:text-amber-400">
            Maximo 3 keys en plan gratuito ({keys.length}/3 usadas).
          </span>
          <Link href="/account/billing" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 underline underline-offset-2 transition-colors">
            Actualizar a Pro →
          </Link>
        </div>
      )}

      {/* Count + Create button */}
      <div className="flex items-center justify-between mb-4 mt-6">
        <p className="text-sm text-[var(--muted)]">{keys.length} key{keys.length !== 1 ? 's' : ''}</p>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear API Key
        </button>
      </div>

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--muted)]">No tienes ninguna API key. Crea una para empezar.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {keys.map(key => (
            <div key={key.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{key.name}</span>
                  {key.is_default && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-[var(--muted)]">{key.key_preview}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Creada {formatDate(key.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditStart(key)}
                  className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  title="Editar nombre"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-red-500 hover:border-red-300 transition-colors"
                  title="Eliminar key"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Limite alcanzado</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-[var(--muted)] mb-5">
              Has alcanzado el limite del plan gratuito. Actualiza a Pro para crear API keys ilimitadas.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/account/billing"
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center transition-colors"
                onClick={() => setShowUpgradeModal(false)}
              >
                Actualizar a Pro — €29/mes
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleEditCancel}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Editar nombre</h2>
              <button onClick={handleEditCancel} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-sm text-[var(--muted)] mb-4">Actualiza el nombre de tu API key.</p>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nombre de la key:</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEditSave()}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleEditCancel}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleEditSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
