'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface Server {
  namespace: string
  display_name: string
  description: string
  owner_email: string
  upstream_url: string
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export default function AdminServers() {
  const { adminFetch } = useAdminFetch()
  const [servers, setServers] = useState<Server[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch(`/api/admin/servers?page=${page}`)
      if (!res.ok) throw new Error('Error cargando servidores')
      const data = await res.json()
      setServers(data.servers ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [adminFetch, page])

  useEffect(() => { load() }, [load])

  async function updateServer(namespace: string, updates: Partial<{ is_verified: boolean; is_active: boolean }>) {
    setUpdating(namespace)
    try {
      const res = await adminFetch('/api/admin/servers', {
        method: 'PATCH',
        body: JSON.stringify({ namespace, ...updates }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Error')
      }
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error')
    } finally {
      setUpdating(null)
    }
  }

  async function deleteServer(namespace: string) {
    if (!confirm(`¿Desactivar el servidor ${namespace}?`)) return
    setUpdating(namespace)
    try {
      const res = await adminFetch(`/api/admin/servers?namespace=${encodeURIComponent(namespace)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error eliminando')
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error')
    } finally {
      setUpdating(null)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Servidores publicados</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{total} servidores en el registry</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
                <th className="text-left px-4 py-3 font-medium">Namespace</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Verificado</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Creado</th>
                <th className="text-left px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              {!loading && servers.map((s) => (
                <tr key={s.namespace} className="hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3 text-[var(--foreground)] font-mono text-xs">{s.namespace}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{s.display_name}</td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">{s.owner_email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${s.is_verified ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                      {s.is_verified ? 'Verificado' : 'Sin verificar'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${s.is_active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {s.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{new Date(s.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={updating === s.namespace}
                        onClick={() => updateServer(s.namespace, { is_verified: !s.is_verified })}
                        className="text-xs px-2 py-1 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                      >
                        {s.is_verified ? 'Desverificar' : 'Verificar'}
                      </button>
                      <button
                        disabled={updating === s.namespace}
                        onClick={() => updateServer(s.namespace, { is_active: !s.is_active })}
                        className="text-xs px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                      >
                        {s.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        disabled={updating === s.namespace}
                        onClick={() => deleteServer(s.namespace)}
                        className="text-xs px-2 py-1 rounded bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && servers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                    Sin servidores todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/40 disabled:opacity-40 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/40 disabled:opacity-40 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
