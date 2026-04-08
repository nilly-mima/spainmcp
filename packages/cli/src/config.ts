import * as fs from "fs"
import * as path from "path"
import * as os from "os"

export interface SpainMCPConfig {
  apiKey?: string
  baseUrl?: string
}

const CONFIG_DIR = path.join(os.homedir(), ".spainmcp")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")
const DEFAULT_BASE_URL = "https://spainmcp-fngo.vercel.app"

export function readConfig(): SpainMCPConfig {
  if (!fs.existsSync(CONFIG_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")) as SpainMCPConfig
  } catch {
    return {}
  }
}

export function writeConfig(updates: Partial<SpainMCPConfig>): void {
  const current = readConfig()
  const next = { ...current, ...updates }
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2) + "\n", "utf-8")
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE)
}

export function getApiKey(): string | undefined {
  return readConfig().apiKey ?? process.env.SPAINMCP_API_KEY
}

export function getBaseUrl(): string {
  return readConfig().baseUrl ?? process.env.SPAINMCP_BASE_URL ?? DEFAULT_BASE_URL
}

export function getConfigFilePath(): string {
  return CONFIG_FILE
}
