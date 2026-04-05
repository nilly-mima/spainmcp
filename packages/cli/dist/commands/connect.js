import * as readline from "readline";
import { CLIENTS, getClient, getOS } from "../clients.js";
import { isClientConfigured, writeClientConfig } from "../config-io.js";
const API_BASE = "https://spainmcp-fngo.vercel.app";
export async function connectCommand(options) {
    const os = getOS();
    // 1. Resolve client
    let clientId = options.client;
    if (!clientId) {
        console.log("\nClientes disponibles:");
        CLIENTS.forEach((c, i) => {
            const supported = c.configPath[os] !== null;
            const status = supported ? "" : " (no disponible en este OS)";
            console.log(`  ${i + 1}. ${c.name} [${c.id}]${status}`);
        });
        clientId = await prompt("\n¿Qué cliente quieres configurar? (ej: claude, cursor, vscode): ");
    }
    const client = getClient(clientId.trim());
    if (!client) {
        console.error(`✗ Cliente desconocido: "${clientId}"`);
        console.log(`Opciones: ${CLIENTS.map((c) => c.id).join(", ")}`);
        process.exit(1);
    }
    if (client.configPath[os] === null) {
        console.error(`✗ ${client.name} no está disponible en ${os}`);
        process.exit(1);
    }
    // 2. Check if already configured
    if (isClientConfigured(client)) {
        const overwrite = await prompt(`⚠  SpainMCP ya está configurado en ${client.name}. ¿Sobreescribir? (s/N): `);
        if (!["s", "si", "sí", "y", "yes"].includes(overwrite.toLowerCase())) {
            console.log("Cancelado.");
            process.exit(0);
        }
    }
    // 3. Get API key
    let apiKey = options.key;
    if (!apiKey) {
        console.log("\n¿Tienes ya una API key de SpainMCP?");
        const hasKey = await prompt("  (s/N): ");
        if (["s", "si", "sí", "y", "yes"].includes(hasKey.toLowerCase())) {
            apiKey = await prompt("Pega tu API key (sk-spainmcp-...): ");
            apiKey = apiKey.trim();
        }
        else {
            // Generate new key
            console.log("\nGenerando tu API key gratuita...");
            const email = await prompt("Tu email: ");
            apiKey = await requestKey(email.trim());
            console.log(`\n✓ API key generada. También se ha enviado a ${email}.`);
        }
    }
    if (!apiKey.startsWith("sk-spainmcp-")) {
        console.error("✗ La API key debe empezar por 'sk-spainmcp-'");
        process.exit(1);
    }
    // 4. Write config
    const configPath = writeClientConfig(client, apiKey);
    console.log(`\n✓ SpainMCP configurado en ${client.name}`);
    console.log(`  Config: ${configPath}`);
    console.log("\nReinicia el cliente para que se aplique la configuración.");
    console.log('\nPrueba que funciona con: npx spainmcp test --key "' + apiKey + '"');
}
async function requestKey(email) {
    const res = await fetch(`${API_BASE}/api/keys/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    const data = (await res.json());
    if (!res.ok || !data.success || !data.key) {
        throw new Error(data.error ?? "Error generando la clave");
    }
    console.log(`\n  Tu API key: ${data.key}\n  (Guárdala — no la volveremos a mostrar)`);
    return data.key;
}
function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
//# sourceMappingURL=connect.js.map