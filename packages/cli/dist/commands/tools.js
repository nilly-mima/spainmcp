const API_BASE = "https://spainmcp-fngo.vercel.app";
export async function toolsCommand(options) {
    const apiKey = options.key ?? process.env.SPAINMCP_API_KEY;
    if (!apiKey) {
        console.error("✗ Se necesita una API key.");
        console.log('  Usa: npx spainmcp tools --key "sk-spainmcp-..."');
        process.exit(1);
    }
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
    if (!res.ok) {
        console.error(`✗ Error: ${res.status}`);
        process.exit(1);
    }
    let tools = [];
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/event-stream")) {
        const text = await res.text();
        for (const line of text.split("\n").filter((l) => l.startsWith("data: "))) {
            try {
                const json = JSON.parse(line.slice(6));
                if (json.result?.tools) {
                    tools = json.result.tools;
                    break;
                }
            }
            catch { /* ignore */ }
        }
    }
    else {
        const data = (await res.json());
        tools = data?.result?.tools ?? [];
    }
    console.log(`\nSpainMCP Tools (${tools.length})\n${"─".repeat(40)}`);
    tools.forEach((t) => {
        console.log(`\n  ${t.name}`);
        console.log(`  ${t.description}`);
    });
    console.log();
}
//# sourceMappingURL=tools.js.map