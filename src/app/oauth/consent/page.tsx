'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'

const SCOPE_LABELS: Record<string, string> = {
  openid: 'Tu identidad (OpenID)',
  email: 'Tu dirección de email',
  profile: 'Tu perfil público',
  phone: 'Tu número de teléfono',
}

interface AuthDetails {
  client: { name: string; description?: string }
  redirect_uri: string
  scopes: string[]
}

// useSearchParams requiere Suspense boundary
function ConsentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authorizationId = searchParams.get('authorization_id')

  const [details, setDetails] = useState<AuthDetails | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState(false)

  useEffect(() => {
    if (!authorizationId) {
      setError('Parámetro authorization_id no encontrado')
      setLoading(false)
      return
    }

    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.replace(`/login?next=/oauth/consent?authorization_id=${authorizationId}`)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: d, error: e } = await (supabaseBrowser.auth as any).oauth.getAuthorizationDetails(authorizationId)
      if (e || !d) {
        setError(e?.message ?? 'Solicitud inválida o expirada')
        setLoading(false)
        return
      }
      setDetails(d)
      setLoading(false)
    })
  }, [authorizationId, router])

  async function decide(action: 'approve' | 'deny') {
    if (!authorizationId || deciding) return
    setDeciding(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const auth = supabaseBrowser.auth as any
      if (action === 'approve') {
        await auth.oauth.approveAuthorization(authorizationId)
      } else {
        await auth.oauth.denyAuthorization(authorizationId)
      }
      // Supabase redirige automáticamente al cliente MCP
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar la decisión')
      setDeciding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Verificando solicitud...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-3xl">⚠️</div>
        <p className="text-sm text-red-500 text-center max-w-xs">{error}</p>
        <button onClick={() => router.back()} className="text-sm text-orange-600 hover:underline">
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div
        className="w-full max-w-sm bg-white dark:bg-[var(--card)] rounded-2xl p-8 flex flex-col gap-6"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Cabecera */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-2xl">
            🔐
          </div>
          <h1 className="text-lg font-bold text-[var(--foreground)] leading-snug">
            <span className="text-orange-600">{details?.client.name ?? 'Una aplicación'}</span>
            {' '}quiere acceder a tu cuenta de SpainMCP
          </h1>
          {details?.client.description && (
            <p className="text-xs text-[var(--muted)]">{details.client.description}</p>
          )}
        </div>

        {/* Permisos */}
        {details?.scopes && details.scopes.length > 0 && (
          <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              Permisos solicitados
            </p>
            <ul className="flex flex-col gap-1.5">
              {details.scopes.map(scope => (
                <li key={scope} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <span className="text-green-500 text-xs">✓</span>
                  {SCOPE_LABELS[scope] ?? scope}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Redirect URI */}
        <p className="text-xs text-stone-400 dark:text-stone-500 text-center leading-relaxed">
          Serás redirigido a{' '}
          <span className="font-mono break-all">{details?.redirect_uri}</span>
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={() => decide('deny')}
            disabled={deciding}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-60 transition-colors"
          >
            Denegar
          </button>
          <button
            onClick={() => decide('approve')}
            disabled={deciding}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 transition-colors"
          >
            {deciding ? '...' : 'Aprobar'}
          </button>
        </div>

        <p className="text-xs text-center text-stone-400 dark:text-stone-500">
          Tú controlas qué aplicaciones acceden a tu cuenta.{' '}
          Puedes revocar el acceso en cualquier momento.
        </p>
      </div>
    </div>
  )
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Cargando...</p>
      </div>
    }>
      <ConsentContent />
    </Suspense>
  )
}
