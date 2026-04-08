import PostalMime from "postal-mime";

export interface Env {
  SUPABASE_URL: string;
  MCP_ENDPOINT: string;
  MCP_BEARER_TOKEN: string; // set via wrangler secret
}

// ---------------------------------------------------------------------------
// Tool detection from email body
// ---------------------------------------------------------------------------

interface DetectedTool {
  name: string;
  params: Record<string, string>;
}

function detectTool(text: string): DetectedTool | null {
  const lower = text.toLowerCase();

  if (/\bboe\b|bolet[ií]n|legislaci[oó]n/.test(lower)) {
    return { name: "boe_del_dia", params: {} };
  }

  if (/\bborme\b|empresa|mercantil/.test(lower)) {
    return { name: "borme_del_dia", params: {} };
  }

  if (/\btiempo\b|aemet|meteorolog[ií]a/.test(lower)) {
    // Try to extract a city name after "en" or "de"
    const cityMatch = text.match(/(?:tiempo|meteorolog[ií]a)\s+(?:en|de)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i);
    const ciudad = cityMatch ? cityMatch[1].trim() : "Madrid";
    return { name: "tiempo_aemet", params: { ciudad } };
  }

  if (/\bine\b|estad[ií]sticas?|poblaci[oó]n/.test(lower)) {
    // Use full body as query, trimmed
    const query = text.replace(/\n/g, " ").trim().slice(0, 200);
    return { name: "datos_ine", params: { consulta: query } };
  }

  if (/\bping\b|estado/.test(lower)) {
    return { name: "ping", params: {} };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Call MCP endpoint (JSON-RPC over SSE)
// ---------------------------------------------------------------------------

async function callMcpTool(
  endpoint: string,
  token: string,
  toolName: string,
  params: Record<string, string>
): Promise<string> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: params,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return `Error al consultar SpainMCP (HTTP ${res.status}): ${await res.text()}`;
  }

  const contentType = res.headers.get("content-type") || "";

  // Handle SSE response
  if (contentType.includes("text/event-stream")) {
    const raw = await res.text();
    return parseSseResponse(raw);
  }

  // Handle plain JSON response
  if (contentType.includes("application/json")) {
    const json = (await res.json()) as {
      result?: { content?: Array<{ text?: string }> };
      error?: { message?: string };
    };
    if (json.error) {
      return `Error: ${json.error.message}`;
    }
    if (json.result?.content) {
      return json.result.content.map((c) => c.text ?? "").join("\n");
    }
    return JSON.stringify(json, null, 2);
  }

  // Fallback: return raw text
  return await res.text();
}

function parseSseResponse(raw: string): string {
  const lines = raw.split("\n");
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      dataLines.push(line.slice(6));
    }
  }

  if (dataLines.length === 0) {
    return raw; // No SSE structure, return as-is
  }

  // Try to parse the last data line as JSON-RPC result
  for (let i = dataLines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(dataLines[i]) as {
        result?: { content?: Array<{ text?: string }> };
        error?: { message?: string };
      };
      if (parsed.error) {
        return `Error: ${parsed.error.message}`;
      }
      if (parsed.result?.content) {
        return parsed.result.content.map((c) => c.text ?? "").join("\n");
      }
    } catch {
      // Not JSON, continue
    }
  }

  // Return all data lines joined
  return dataLines.join("\n");
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

const HELP_TEXT = `Hola! Soy el asistente de SpainMCP por email.

Puedes consultarme enviando un email con alguna de estas palabras clave:

  - BOE / boletín / legislación  -->  Resumen del BOE del día
  - BORME / empresa / mercantil  -->  Resumen del BORME del día
  - tiempo / AEMET / meteorología en [ciudad]  -->  Tiempo actual
  - INE / estadísticas / población  -->  Datos del INE
  - ping / estado  -->  Verificar que el servicio funciona

Ejemplo de asunto: "Tiempo en Barcelona"

---
Respuesta automática de SpainMCP
https://spainmcp-fngo.vercel.app`;

// ---------------------------------------------------------------------------
// Build reply
// ---------------------------------------------------------------------------

function buildReplyBody(result: string): string {
  return `${result}

---
Respuesta automática de SpainMCP
https://spainmcp-fngo.vercel.app`;
}

// ---------------------------------------------------------------------------
// Email handler
// ---------------------------------------------------------------------------

export default {
  async email(
    message: ForwardableEmailMessage,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    const rawEmail = await new Response(message.raw).arrayBuffer();
    const parser = new PostalMime();
    const parsed = await parser.parse(rawEmail);

    const senderAddress = message.from;
    const subject = parsed.subject || "(sin asunto)";
    const body = parsed.text || parsed.html?.replace(/<[^>]+>/g, " ") || "";

    // Combine subject + body for detection
    const fullText = `${subject}\n${body}`;
    const detected = detectTool(fullText);

    let replyBody: string;

    if (!detected) {
      replyBody = HELP_TEXT;
    } else {
      const result = await callMcpTool(
        env.MCP_ENDPOINT,
        env.MCP_BEARER_TOKEN,
        detected.name,
        detected.params
      );
      replyBody = buildReplyBody(result);
    }

    // Create the reply email
    const replyMessage = createReplyEmail({
      to: senderAddress,
      from: message.to,
      subject: `Re: ${subject}`,
      body: replyBody,
      inReplyTo: parsed.messageId || undefined,
    });

    // Send reply via the message object
    const replyHeaders = new Headers();
    replyHeaders.set("In-Reply-To", parsed.messageId || "");
    replyHeaders.set("Auto-Submitted", "auto-replied");

    // Use the Workers Email Reply API
    const reply = new EmailMessage(
      message.to,
      senderAddress,
      replyMessage
    );

    await message.reply(reply);
  },
} satisfies ExportedHandler<Env>;

// ---------------------------------------------------------------------------
// MIME email builder (minimal)
// ---------------------------------------------------------------------------

function createReplyEmail(opts: {
  to: string;
  from: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}): ReadableStream {
  const boundary = `----spainmcp-${Date.now()}`;
  const headers = [
    `From: SpainMCP <${opts.from}>`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    opts.inReplyTo ? `In-Reply-To: ${opts.inReplyTo}` : "",
    opts.inReplyTo ? `References: ${opts.inReplyTo}` : "",
    `Auto-Submitted: auto-replied`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    "",
    opts.body,
  ]
    .filter(Boolean)
    .join("\r\n");

  const encoder = new TextEncoder();
  const encoded = encoder.encode(headers);

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
}
