'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface User {
  id: string
  email: string
  tier: string
  is_active: boolean
  created_at: string
  key_prefix: string
  rpcs_month: number
}

export default function AdminUsers() {
  const { adminFetch } = useAdminFetch()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Error cargando usuarios')
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [adminFetch, page, search])

  useEffect(() => { load() }, [load])

  async function updateUser(id: string, updates: Partial<{ tier: string; is_active: boolean }>) {
    setUpdating(id)
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
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

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Usuarios</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{total} usuarios registrados</p>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por email..."
          className="flex-1 max-w-xs px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Limpiar
          </button>
        )}
      </form>

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
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">RPCs este mes</th>
                <th className="text-left px-4 py-3 font-medium">Key prefix</th>
                <th className="text-left px-4 py-3 font-medium">Registro</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
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
              {!loading && users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3 text-[var(--foreground)] font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${u.tier === 'pro' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--muted)]'}`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{u.rpcs_month.toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">{u.key_prefix}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${u.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={updating === u.id}
                        onClick={() => updateUser(u.id, { tier: u.tier === 'pro' ? 'free' : 'pro' })}
                        className="text-xs px-2 py-1 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                      >
                        {u.tier === 'pro' ? '→ Free' : '→ Pro'}
                      </button>
                      <button
                        disabled={updating === u.id}
                        onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                        className="text-xs px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                      >
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">
            Página {page} de {totalPages}
          </span>
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
