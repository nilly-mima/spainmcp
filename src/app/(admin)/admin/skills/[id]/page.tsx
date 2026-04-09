'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAdminFetch } from '@/hooks/useAdminFetch'

const CATEGORIAS = [
  'general',
  'investigacion',
  'programacion',
  'escritura',
  'datos',
  'automatizacion',
]

interface SkillForm {
  nombre: string
  slug: string
  descripcion: string
  categoria: string
  content: string
  icon_url: string
  is_active: boolean
}

const EMPTY: SkillForm = {
  nombre: '',
  slug: '',
  descripcion: '',
  categoria: 'general',
  content: '',
  icon_url: '',
  is_active: true,
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="w-16 h-16 rounded-xl bg-blue-600/10 border border-[var(--border)] flex items-center justify-center text-blue-600 text-xl font-bold select-none">
      {letters || '?'}
    </div>
  )
}

export default function SkillEditPage() {
  const params = useParams()
  const router = useRouter()
  const { adminFetch } = useAdminFetch()
  const id = params.id as string
  const isNew = id === 'new'

  const [form, setForm] = useState<SkillForm>(EMPTY)
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [imgOk, setImgOk] = useState(false)

  const set = useCallback(<K extends keyof SkillForm>(key: K, val: SkillForm[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
  }, [])

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    adminFetch(`/api/admin/skills?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return }
        const s = d.skill
        setForm({
          nombre: s.nombre ?? '',
          slug: s.slug ?? '',
          descripcion: s.descripcion ?? '',
          categoria: s.categoria ?? 'general',
          content: s.content ?? '',
          icon_url: s.icon_url ?? '',
          is_active: s.is_active ?? true,
        })
        setSlugManual(true)
        if (s.icon_url) setImgOk(true)
      })
      .catch(() => setError('Error cargando skill'))
      .finally(() => setLoading(false))
  }, [id, isNew, adminFetch])

  useEffect(() => {
    if (!slugManual && form.nombre) {
      set('slug', slugify(form.nombre))
    }
  }, [form.nombre, slugManual, set])

  async function handleSave() {
    if (!form.nombre) {
      setError('nombre es obligatorio')
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = {
        ...(isNew ? {} : { id }),
        nombre: form.nombre,
        slug: form.slug,
        descripcion: form.descripcion,
        categoria: form.categoria,
        content: form.content,
        icon_url: form.icon_url,
        is_active: form.is_active,
      }
      const res = await adminFetch('/api/admin/skills', {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Error guardando')
      router.push('/admin/skills')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${form.nombre}"? Esta accion lo desactivara.`)) return
    setDeleting(true)
    setError('')
    try {
      const res = await adminFetch(`/api/admin/skills?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Error eliminando')
      }
      router.push('/admin/skills')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error eliminando')
    } finally {
      setDeleting(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/50'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/skills"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Skills
          </Link>
          <span className="text-[var(--border)]">/</span>
          <h1 className="text-lg font-bold text-[var(--foreground)]">
            {isNew ? 'Nueva skill' : form.nombre || 'Editar skill'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Basic */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Basico</h2>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Nombre de la skill"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => { setSlugManual(true); set('slug', e.target.value) }}
            placeholder="nombre-skill"
            className={`${inputCls} font-mono`}
          />
          <p className="text-xs text-[var(--muted)] mt-1">Solo letras minusculas, numeros y guiones</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Categoria</label>
          <select
            value={form.categoria}
            onChange={(e) => set('categoria', e.target.value)}
            className={inputCls}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">Descripcion</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            rows={4}
            placeholder="Describe para que sirve esta skill..."
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">
            Contenido SKILL.md{' '}
            <span className="font-normal text-[var(--muted)] opacity-70">(Markdown)</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            rows={20}
            placeholder={`# ${form.nombre || 'Nombre de la skill'}\n\n## Descripcion\n\nEscribe aqui el contenido completo en Markdown...\n\n## Uso\n\n- Ejemplo 1\n- Ejemplo 2`}
            className={`${inputCls} font-mono text-xs resize-y`}
            spellCheck={false}
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Este contenido se muestra como SKILL.md en la pagina de detalle y se descarga al hacer clic en &ldquo;Descargar skill&rdquo;.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('is_active', !form.is_active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_active ? 'bg-blue-600' : 'bg-[var(--border)]'}`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
          <span className="text-sm text-[var(--foreground)]">Activo</span>
        </div>
      </div>

      {/* Icon */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Icono</h2>
        <div className="flex items-center gap-4">
          {imgOk && form.icon_url ? (
            <img
              src={form.icon_url}
              alt={form.nombre}
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-contain border border-[var(--border)]"
              onError={() => setImgOk(false)}
            />
          ) : (
            <Initials name={form.nombre} />
          )}
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Icon URL</label>
            <input
              value={form.icon_url}
              onChange={(e) => { set('icon_url', e.target.value); setImgOk(true) }}
              placeholder="https://example.com/icon.png"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      {!isNew && (
        <div className="bg-[var(--card)] border border-red-500/40 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Zona de peligro</h2>
          <p className="text-xs text-[var(--muted)]">
            Desactiva la skill del catalogo. Esta accion no se puede deshacer desde aqui.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
          >
            {deleting ? 'Eliminando...' : 'Eliminar skill'}
          </button>
        </div>
      )}
    </div>
  )
}
