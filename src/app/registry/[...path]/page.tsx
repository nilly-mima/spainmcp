import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import CopyButton from '@/components/CopyButton'
import OwnerSection from './OwnerSection'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type McpServer = {
  namespace: string
  display_name: string
  description: string
  upstream_url: string
  owner_email: string
  is_active: boolean
  is_verified: boolean
  install_count: number
  last_used_at: string | null
  created_at: string
}

function timeSince(dateStr: string | null): string {
  if (!dateStr) return 'nunca'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (mins > 0) return `hace ${mins} min`
  return 'ahora mismo'
}

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const namespace = decodeURIComponent(path.join('/'))
  const { data } = await getSupabase()
    .from('mcp_servers')
    .select('display_name, description')
    .eq('namespace', namespace)
    .single()
  if (!data) return {}
  return {
    title: `${data.display_name} — SpainMCP`,
    description: data.description,
  }
}

export default async function RegistryPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  // path = ['@miempresa', 'boe-pro'] → '@miempresa/boe-pro'
  // decodeURIComponent por si '@' llega como '%40' en algunos proxies
  const namespace = decodeURIComponent(path.join('/'))

  const { data, error } = await getSupabase()
    .from('mcp_servers')
    .select('*')
    .eq('namespace', namespace)
    .eq('is_active', true)
    .single()

  if (error || !data) notFound()

  const mcp = data as McpServer
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://spainmcp-fngo.vercel.app'
  const gatewayUrl = `${baseUrl}/api/gateway/${namespace}`
  const connectCmd = `npx spainmcp connect --client claude --upstream "${gatewayUrl}"`
  const mcpRemoteJson = `{
  "command": "npx",
  "args": ["mcp-remote", "${gatewayUrl}"]
}`

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 py-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--muted)] flex items-center gap-2">
        <Link href="/" className="hover:text-[var(--foreground)]">Inicio</Link>
        <span>/</span>
        <Link href="/mcps" className="hover:text-[var(--foreground)]">Directorio</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{mcp.display_name}</span>
      </nav>

      {/* Header */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{mcp.display_name}</h1>
            <p className="text-[var(--muted)] mt-1 font-mono text-sm">{mcp.namespace}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {mcp.is_verified && (
              <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1 rounded-full text-sm">
                ✓ Verificado
              </span>
            )}
            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full text-sm">
              En gateway
            </span>
          </div>
        </div>

        {mcp.description && (
          <p className="text-[var(--foreground)] leading-relaxed">{mcp.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] pt-2 border-t border-[var(--border)]">
          <span>Último uso: {timeSince(mcp.last_used_at)}</span>
          <span>Publicado: {new Date(mcp.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Gateway URL */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">URL del Gateway</h2>
        <p className="text-sm text-[var(--muted)]">
          Comparte esta URL — cualquiera puede conectarse a tu MCP sin necesidad de instalarlo directamente.
        </p>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3">
          <code className="text-sm text-[var(--foreground)] font-mono flex-1 break-all">{gatewayUrl}</code>
          <CopyButton text={gatewayUrl} />
        </div>
      </div>

      {/* Snippets de conexión */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Conectar con Claude</h2>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">CLI de SpainMCP</p>
            <CopyButton text={connectCmd} />
          </div>
          <code className="text-green-400 text-sm font-mono break-all">{connectCmd}</code>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">mcp-remote (manual en claude_desktop_config.json)</p>
            <CopyButton text={mcpRemoteJson} />
          </div>
          <pre className="text-green-400 text-sm font-mono">{mcpRemoteJson}</pre>
        </div>
      </div>

      {/* Owner section (client — comprueba sesión) */}
      <OwnerSection namespace={namespace} ownerEmail={mcp.owner_email} />

    </div>
  )
}
