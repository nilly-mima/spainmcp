import { Command } from "commander"
import { getBaseUrl, getApiKey } from "../config.js"
import { requireApiKey, isJsonMode } from "../api.js"

interface McpTool {
  name: string
  description?: string
  inputSchema?: unknown
}

async function mcpPost(
  connectionId: string,
  method: string,
  params: unknown,
  apiKey: string
): Promise<unknown> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/api/gateway/${connectionId}`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })

  if (res.status === 401) {
    throw new Error("Unauthorized. Check your API key.")
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }

  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("text/event-stream")) {
    const text = await res.text()
    for (const line of text.split("\n").filter((l) => l.startsWith("data: "))) {
      try {
        const parsed = JSON.parse(line.slice(6)) as { result?: unknown; error?: unknown }
        if (parsed.error) throw new Error(JSON.stringify(parsed.error))
        if (parsed.result !== undefined) return parsed.result
      } catch (e) {
        if ((e as Error).message.startsWith("{")) throw e
      }
    }
    return null
  }

  const data = (await res.json()) as { result?: unknown; error?: unknown }
  if (data.error) throw new Error(JSON.stringify(data.error))
  return data.result ?? null
}

async function listAction(connectionId: string, options: { json?: boolean }) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()

  try {
    const result = (await mcpPost(connectionId, "tools/list", {}, apiKey)) as {
      tools?: McpTool[]
    } | null

    const tools = result?.tools ?? []
    if (json) {
      console.log(JSON.stringify(tools))
    } else {
      if (tools.length === 0) {
        console.log(`No tools found for connection ${connectionId}`)
        return
      }
      console.log(`Tools for ${connectionId} (${tools.length})`)
      console.log("─".repeat(50))
      for (const t of tools) {
        console.log(`\n  ${t.name}`)
        if (t.description) console.log(`  ${t.description}`)
      }
      console.log()
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

async function callAction(
  connectionId: string,
  toolName: string,
  args: string | undefined,
  options: { json?: boolean }
) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()

  let parsedArgs: unknown = {}
  if (args) {
    try {
      parsedArgs = JSON.parse(args)
    } catch {
      console.error("Invalid JSON for args. Example: '{\"city\":\"Madrid\"}'")
      process.exit(1)
    }
  }

  try {
    const result = await mcpPost(
      connectionId,
      "tools/call",
      { name: toolName, arguments: parsedArgs },
      apiKey
    )
    if (json) {
      console.log(JSON.stringify(result))
    } else {
      if (result === null || result === undefined) {
        console.log("(no result)")
        return
      }
      const r = result as { content?: Array<{ type: string; text?: string }> }
      if (r.content) {
        for (const block of r.content) {
          if (block.type === "text") console.log(block.text)
          else console.log(JSON.stringify(block))
        }
      } else {
        console.log(JSON.stringify(result, null, 2))
      }
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

export function registerToolCommands(program: Command) {
  const tool = program.command("tool").description("Call tools via MCP proxy")

  tool
    .command("list <connectionId>")
    .description("List tools available on an MCP connection")
    .option("--json", "Machine-readable output")
    .action(listAction)

  tool
    .command("call <connectionId> <toolName> [args]")
    .description("Call a tool via MCP proxy (args as JSON string)")
    .option("--json", "Machine-readable output")
    .action(callAction)
}
