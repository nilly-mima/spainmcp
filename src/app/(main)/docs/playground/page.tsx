'use client'

import { useState } from 'react'

const ENDPOINTS = [
  { method: 'GET', path: '/api/v1/health', auth: false, body: null, description: 'Health check' },
  { method: 'GET', path: '/api/v1/servers', auth: false, body: null, description: 'Listar servidores MCP' },
  { method: 'GET', path: '/api/v1/servers?q=spain', auth: false, body: null, description: 'Buscar servidores' },
  { method: 'GET', path: '/api/v1/namespaces', auth: true, body: null, description: 'Listar tus namespaces' },
  { method: 'POST', path: '/api/v1/namespaces', auth: true, body: '{"name":"test-ns"}', description: 'Crear namespace' },
  { method: 'POST', path: '/api/v1/namespaces/generated', auth: true, body: null, description: 'Crear namespace con nombre auto' },
  { method: 'GET', path: '/api/v1/connections/{namespace}', auth: true, body: null, description: 'Listar conexiones' },
  { method: 'POST', path: '/api/v1/auth/token', auth: true, body: '{"policy":[{"namespaces":"test-ns","resources":"connections","operations":["read","execute"],"ttl":"1h"}]}', description: 'Crear token scoped' },
  { method: 'GET', path: '/api/v1/usage', auth: true, body: null, description: 'Ver uso actual (RPCs/mes)' },
  { method: 'GET', path: '/api/v1/skills', auth: false, body: null, description: 'Listar skills' },
]

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [pathOverride, setPathOverride] = useState('')
  const [bodyOverride, setBodyOverride] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)

  const ep = ENDPOINTS[selectedIdx]

  async function runRequest() {
    setLoading(true)
    setResponse(null)
    setStatus(null)
    setDuration(null)

    const path = pathOverride || ep.path
    const url = path.startsWith('http') ? path : `${window.location.origin}${path}`
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (ep.auth && apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const body = bodyOverride || ep.body
    const t0 = Date.now()

    try {
      const res = await fetch(url, {
        method: ep.method,
        headers,
        ...(body && ep.method !== 'GET' ? { body } : {}),
      })
      const ms = Date.now() - t0
      setDuration(ms)
      setStatus(res.status)
      const text = await res.text()
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2))
      } catch {
        setResponse(text)
      }
    } catch (err) {
      setDuration(Date.now() - t0)
      setResponse(`Error: ${String(err)}`)
      setStatus(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">API Playground</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Prueba los endpoints de SpainMCP en tiempo real.</p>

      {/* API Key input */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">API Key (para endpoints autenticados)</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-spainmcp-..."
          className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm font-mono"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Request */}
        <div className="flex flex-col gap-4">
          {/* Endpoint selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endpoint</label>
            <select
              value={selectedIdx}
              onChange={(e) => {
                const idx = Number(e.target.value)
                setSelectedIdx(idx)
                setPathOverride(ENDPOINTS[idx].path)
                setBodyOverride(ENDPOINTS[idx].body ?? '')
                setResponse(null)
                setStatus(null)
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            >
              {ENDPOINTS.map((ep, i) => (
                <option key={i} value={i}>
                  {ep.method} {ep.path} — {ep.description}
                </option>
              ))}
            </select>
          </div>

          {/* Method + Path */}
          <div className="flex gap-2">
            <span className={`px-3 py-2 rounded-lg text-sm font-bold ${
              ep.method === 'GET' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : ep.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {ep.method}
            </span>
            <input
              value={pathOverride || ep.path}
              onChange={(e) => setPathOverride(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm font-mono"
            />
          </div>

          {/* Auth badge */}
          {ep.auth && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Este endpoint requiere autenticacion (Bearer token)
            </p>
          )}

          {/* Body */}
          {ep.method !== 'GET' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Body (JSON)</label>
              <textarea
                value={bodyOverride || ep.body || ''}
                onChange={(e) => setBodyOverride(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-950 text-gray-100 text-sm font-mono"
              />
            </div>
          )}

          {/* Send button */}
          <button
            onClick={runRequest}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors w-fit"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

        {/* Right: Response */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Respuesta</label>
            {status !== null && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                status >= 200 && status < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : status >= 400 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
              }`}>
                {status}
              </span>
            )}
            {duration !== null && (
              <span className="text-xs text-gray-400">{duration}ms</span>
            )}
          </div>
          <pre className="w-full min-h-[300px] max-h-[500px] overflow-auto px-4 py-3 rounded-lg bg-gray-950 text-gray-100 text-xs font-mono border border-gray-800">
            {response ?? 'Pulsa "Enviar" para ver la respuesta'}
          </pre>
        </div>
      </div>
    </div>
  )
}
