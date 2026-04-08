#!/usr/bin/env node
import { Command } from "commander"
import { connectCommand } from "./commands/connect.js"
import { registerAuthCommands } from "./commands/auth.js"
import { registerMcpCommands } from "./commands/mcp.js"
import { registerToolCommands } from "./commands/tool.js"
import { registerNamespaceCommands } from "./commands/namespace.js"
import { registerTunnelCommands } from "./commands/tunnel.js"
import { CLIENTS } from "./clients.js"

const program = new Command()

program
  .name("spainmcp")
  .description("CLI for SpainMCP — connect, manage, and publish MCP servers")
  .version("0.2.0")

// ── Group 1: auth ─────────────────────────────────────────────────────────────
registerAuthCommands(program)

// ── Group 2: mcp ──────────────────────────────────────────────────────────────
registerMcpCommands(program)

// ── Group 3: tool ─────────────────────────────────────────────────────────────
registerToolCommands(program)

// ── Group 4: namespace ────────────────────────────────────────────────────────
registerNamespaceCommands(program)

// ── Group 5: tunnel ───────────────────────────────────────────────────────────
registerTunnelCommands(program)

// ── Group 6: connect (backwards compat) ───────────────────────────────────────
program
  .command("connect")
  .description("Configure SpainMCP in Claude Desktop, Cursor, VS Code or others")
  .option("-c, --client <id>", `Client to configure: ${CLIENTS.map((c) => c.id).join(", ")}`)
  .option("-k, --key <apikey>", "Your API key (sk-spainmcp-...)")
  .action(connectCommand)

program.parse()
