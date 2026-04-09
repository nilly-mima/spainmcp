'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface Mcp {
  id: string
  nombre: string
  slug: string
  scope: string
  icon_url: string
  downloads: number
  is_active: boolean
  created_at: string
}

function Logo({ mcp }: { mcp: Mcp }) {
  const [ok, setOk] = useState(!!mcp.icon_url)
  const letters = mcp.nombre
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return ok && mcp.icon_url ? (
    <img
      src={mcp.icon_url}
      alt={mcp.nombre}
      width={32}
      height={32}
      className="w-8 h-8 rounded-lg object-contain border border-[var(--border)]"
      onError={() => setOk(false)}
    />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-[var(--border)] flex items-center justify-center text-blue-600 text-xs font-bold select-none">
      {letters || '?'}
    </div>
  )
}

export default function AdminMcps() {
  const { adminFetch } = useAdminFetch()
  const [mcps, setMcps] = useState<Mcp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch('/api/admin/mcps')
      if (!res.ok) throw new Error('Error cargando MCPs')
      const data = await res.json()
      setMcps(data.mcps ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [adminFetch])

  useEffect(() => { load() }, [load])

  async function toggleActive(m: Mcp) {
    setToggling(m.id)
    try {
      const res = await adminFetch('/api/admin/mcps', {
        method: 'PATCH',
        body: JSON.stringify({ id: m.id, is_active: !m.is_active }),
      })
      if (!res.ok) throw new Error('Error')
      await load()
    } catch {
      alert('Error actualizando')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">MCPs del catalogo</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{mcps.length} MCPs gestionados</p>
        </div>
        <Link
          href="/admin/mcps/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Anadir MCP
        </Link>
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
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Scope</th>
                <th className="text-left px-4 py-3 font-medium">Descargas</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              {!loading && mcps.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Logo mcp={m} />
                      <span className="font-medium text-[var(--foreground)]">{m.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">{m.slug}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{m.scope}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{m.downloads.toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${m.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {m.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/mcps/${m.id}`}
                        className="text-xs px-2 py-1 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        disabled={toggling === m.id}
                        onClick={() => toggleActive(m)}
                        className="text-xs px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                      >
                        {m.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && mcps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                    No hay MCPs en el catalogo todavia.{' '}
                    <Link href="/admin/mcps/new" className="text-blue-600 hover:underline">Anadir el primero</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
