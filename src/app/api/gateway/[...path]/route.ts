import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Headers que NO se deben forwarden al upstream
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
])

function buildUpstreamHeaders(incoming: Headers): Headers {
  const headers = new Headers()
  for (const [key, value] of incoming.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  }
  headers.set("x-forwarded-by", "SpainMCP Gateway")
  return headers
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params

  // path = ["@usuario", "mcp-name"] o ["@usuario", "mcp-name", "subpath"]
  if (!path || path.length < 2) {
    return Response.json(
      { error: "Ruta inválida. Formato: /api/gateway/@usuario/nombre-mcp" },
      { status: 400 }
    )
  }

  // Reconstruir namespace: @usuario/nombre-mcp
  const namespace = `${path[0]}/${path[1]}`

  // Buscar en registry
  const { data: server } = await supabase
    .from("mcp_servers")
    .select("upstream_url, display_name")
    .eq("namespace", namespace)
    .eq("is_active", true)
    .single()

  if (!server) {
    return Response.json(
      { error: `MCP no encontrado: ${namespace}` },
      { status: 404 }
    )
  }

  // Subpath adicional (ej: @user/mcp/sse → reenviar /sse al upstream)
  const subpath = path.slice(2).join("/")
  const upstreamUrl = subpath
    ? `${server.upstream_url.replace(/\/$/, "")}/${subpath}`
    : server.upstream_url

  // Forward la request al upstream
  const upstreamHeaders = buildUpstreamHeaders(req.headers)

  // Incrementar contador (fire & forget)
  void supabase
    .from("mcp_servers")
    .update({ last_used_at: new Date().toISOString() })
    .eq("namespace", namespace)

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: upstreamHeaders,
      // @ts-expect-error — duplex es necesario para streaming (Node 18+)
      duplex: "half",
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    })

    // Construir response con los mismos headers del upstream
    const responseHeaders = new Headers()
    for (const [key, value] of upstreamRes.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    }
    responseHeaders.set("x-spainmcp-namespace", namespace)
    responseHeaders.set("x-spainmcp-gateway", "1")

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error(`Gateway error [${namespace}]:`, err)
    return Response.json(
      { error: "El servidor upstream no está disponible", namespace },
      { status: 502 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const OPTIONS = handler
export const maxDuration = 60
