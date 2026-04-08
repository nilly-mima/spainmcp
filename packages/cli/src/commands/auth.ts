import * as readline from "readline"
import { Command } from "commander"
import { readConfig, writeConfig, clearConfig, getConfigFilePath } from "../config.js"
import { apiRequest, isJsonMode } from "../api.js"

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer) })
  })
}

async function loginAction(options: { json?: boolean }) {
  const json = isJsonMode(options)
  const apiKey = await prompt("Paste your API key (sk-spainmcp-...): ")
  const trimmed = apiKey.trim()

  if (!trimmed.startsWith("sk-spainmcp-")) {
    console.error("Invalid API key. Must start with 'sk-spainmcp-'")
    process.exit(1)
  }

  writeConfig({ apiKey: trimmed })

  if (json) {
    console.log(JSON.stringify({ ok: true, configFile: getConfigFilePath() }))
  } else {
    console.log(`Saved to ${getConfigFilePath()}`)
  }
}

async function logoutAction(options: { json?: boolean }) {
  const json = isJsonMode(options)
  clearConfig()
  if (json) {
    console.log(JSON.stringify({ ok: true }))
  } else {
    console.log("Credentials removed.")
  }
}

async function whoamiAction(options: { json?: boolean }) {
  const json = isJsonMode(options)
  const config = readConfig()
  const apiKey = config.apiKey ?? process.env.SPAINMCP_API_KEY

  if (!apiKey) {
    if (json) {
      console.log(JSON.stringify({ authenticated: false }))
    } else {
      console.log("Not authenticated. Run: spainmcp auth login")
    }
    return
  }

  try {
    const data = await apiRequest<{ user?: { email?: string; id?: string } }>(
      "GET",
      "/api/v1/auth/me",
      undefined,
      { apiKey }
    )
    if (json) {
      console.log(JSON.stringify({ authenticated: true, ...data.user }))
    } else {
      console.log(`Authenticated`)
      if (data.user?.email) console.log(`  Email: ${data.user.email}`)
      if (data.user?.id)    console.log(`  ID:    ${data.user.id}`)
    }
  } catch {
    if (json) {
      console.log(JSON.stringify({ authenticated: true, apiKey: apiKey.slice(0, 20) + "..." }))
    } else {
      console.log(`Authenticated (API key: ${apiKey.slice(0, 20)}...)`)
    }
  }
}

async function tokenAction(options: { json?: boolean; scopes?: string }) {
  const json = isJsonMode(options)
  const apiKey = (() => {
    const config = readConfig()
    const key = config.apiKey ?? process.env.SPAINMCP_API_KEY
    if (!key) {
      console.error("Not authenticated. Run: spainmcp auth login")
      process.exit(1)
    }
    return key
  })()

  try {
    const body: Record<string, unknown> = {}
    if (options.scopes) body.scopes = options.scopes.split(",").map((s) => s.trim())

    const data = await apiRequest<{ token?: string; expiresAt?: string }>(
      "POST",
      "/api/v1/auth/token",
      body,
      { apiKey }
    )
    if (json) {
      console.log(JSON.stringify(data))
    } else {
      console.log(`Token: ${data.token}`)
      if (data.expiresAt) console.log(`Expires: ${data.expiresAt}`)
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`)
    process.exit(1)
  }
}

export function registerAuthCommands(program: Command) {
  const auth = program.command("auth").description("Authentication and credentials")

  auth
    .command("login")
    .description("Save API key to ~/.spainmcp/config.json")
    .option("--json", "Machine-readable output")
    .action(loginAction)

  auth
    .command("logout")
    .description("Remove saved credentials")
    .option("--json", "Machine-readable output")
    .action(logoutAction)

  auth
    .command("whoami")
    .description("Show current auth status")
    .option("--json", "Machine-readable output")
    .action(whoamiAction)

  auth
    .command("token")
    .description("Create scoped service token")
    .option("--scopes <scopes>", "Comma-separated scopes (e.g. read,write)")
    .option("--json", "Machine-readable output")
    .action(tokenAction)
}
