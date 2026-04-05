/**
 * Read/write MCP client configs — adapted from Smithery CLI (Apache-2.0)
 * Handles the different config formats per client.
 */
import * as fs from "fs";
import * as path from "path";
import { getOS } from "./clients.js";
const SERVER_NAME = "spainmcp";
const MCP_URL = "https://spainmcp-fngo.vercel.app/api/mcp";
// ── Detect mcp-remote path ────────────────────────────────────────────────────
function getMcpRemotePath() {
    const os = getOS();
    if (os === "windows") {
        const npmRoot = process.env.APPDATA
            ? path.join(process.env.APPDATA, "npm", "mcp-remote.cmd")
            : "mcp-remote";
        return fs.existsSync(npmRoot) ? npmRoot : "mcp-remote";
    }
    return "mcp-remote";
}
// ── Build the MCP server entry ────────────────────────────────────────────────
function buildEntry(apiKey) {
    const mcpRemote = getMcpRemotePath();
    return {
        command: mcpRemote,
        args: [MCP_URL, "--header", `Authorization: Bearer ${apiKey}`],
    };
}
// ── Claude Desktop format ─────────────────────────────────────────────────────
// { "mcpServers": { "spainmcp": { command, args } } }
function addToClaudeConfig(configPath, apiKey) {
    let config = {};
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    if (!config.mcpServers)
        config.mcpServers = {};
    config.mcpServers[SERVER_NAME] = buildEntry(apiKey);
    writeJson(configPath, config);
}
// ── Cursor / Windsurf / Cline format ─────────────────────────────────────────
// { "mcpServers": { "spainmcp": { command, args } } }
function addToMcpJson(configPath, apiKey) {
    let config = {};
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    if (!config.mcpServers)
        config.mcpServers = {};
    config.mcpServers[SERVER_NAME] = buildEntry(apiKey);
    writeJson(configPath, config);
}
// ── VS Code format ────────────────────────────────────────────────────────────
// settings.json: { "mcp": { "servers": { "spainmcp": { command, args } } } }
function addToVSCodeConfig(configPath, apiKey) {
    let config = {};
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    if (!config.mcp)
        config.mcp = {};
    const mcp = config.mcp;
    if (!mcp.servers)
        mcp.servers = {};
    mcp.servers[SERVER_NAME] = buildEntry(apiKey);
    writeJson(configPath, config);
}
// ── Public API ────────────────────────────────────────────────────────────────
export function writeClientConfig(client, apiKey) {
    const os = getOS();
    const configPath = client.configPath[os];
    if (!configPath)
        throw new Error(`Client ${client.id} not supported on ${os}`);
    // Ensure directory exists
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    if (client.id === "claude") {
        addToClaudeConfig(configPath, apiKey);
    }
    else if (client.id === "vscode" || client.id === "vscode-insiders") {
        addToVSCodeConfig(configPath, apiKey);
    }
    else {
        addToMcpJson(configPath, apiKey);
    }
    return configPath;
}
export function removeClientConfig(client) {
    const os = getOS();
    const configPath = client.configPath[os];
    if (!configPath || !fs.existsSync(configPath))
        return false;
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (client.id === "vscode" || client.id === "vscode-insiders") {
        const mcp = config?.mcp?.servers;
        if (mcp)
            delete mcp[SERVER_NAME];
    }
    else {
        const servers = config?.mcpServers;
        if (servers)
            delete servers[SERVER_NAME];
    }
    writeJson(configPath, config);
    return true;
}
export function isClientConfigured(client) {
    const os = getOS();
    const configPath = client.configPath[os];
    if (!configPath || !fs.existsSync(configPath))
        return false;
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (client.id === "vscode" || client.id === "vscode-insiders") {
        return !!config?.mcp?.servers?.[SERVER_NAME];
    }
    return !!config?.mcpServers?.[SERVER_NAME];
}
// ── Utils ─────────────────────────────────────────────────────────────────────
function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
//# sourceMappingURL=config-io.js.map