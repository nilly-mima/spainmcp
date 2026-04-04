import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY!)

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function POST(req: Request) {
  // 1. Leer email del body
  let email: string
  try {
    const body = await req.json()
    email = body.email?.trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Email inválido" }, { status: 400 })
    }
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 })
  }

  // 2. Generar API key
  const rawKey = `sk-spainmcp-${crypto.randomUUID().replace(/-/g, "")}`
  const hash = await sha256(rawKey)
  const keyPrefix = rawKey.slice(0, 20) + "..."

  // 3. Guardar en Supabase (solo el hash — la key nunca se guarda en claro)
  const { error: dbError } = await supabase.from("api_keys").insert({
    key_hash: hash,
    key_prefix: keyPrefix,
    email,
    tier: "free",
  })

  if (dbError) {
    console.error("Supabase insert error:", dbError)
    return Response.json({ error: "Error guardando la clave" }, { status: 500 })
  }

  // 4. Enviar key por email (única vez — no se puede recuperar después)
  const { error: emailError } = await resend.emails.send({
    from: "SpainMCP <noreply@mcp.lat>",
    to: email,
    subject: "Tu API key de SpainMCP",
    html: `
      <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="font-size:20px;font-weight:bold;margin-bottom:16px">Tu API key de SpainMCP</h2>
        <p>Aquí está tu clave de acceso. <strong>Guárdala en un lugar seguro — no se puede recuperar.</strong></p>
        <pre style="background:#f4f4f4;padding:16px;border-radius:8px;font-size:14px;overflow-x:auto">${rawKey}</pre>
        <p style="margin-top:24px;font-size:14px;color:#666">
          Conéctate en Claude Desktop, Cursor o cualquier cliente MCP:<br/>
          <code>url: https://mcp.lat/api/mcp</code><br/>
          <code>Authorization: Bearer ${rawKey}</code>
        </p>
        <p style="margin-top:16px;font-size:12px;color:#999">
          Plan: Gratuito · Límite: 100 llamadas/día<br/>
          Soporte: hola@mcp.lat
        </p>
      </div>
    `,
  })

  if (emailError) {
    console.error("Resend error:", emailError)
  }

  // 5. Devolver la key en el response (patrón OpenAI — mostrada una sola vez, segura por HTTPS)
  return Response.json({
    success: true,
    key: rawKey,
    key_prefix: keyPrefix,
    email_sent: !emailError,
  })
}
