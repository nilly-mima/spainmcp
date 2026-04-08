import * as readline from "readline"
import { Command } from "commander"
import { apiRequest, requireApiKey, isJsonMode } from "../api.js"

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer) })
  })
}

interface ServerRecord {
  id?: string
  namespace?: string
  display_name?: string
  description?: string
  upstream_url?: string
  created_at?: string
}

interface ConnectionRecord {
  id?: string
  namespace?: string
  upstream_url?: string
  created_at?: string
}

async function searchAction(query: string, options: { json?: boolean }) {
  const json = isJsonMode(options)
  try {
    const data = await apiRequest<{ servers?: ServerRecord[] }>(
      "GET",
      `/api/v1/servers?q=${encodeURIComponent(query)}`
    )
    const servers = data.servers ?? []
    if (json) {
      console.log(JSON.stringify(servers))
    } else {
      if (servers.length === 0) {
        console.log(`No servers found for: ${query}`)
        return
      }
      console.log(`Results for "${query}" (${servers.length})`)
      console.log("─".repeat(50))
      for (const s of servers) {
        console.log(`\n  ${s.namespace ?? s.id}`)
        if (s.display_name) console.log(`  Name: ${s.display_name}`)
        if (s.description)  console.log(`  ${s.description}`)
      }
      console.log()
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

async function addAction(url: string, options: { json?: boolean }) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()
  try {
    const data = await apiRequest<ConnectionRecord>(
      "POST",
      "/api/v1/connections",
      { upstream_url: url },
      { apiKey }
    )
    if (json) {
      console.log(JSON.stringify(data))
    } else {
      console.log(`Connection created`)
      if (data.id)           console.log(`  ID:  ${data.id}`)
      if (data.upstream_url) console.log(`  URL: ${data.upstream_url}`)
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

async function listAction(options: { json?: boolean }) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()
  try {
    const data = await apiRequest<{ connections?: ConnectionRecord[] }>(
      "GET",
      "/api/v1/connections",
      undefined,
      { apiKey }
    )
    const connections = data.connections ?? []
    if (json) {
      console.log(JSON.stringify(connections))
    } else {
      if (connections.length === 0) {
        console.log("No connections. Add one with: spainmcp mcp add <url>")
        return
      }
      console.log(`Connections (${connections.length})`)
      console.log("─".repeat(50))
      for (const c of connections) {
        console.log(`  ${c.id}  ${c.upstream_url}`)
      }
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

async function removeAction(id: string, options: { json?: boolean }) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()
  try {
    await apiRequest<unknown>(
      "DELETE",
      `/api/v1/connections/${id}`,
      undefined,
      { apiKey }
    )
    if (json) {
      console.log(JSON.stringify({ ok: true, id }))
    } else {
      console.log(`Connection ${id} removed.`)
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

async function publishAction(
  url: string,
  options: { name?: string; json?: boolean }
) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()

  let namespace = options.name
  if (!namespace) {
    namespace = await prompt("Namespace (e.g. @myorg/my-mcp): ")
    namespace = namespace.trim()
  }

  if (!namespace) {
    console.error("Namespace is required. Use: spainmcp mcp publish <url> -n <namespace/name>")
    process.exit(1)
  }

  try {
    const data = await apiRequest<{ namespace?: string; gateway_url?: string }>(
      "PUT",
      `/api/v1/servers/${encodeURIComponent(namespace)}`,
      { upstream_url: url },
      { apiKey }
    )
    if (json) {
      console.log(JSON.stringify(data))
    } else {
      console.log(`Published`)
      if (data.namespace)   console.log(`  Namespace:   ${data.namespace}`)
      if (data.gateway_url) console.log(`  Gateway URL: ${data.gateway_url}`)
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

export function registerMcpCommands(program: Command) {
  const mcp = program.command("mcp").description("MCP server management")

  mcp
    .command("search <query>")
    .description("Search MCP servers in the registry")
    .option("--json", "Machine-readable output")
    .action(searchAction)

  mcp
    .command("add <url>")
    .description("Create a connection to an MCP server")
    .option("--json", "Machine-readable output")
    .action(addAction)

  mcp
    .command("list")
    .description("List your MCP connections")
    .option("--json", "Machine-readable output")
    .action(listAction)

  mcp
    .command("remove <id>")
    .description("Delete an MCP connection")
    .option("--json", "Machine-readable output")
    .action(removeAction)

  mcp
    .command("publish <url>")
    .description("Publish an MCP server to the registry")
    .option("-n, --name <namespace>", "Namespace, e.g. @myorg/my-mcp")
    .option("--json", "Machine-readable output")
    .action(publishAction)
}
