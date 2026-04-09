import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isValidNamespace(ns: string): boolean {
  return /^@[a-z0-9_-]+\/[a-z0-9_-]+$/.test(ns)
}

async function pingUpstream(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping", params: {} }),
      signal: AbortSignal.timeout(8000),
    })
    return res.status < 500
  } catch {
    return false
  }
}

/* ── Get authenticated user email from Bearer token ── */
async function getUserEmail(req: Request): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  const { data } = await supabase.auth.getUser(token)
  return data.user?.email ?? null
}

export async function POST(req: Request) {
  // 1. Auth — get user email
  const userEmail = await getUserEmail(req)
  if (!userEmail) {
    return Response.json({ error: "Debes iniciar sesión para publicar" }, { status: 401 })
  }

  // 2. Parse body
  let body: {
    namespace?: string
    display_name?: string
    description?: string
    upstream_url?: string
    config_schema?: { credentials: unknown[] }
  }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 })
  }

  const { namespace, display_name, description, upstream_url, config_schema } = body

  if (!namespace || !display_name || !upstream_url) {
    return Response.json({ error: "Faltan campos: namespace, display_name, upstream_url" }, { status: 400 })
  }

  if (!isValidNamespace(namespace)) {
    return Response.json({ error: "Namespace inválido. Formato: @usuario/nombre" }, { status: 400 })
  }

  if (!upstream_url.startsWith("https://")) {
    return Response.json({ error: "upstream_url debe ser HTTPS" }, { status: 400 })
  }

  // 3. Ping upstream
  const alive = await pingUpstream(upstream_url)
  if (!alive) {
    return Response.json({ error: "El servidor upstream no responde. Verifica que está en línea y accesible." }, { status: 422 })
  }

  // 4. Insert into mcp_servers (registry)
  const { error: dbError } = await supabase
    .from("mcp_servers")
    .upsert(
      {
        namespace,
        display_name,
        description: description ?? "",
        upstream_url,
        owner_email: userEmail,
        is_active: true,
        ...(config_schema ? { config_schema } : {}),
      },
      { onConflict: "namespace" }
    )

  if (dbError) {
    console.error("Supabase insert error:", dbError)
    return Response.json({ error: "Error guardando el servidor" }, { status: 500 })
  }

  // 5. Insert into mcp_catalog with status=draft (needs admin approval)
  const slug = namespace.replace(/^@/, '').replace('/', '-')
  await supabase
    .from("mcp_catalog")
    .upsert(
      {
        nombre: display_name,
        slug,
        descripcion_es: description ?? "",
        descripcion_en: description ?? "",
        scope: "remote",
        icon_url: null,
        upstream_url,
        downloads: 0,
        is_active: true,
        categoria: "desarrollo",
        owner_id: userEmail,
        status: "draft",
        is_public: false,
      },
      { onConflict: "slug" }
    )

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://spainmcp-fngo.vercel.app"
  const gatewayUrl = `${baseUrl}/api/gateway/${namespace}`

  return Response.json({
    success: true,
    namespace,
    gateway_url: gatewayUrl,
    message: `Tu MCP está guardado como borrador. Solicita revisión desde tu dashboard para hacerlo público.`,
  })
}
