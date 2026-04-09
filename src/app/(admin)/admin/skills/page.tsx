'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface Skill {
  id: string
  nombre: string
  slug?: string
  descripcion: string
  categoria: string
  icon_url?: string
  is_active: boolean
  created_at: string
}

function Logo({ skill }: { skill: Skill }) {
  const [ok, setOk] = useState(!!skill.icon_url)
  const letters = skill.nombre
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return ok && skill.icon_url ? (
    <img
      src={skill.icon_url}
      alt={skill.nombre}
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

export default function AdminSkills() {
  const { adminFetch } = useAdminFetch()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

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

  async function toggleActive(s: Skill) {
    setToggling(s.id)
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
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Skills</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{skills.length} skills en el catalogo</p>
        </div>
        <Link
          href="/admin/skills/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Anadir skill
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Logo skill={s} />
                      <span className="font-medium text-[var(--foreground)]">{s.nombre}</span>
                    </div>
                  </td>
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
                      <Link
                        href={`/admin/skills/${s.id}`}
                        className="text-xs px-2 py-1 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        disabled={toggling === s.id}
                        onClick={() => toggleActive(s)}
                        className="text-xs px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                      >
                        {s.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && skills.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--muted)]">
                    No hay skills todavia.{' '}
                    <Link href="/admin/skills/new" className="text-blue-600 hover:underline">Anadir la primera</Link>
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
