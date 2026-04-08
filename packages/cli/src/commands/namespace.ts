import { Command } from "commander"
import { apiRequest, requireApiKey, isJsonMode } from "../api.js"

interface NamespaceRecord {
  id?: string
  name?: string
  created_at?: string
}

async function listAction(options: { json?: boolean }) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()
  try {
    const data = await apiRequest<{ namespaces?: NamespaceRecord[] }>(
      "GET",
      "/api/v1/namespaces",
      undefined,
      { apiKey }
    )
    const namespaces = data.namespaces ?? []
    if (json) {
      console.log(JSON.stringify(namespaces))
    } else {
      if (namespaces.length === 0) {
        console.log("No namespaces. Create one with: spainmcp namespace create <name>")
        return
      }
      console.log(`Namespaces (${namespaces.length})`)
      console.log("─".repeat(40))
      for (const n of namespaces) {
        console.log(`  ${n.name ?? n.id}`)
      }
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

async function createAction(
  name: string | undefined,
  options: { generated?: boolean; json?: boolean }
) {
  const json = isJsonMode(options)
  const apiKey = requireApiKey()

  const body: Record<string, unknown> = {}
  if (options.generated) {
    body.generated = true
  } else if (name) {
    body.name = name
  } else {
    console.error("Provide a name or use --generated")
    process.exit(1)
  }

  try {
    const data = await apiRequest<NamespaceRecord>(
      "POST",
      "/api/v1/namespaces",
      body,
      { apiKey }
    )
    if (json) {
      console.log(JSON.stringify(data))
    } else {
      console.log(`Namespace created`)
      if (data.name) console.log(`  Name: ${data.name}`)
      if (data.id)   console.log(`  ID:   ${data.id}`)
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

export function registerNamespaceCommands(program: Command) {
  const ns = program.command("namespace").description("Namespace management")

  ns
    .command("list")
    .description("List your namespaces")
    .option("--json", "Machine-readable output")
    .action(listAction)

  ns
    .command("create [name]")
    .description("Create a namespace")
    .option("--generated", "Auto-generate a name")
    .option("--json", "Machine-readable output")
    .action(createAction)
}
