'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface Mcp {
  id: string
  nombre: string
  slug: string
  descripcion_es: string
  descripcion_en: string
  scope: string
  icon_url: string
  upstream_url: string
  downloads: number
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = {
  nombre: '',
  slug: '',
  descripcion_es: '',
  descripcion_en: '',
  scope: 'remoto',
  icon_url: '',
  upstream_url: '',
}

export default function AdminMcps() {
  const { adminFetch } = useAdminFetch()
  const [mcps, setMcps] = useState<Mcp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

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

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(m: Mcp) {
    setForm({
      nombre: m.nombre,
      slug: m.slug,
      descripcion_es: m.descripcion_es,
      descripcion_en: m.descripcion_en,
      scope: m.scope,
      icon_url: m.icon_url,
      upstream_url: m.upstream_url,
    })
    setEditingId(m.id)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.slug) {
      alert('nombre y slug son obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/mcps', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Error guardando')
      }
      setShowModal(false)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(m: Mcp) {
    setUpdating(m.id)
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
      setUpdating(null)
    }
  }

  async function deleteMcp(m: Mcp) {
    if (!confirm(`¿Desactivar "${m.nombre}"?`)) return
    setUpdating(m.id)
    try {
      const res = await adminFetch(`/api/admin/mcps?id=${m.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      await load()
    } catch {
      alert('Error eliminando')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">MCPs del catálogo</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{mcps.length} MCPs gestionados</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Añadir MCP
        </button>
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
                  <td className="px-4 py-3 text-[var(--foreground)] font-medium">{m.nombre}</td>
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
                      <button
                        disabled={updating === m.id}
                        onClick={() => openEdit(m)}
                        className="text-xs px-2 py-1 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        disabled={updating === m.id}
                        onClick={() => toggleActive(m)}
                        className="text-xs px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                      >
                        {m.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        disabled={updating === m.id}
                        onClick={() => deleteMcp(m)}
                        className="text-xs px-2 py-1 rounded bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && mcps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                    No hay MCPs en el catálogo todavía.{' '}
                    <button onClick={openCreate} className="text-blue-600 hover:underline">Añadir el primero</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">
                {editingId ? 'Editar MCP' : 'Añadir MCP'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { key: 'nombre', label: 'Nombre', placeholder: 'BOE Consultor' },
                { key: 'slug', label: 'Slug', placeholder: 'boe-consultor' },
                { key: 'scope', label: 'Scope', placeholder: 'remoto / local' },
                { key: 'icon_url', label: 'Icon URL', placeholder: 'https://...' },
                { key: 'upstream_url', label: 'Upstream URL', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Descripcion ES</label>
                <textarea
                  value={form.descripcion_es}
                  onChange={(e) => setForm(f => ({ ...f, descripcion_es: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Descripcion EN</label>
                <textarea
                  value={form.descripcion_en}
                  onChange={(e) => setForm(f => ({ ...f, descripcion_en: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
