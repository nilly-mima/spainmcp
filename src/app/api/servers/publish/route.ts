import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

// Valida que el namespace tiene el formato correcto: @usuario/nombre
function isValidNamespace(ns: string): boolean {
  return /^@[a-z0-9_-]+\/[a-z0-9_-]+$/.test(ns)
}

// Ping rápido al upstream para verificar que responde MCP
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
    // 200, 401, 405 — todos indican que hay algo escuchando
    return res.status < 500
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  // 1. Leer body
  let body: {
    namespace?: string
    display_name?: string
    description?: string
    upstream_url?: string
    email?: string
    api_key?: string
  }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 })
  }

  const { namespace, display_name, description, upstream_url, email, api_key } = body

  // 2. Validar campos obligatorios
  if (!namespace || !display_name || !upstream_url) {
    return Response.json(
      { error: "Faltan campos: namespace, display_name, upstream_url" },
      { status: 400 }
    )
  }

  if (!isValidNamespace(namespace)) {
    return Response.json(
      { error: "Namespace inválido. Formato: @usuario/nombre (solo minúsculas, guiones y números)" },
      { status: 400 }
    )
  }

  if (!upstream_url.startsWith("https://")) {
    return Response.json({ error: "upstream_url debe ser HTTPS" }, { status: 400 })
  }

  // 3. Verificar que el upstream responde
  const alive = await pingUpstream(upstream_url)
  if (!alive) {
    return Response.json(
      { error: "El servidor upstream no responde. Verifica que está en línea y accesible." },
      { status: 422 }
    )
  }

  // 5. Insertar en registry (upsert por namespace)
  const { error: dbError } = await supabase
    .from("mcp_servers")
    .upsert(
      {
        namespace,
        display_name,
        description: description ?? "",
        upstream_url,
        owner_email: email ?? "",
        is_active: true,
      },
      { onConflict: "namespace" }
    )

  if (dbError) {
    console.error("Supabase insert error:", dbError)
    return Response.json({ error: "Error guardando el servidor" }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://spainmcp-fngo.vercel.app"
  const gatewayUrl = `${baseUrl}/api/gateway/${namespace}`

  return Response.json({
    success: true,
    namespace,
    gateway_url: gatewayUrl,
    message: `Tu MCP está disponible en ${gatewayUrl}`,
  })
}
