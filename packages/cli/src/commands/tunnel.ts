import { Command } from "commander"
import { apiRequest, requireApiKey, isJsonMode } from "../api.js"

interface TunnelRecord {
  tunnelId?: string
  publicUrl?: string
  expiresAt?: string
  localUrl?: string
  name?: string
}

const PING_INTERVAL_MS = 60_000 // 1 minuto

async function tunnelAction(options: {
  port?: string
  localUrl?: string
  name?: string
  json?: boolean
}) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()

  if (!options.port && !options.localUrl) {
    console.error("Se requiere --port <número> o --local-url <url>")
    console.error("  Ejemplo: spainmcp tunnel --port 3001")
    process.exit(1)
  }

  const body: Record<string, unknown> = {}
  if (options.port) {
    const port = parseInt(options.port, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error("El puerto debe ser un número entre 1 y 65535")
      process.exit(1)
    }
    body.port = port
  } else if (options.localUrl) {
    body.localUrl = options.localUrl
  }

  if (options.name) body.name = options.name

  let tunnel: TunnelRecord
  try {
    tunnel = await apiRequest<TunnelRecord>("POST", "/api/v1/tunnel", body, { apiKey })
  } catch (err) {
    console.error(`Error al crear el túnel: ${(err as Error).message}`)
    process.exit(1)
  }

  if (json) {
    console.log(JSON.stringify(tunnel))
    return
  }

  console.log("\nTúnel activo")
  console.log("─".repeat(50))
  console.log(`  ID:          ${tunnel.tunnelId}`)
  console.log(`  URL pública: ${tunnel.publicUrl}`)
  console.log(`  Local:       ${tunnel.localUrl}`)
  if (tunnel.name) console.log(`  Nombre:      ${tunnel.name}`)
  console.log(`  Expira:      ${tunnel.expiresAt ? new Date(tunnel.expiresAt).toLocaleString("es-ES") : "–"}`)
  console.log("\nComparte esta URL con quien necesite acceder a tu servidor local.")
  console.log("Pulsa Ctrl+C para cerrar el túnel.\n")

  // Ping periódico para mantener el proceso vivo y recordar la URL
  const tunnelId = tunnel.tunnelId!
  const pingHandle = setInterval(() => {
    process.stdout.write(`[${new Date().toLocaleTimeString("es-ES")}] Túnel activo — ${tunnel.publicUrl}\n`)
  }, PING_INTERVAL_MS)

  // Cierre limpio
  const shutdown = async (signal: string) => {
    clearInterval(pingHandle)
    if (json) {
      process.exit(0)
    }
    process.stdout.write(`\n[${signal}] Cerrando túnel ${tunnelId}...\n`)
    try {
      await apiRequest("DELETE", `/api/v1/tunnel?tunnelId=${tunnelId}`, undefined, { apiKey })
      console.log("Túnel cerrado correctamente.")
    } catch {
      console.error("No se pudo cerrar el túnel en el servidor. Expirará automáticamente.")
    }
    process.exit(0)
  }

  process.on("SIGINT", () => shutdown("SIGINT"))
  process.on("SIGTERM", () => shutdown("SIGTERM"))
}

export function registerTunnelCommands(program: Command) {
  program
    .command("tunnel")
    .description("Expón tu servidor MCP local en internet para pruebas")
    .option("-p, --port <number>", "Puerto local donde corre tu servidor MCP")
    .option("-l, --local-url <url>", "URL local completa (ej: http://localhost:3001)")
    .option("-n, --name <name>", "Nombre descriptivo del túnel")
    .option("--json", "Salida en formato JSON y salir inmediatamente")
    .action(tunnelAction)
}
