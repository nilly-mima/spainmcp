import { createClient } from "@supabase/supabase-js"
import { NextRequest, after } from "next/server"
import crypto from "node:crypto"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Headers que NO se deben forwardear al upstream
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

function hashIP(ip: string | null): string | null {
  if (!ip) return null
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16)
}

type LogParams = {
  slug: string
  method: string
  status_code: number
  duration_ms: number
  tier: string
  ip_hash: string | null
  user_agent: string | null
  error?: string
}

function scheduleLog(params: LogParams): void {
  // Next.js 15+ after(): ejecuta tras enviar la response pero mantiene
  // el lifecycle Vercel activo hasta que el insert complete. Evita el
  // fire-and-forget fantasma donde la instancia se congela antes del insert.
  after(async () => {
    const { error } = await supabase.from("gateway_logs").insert(params)
    if (error) console.error("gateway_logs insert failed:", error.message)
  })
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const t0 = Date.now()
  const { path } = await params

  if (!path || path.length < 1) {
    return Response.json(
      { error: "Ruta inválida. Formato: /api/gateway/<slug>[/subpath]" },
      { status: 400 }
    )
  }

  // Primer segmento = slug del MCP. Resto = subpath (ej: /sse, /message)
  const slug = path[0]
  const subpath = path.slice(1).join("/")

  const ipHash = hashIP(
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? null
  )
  const userAgent = req.headers.get("user-agent")

  // 1) Buscar en allowlist
  const { data: entry } = await supabase
    .from("mcp_allowlist")
    .select("slug, tier, upstream_url, display_name")
    .eq("slug", slug)
    .single()

  if (!entry) {
    scheduleLog({
      slug, method: req.method, status_code: 404, duration_ms: Date.now() - t0,
      tier: "unknown", ip_hash: ipHash, user_agent: userAgent,
      error: "not in allowlist",
    })
    return Response.json(
      { error: `MCP no encontrado en el allowlist: ${slug}` },
      { status: 404 }
    )
  }

  // 2) Tier check
  if (entry.tier === "blocked") {
    scheduleLog({
      slug, method: req.method, status_code: 403, duration_ms: Date.now() - t0,
      tier: "blocked", ip_hash: ipHash, user_agent: userAgent,
      error: "tier=blocked",
    })
    return Response.json(
      {
        error: `Este MCP está bloqueado por política de SpainMCP. Consulta /docs/politicas para más info.`,
        slug,
      },
      { status: 403 }
    )
  }

  if (entry.tier === "user_key") {
    // Requiere que el cliente traiga su propia API key del servicio upstream
    const userKey = req.headers.get("x-user-api-key")
    if (!userKey) {
      scheduleLog({
        slug, method: req.method, status_code: 401, duration_ms: Date.now() - t0,
        tier: "user_key", ip_hash: ipHash, user_agent: userAgent,
        error: "missing x-user-api-key",
      })
      return Response.json(
        {
          error: `Este MCP requiere que envíes tu propia API key del servicio upstream en el header 'x-user-api-key'. SpainMCP solo enruta, no revende credenciales.`,
          slug,
          tier: "user_key",
        },
        { status: 401 }
      )
    }
  }

  if (!entry.upstream_url) {
    scheduleLog({
      slug, method: req.method, status_code: 500, duration_ms: Date.now() - t0,
      tier: entry.tier, ip_hash: ipHash, user_agent: userAgent,
      error: "no upstream_url",
    })
    return Response.json(
      { error: `MCP '${slug}' está en el allowlist pero no tiene upstream_url configurado` },
      { status: 500 }
    )
  }

  // 3) Construir upstream URL
  const upstreamUrl = subpath
    ? `${entry.upstream_url.replace(/\/$/, "")}/${subpath}`
    : entry.upstream_url

  // 4) Forward
  const upstreamHeaders = buildUpstreamHeaders(req.headers)

  // Para user_key tier, convertir x-user-api-key → Authorization Bearer
  if (entry.tier === "user_key") {
    const userKey = req.headers.get("x-user-api-key")!
    upstreamHeaders.set("authorization", `Bearer ${userKey}`)
    upstreamHeaders.delete("x-user-api-key")
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: upstreamHeaders,
      // @ts-expect-error — duplex es necesario para streaming (Node 18+)
      duplex: "half",
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    })

    const responseHeaders = new Headers()
    for (const [key, value] of upstreamRes.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    }
    responseHeaders.set("x-spainmcp-slug", slug)
    responseHeaders.set("x-spainmcp-tier", entry.tier)
    responseHeaders.set("x-spainmcp-gateway", "1")

    scheduleLog({
      slug, method: req.method, status_code: upstreamRes.status,
      duration_ms: Date.now() - t0, tier: entry.tier,
      ip_hash: ipHash, user_agent: userAgent,
    })

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error(`Gateway error [${slug}]:`, err)
    scheduleLog({
      slug, method: req.method, status_code: 502, duration_ms: Date.now() - t0,
      tier: entry.tier, ip_hash: ipHash, user_agent: userAgent,
      error: err instanceof Error ? err.message : "unknown",
    })
    return Response.json(
      { error: "El servidor upstream no está disponible", slug },
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
