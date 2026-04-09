'use client'

import { useEffect, useState } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'

type ReviewItem = {
  id: string
  nombre: string
  slug: string
  owner_id: string
  status: string
  is_public: boolean
  created_at: string
  type: 'mcp' | 'skill'
}

export default function AdminReviewPage() {
  const { adminFetch } = useAdminFetch()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  async function loadQueue() {
    setLoading(true)
    const res = await adminFetch('/api/admin/review')
    if (res?.ok) {
      const data = await res.json()
      setItems(data.items ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { loadQueue() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAction(id: string, type: 'mcp' | 'skill', action: 'approve' | 'reject') {
    await adminFetch('/api/admin/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, action }),
    })
    await loadQueue()
  }

  if (loading) {
    return <div className="p-8"><div className="h-64 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" /></div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Cola de revisión</h1>
      <p className="text-sm text-[var(--muted)] mb-6">MCPs y Skills pendientes de aprobación.</p>

      {items.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">&#10003;</p>
          <p className="text-sm">No hay items pendientes de revisión.</p>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)] text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Autor</th>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-[var(--border)] last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.type === 'mcp' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'}`}>
                      {item.type === 'mcp' ? 'MCP' : 'Skill'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{item.nombre}</td>
                  <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">{item.owner_id}</td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">
                    {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleAction(item.id, item.type, 'approve')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleAction(item.id, item.type, 'reject')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
