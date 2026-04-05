/**
 * MCP client registry — adapted from Smithery CLI (Apache-2.0)
 * Maps client IDs to config file paths per OS.
 */

export type OS = "windows" | "mac" | "linux"
export type ClientId =
  | "claude"
  | "cursor"
  | "vscode"
  | "vscode-insiders"
  | "windsurf"
  | "cline"

export interface ClientInfo {
  id: ClientId
  name: string
  configPath: Record<OS, string | null>
}

const HOME = process.env.HOME ?? process.env.USERPROFILE ?? ""

function win(p: string) {
  return p.replace(/\//g, "\\")
}

export const CLIENTS: ClientInfo[] = [
  {
    id: "claude",
    name: "Claude Desktop",
    configPath: {
      windows: win(`${process.env.APPDATA}\\Claude\\claude_desktop_config.json`),
      mac: `${HOME}/Library/Application Support/Claude/claude_desktop_config.json`,
      linux: `${HOME}/.config/Claude/claude_desktop_config.json`,
    },
  },
  {
    id: "cursor",
    name: "Cursor",
    configPath: {
      windows: win(`${HOME}\\.cursor\\mcp.json`),
      mac: `${HOME}/.cursor/mcp.json`,
      linux: `${HOME}/.cursor/mcp.json`,
    },
  },
  {
    id: "vscode",
    name: "VS Code",
    configPath: {
      windows: win(`${process.env.APPDATA}\\Code\\User\\settings.json`),
      mac: `${HOME}/Library/Application Support/Code/User/settings.json`,
      linux: `${HOME}/.config/Code/User/settings.json`,
    },
  },
  {
    id: "vscode-insiders",
    name: "VS Code Insiders",
    configPath: {
      windows: win(`${process.env.APPDATA}\\Code - Insiders\\User\\settings.json`),
      mac: `${HOME}/Library/Application Support/Code - Insiders/User/settings.json`,
      linux: `${HOME}/.config/Code - Insiders/User/settings.json`,
    },
  },
  {
    id: "windsurf",
    name: "Windsurf",
    configPath: {
      windows: win(`${HOME}\\.codeium\\windsurf\\mcp_config.json`),
      mac: `${HOME}/.codeium/windsurf/mcp_config.json`,
      linux: `${HOME}/.codeium/windsurf/mcp_config.json`,
    },
  },
  {
    id: "cline",
    name: "Cline (VS Code extension)",
    configPath: {
      windows: win(`${process.env.APPDATA}\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json`),
      mac: `${HOME}/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`,
      linux: `${HOME}/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`,
    },
  },
]

export function getOS(): OS {
  if (process.platform === "win32") return "windows"
  if (process.platform === "darwin") return "mac"
  return "linux"
}

export function getClient(id: string): ClientInfo | undefined {
  return CLIENTS.find((c) => c.id === id)
}
