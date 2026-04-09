'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface Skill {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = { nombre: '', descripcion: '', categoria: 'general' }

export default function AdminSkills() {
  const { adminFetch } = useAdminFetch()
  const [skills, setSkills] = useState<Skill[]>([])
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
      const res = await adminFetch('/api/admin/skills')
      if (!res.ok) throw new Error('Error cargando skills')
      const data = await res.json()
      setSkills(data.skills ?? [])
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

  function openEdit(s: Skill) {
    setForm({ nombre: s.nombre, descripcion: s.descripcion, categoria: s.categoria })
    setEditingId(s.id)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre) { alert('nombre es obligatorio'); return }
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/skills', {
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

  async function toggleActive(s: Skill) {
    setUpdating(s.id)
    try {
      const res = await adminFetch('/api/admin/skills', {
        method: 'PATCH',
        body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
      })
      if (!res.ok) throw new Error('Error')
      await load()
    } catch {
      alert('Error actualizando')
    } finally {
      setUpdating(null)
    }
  }

  async function deleteSkill(s: Skill) {
    if (!confirm(`¿Desactivar "${s.nombre}"?`)) return
    setUpdating(s.id)
    try {
      const res = await adminFetch(`/api/admin/skills?id=${s.id}`, { method: 'DELETE' })
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
          <h1 className="text-xl font-bold text-[var(--foreground)]">Skills</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{skills.length} skills en el catálogo</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Añadir skill
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
                <th className="text-left px-4 py-3 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 font-medium">Descripcion</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              {!loading && skills.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3 text-[var(--foreground)] font-medium">{s.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--muted)]">{s.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] max-w-xs truncate">{s.descripcion}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${s.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {s.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={updating === s.id}
                        onClick={() => openEdit(s)}
                        className="text-xs px-2 py-1 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        disabled={updating === s.id}
                        onClick={() => toggleActive(s)}
                        className="text-xs px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                      >
                        {s.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        disabled={updating === s.id}
                        onClick={() => deleteSkill(s)}
                        className="text-xs px-2 py-1 rounded bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && skills.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--muted)]">
                    No hay skills todavía.{' '}
                    <button onClick={openCreate} className="text-blue-600 hover:underline">Añadir la primera</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">
                {editingId ? 'Editar skill' : 'Nueva skill'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre de la skill"
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Categoria</label>
                <input
                  value={form.categoria}
                  onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
                  placeholder="general, productividad, desarrollo..."
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Descripcion</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
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
