import * as readline from "readline"

const API_BASE = "https://spainmcp-fngo.vercel.app"

export async function publishCommand(options: {
  namespace?: string
  name?: string
  description?: string
  url?: string
  key?: string
  email?: string
}) {
  console.log("\nPublicar tu MCP en SpainMCP\n" + "─".repeat(40))

  const apiKey = options.key ?? process.env.SPAINMCP_API_KEY
  if (!apiKey) {
    console.error("✗ Se necesita una API key.")
    console.log('  Usa: npx spainmcp publish --key "sk-spainmcp-..."')
    console.log("  O consigue una en: https://spainmcp-fngo.vercel.app/get-key")
    process.exit(1)
  }

  // Recoger campos interactivamente si no vienen como flags
  const namespace   = options.namespace   ?? await prompt('Namespace (@usuario/nombre-mcp): ')
  const displayName = options.name        ?? await prompt('Nombre visible (ej: "Mi MCP"): ')
  const description = options.description ?? await prompt('Descripción breve: ')
  const upstreamUrl = options.url         ?? await prompt('URL de tu MCP server (https://...): ')
  const email       = options.email       ?? await prompt('Tu email: ')

  console.log("\nVerificando que tu servidor responde...")

  const res = await fetch(`${API_BASE}/api/servers/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      namespace:    namespace.trim(),
      display_name: displayName.trim(),
      description:  description.trim(),
      upstream_url: upstreamUrl.trim(),
      email:        email.trim(),
      api_key:      apiKey,
    }),
  })

  const data = (await res.json()) as {
    success?: boolean
    namespace?: string
    gateway_url?: string
    message?: string
    error?: string
  }

  if (!res.ok || !data.success) {
    console.error(`\n✗ Error: ${data.error ?? "Error inesperado"}`)
    process.exit(1)
  }

  console.log(`\n✓ MCP publicado correctamente`)
  console.log(`  Namespace:   ${data.namespace}`)
  console.log(`  Gateway URL: ${data.gateway_url}`)
  console.log(`\nTus usuarios pueden conectarse con:`)
  console.log(`  npx spainmcp connect --client claude --upstream "${data.gateway_url}"`)
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer) })
  })
}
