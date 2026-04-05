const API_BASE = "https://spainmcp-fngo.vercel.app";
export async function testCommand(options) {
    const apiKey = options.key ?? process.env.SPAINMCP_API_KEY;
    if (!apiKey) {
        console.error("✗ Se necesita una API key.");
        console.log('  Usa: npx spainmcp test --key "sk-spainmcp-..."');
        console.log("  O define la variable de entorno SPAINMCP_API_KEY");
        process.exit(1);
    }
    console.log(`Probando conexión a ${API_BASE}...`);
    try {
        // MCP Streamable HTTP protocol — requires Accept: application/json, text/event-stream
        const res = await fetch(`${API_BASE}/api/mcp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json, text/event-stream",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/list",
                params: {},
            }),
        });
        if (res.status === 401) {
            console.error("✗ API key inválida o desactivada.");
            process.exit(1);
        }
        if (!res.ok) {
            console.error(`✗ Error del servidor: ${res.status} ${res.statusText}`);
            process.exit(1);
        }
        const ct = res.headers.get("content-type") ?? "";
        let tools = [];
        if (ct.includes("text/event-stream")) {
            // Parse SSE: extract the JSON-RPC result from the event data
            const text = await res.text();
            const dataLines = text.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of dataLines) {
                try {
                    const json = JSON.parse(line.slice(6));
                    if (json.result?.tools) {
                        tools = json.result.tools;
                        break;
                    }
                }
                catch { /* ignore malformed lines */ }
            }
        }
        else {
            const data = (await res.json());
            tools = data?.result?.tools ?? [];
        }
        console.log(`\n✓ Conexión correcta`);
        console.log(`  Servidor: SpainMCP`);
        console.log(`  Tools disponibles (${tools.length}):`);
        tools.forEach((t) => {
            console.log(`    • ${t.name} — ${t.description}`);
        });
    }
    catch (err) {
        console.error("✗ Error de red:", err.message);
        process.exit(1);
    }
}
//# sourceMappingURL=test.js.map