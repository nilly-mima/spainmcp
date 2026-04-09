'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import { isAdmin } from '@/lib/admin-auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'credentials' | 'magic' | 'sent'>('credentials')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // If already logged in as admin, redirect
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      const userEmail = data.session?.user?.email
      if (isAdmin(userEmail)) {
        router.replace('/admin')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'credentials') {
      // Email + password login
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // If no password set, suggest magic link
        if (authError.message.includes('Invalid login credentials')) {
          setError('Credenciales incorrectas. Prueba con enlace mágico.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      // Check admin
      const { data } = await supabaseBrowser.auth.getSession()
      if (!isAdmin(data.session?.user?.email)) {
        await supabaseBrowser.auth.signOut()
        setError('No tienes permisos de administrador.')
        setLoading(false)
        return
      }

      router.replace('/admin')
    } else {
      // Magic link
      const { error: otpError } = await supabaseBrowser.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      })

      if (otpError) {
        setError(otpError.message)
        setLoading(false)
        return
      }

      setMode('sent')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    const { error: oauthError } = await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    })
    if (oauthError) setError(oauthError.message)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="2" fill="#2563EB"/>
              <rect x="11" y="1" width="8" height="8" rx="2" fill="#2563EB"/>
              <rect x="1" y="11" width="8" height="8" rx="2" fill="#2563EB"/>
              <rect x="11" y="11" width="8" height="8" rx="2" fill="#2563EB"/>
            </svg>
            <span className="font-bold text-xl text-white">SpainMCP</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white leading-none">
              Admin
            </span>
          </div>
          <p className="text-sm text-stone-500">Panel de administración</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          {mode === 'sent' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Revisa tu correo</h2>
              <p className="text-sm text-stone-400">
                Hemos enviado un enlace mágico a <strong className="text-stone-200">{email}</strong>
              </p>
              <button
                onClick={() => setMode('credentials')}
                className="mt-4 text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@email.com"
                    className="w-full px-3 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {mode === 'credentials' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {loading ? 'Verificando...' : mode === 'credentials' ? 'Entrar' : 'Enviar enlace mágico'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-stone-800" />
                <span className="text-xs text-stone-600">o</span>
                <div className="flex-1 h-px bg-stone-800" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full py-2.5 rounded-lg border border-stone-700 hover:border-stone-600 text-stone-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode(mode === 'credentials' ? 'magic' : 'credentials')}
                  className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {mode === 'credentials' ? 'Usar enlace mágico' : 'Usar contraseña'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-stone-600 mt-6">
          Solo personal autorizado
        </p>
      </div>
    </div>
  )
}
