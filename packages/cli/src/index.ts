#!/usr/bin/env node
import { Command } from "commander"
import { connectCommand } from "./commands/connect.js"
import { testCommand } from "./commands/test.js"
import { toolsCommand } from "./commands/tools.js"
import { publishCommand } from "./commands/publish.js"
import { CLIENTS } from "./clients.js"

const program = new Command()

program
  .name("spainmcp")
  .description("CLI para conectar SpainMCP a tu cliente MCP favorito")
  .version("0.1.0")

program
  .command("connect")
  .description("Configura SpainMCP en Claude Desktop, Cursor, VS Code u otros clientes")
  .option("-c, --client <id>", `Cliente a configurar: ${CLIENTS.map((c) => c.id).join(", ")}`)
  .option("-k, --key <apikey>", "Tu API key (sk-spainmcp-...)")
  .action(connectCommand)

program
  .command("test")
  .description("Comprueba que tu API key funciona y lista las tools disponibles")
  .option("-k, --key <apikey>", "Tu API key (sk-spainmcp-...)")
  .action(testCommand)

program
  .command("tools")
  .description("Lista todas las tools disponibles en SpainMCP")
  .option("-k, --key <apikey>", "Tu API key (sk-spainmcp-...)")
  .action(toolsCommand)

program
  .command("publish")
  .description("Publica tu propio MCP server en el registry de SpainMCP")
  .option("-k, --key <apikey>", "Tu API key (sk-spainmcp-...)")
  .option("-n, --namespace <ns>", "Namespace, ej: @miempresa/mi-mcp")
  .option("--name <name>", "Nombre visible de tu MCP")
  .option("-d, --description <desc>", "Descripción breve")
  .option("-u, --url <url>", "URL de tu MCP server (https://...)")
  .option("-e, --email <email>", "Tu email")
  .action(publishCommand)

program.parse()
