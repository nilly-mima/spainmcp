import { getApiKey, getBaseUrl } from "./config.js"

export interface ApiError {
  error: string
  status: number
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { apiKey?: string }
): Promise<T> {
  const baseUrl = getBaseUrl()
  const apiKey = options?.apiKey ?? getApiKey()
  const url = `${baseUrl}${path}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let errMsg = `HTTP ${res.status} ${res.statusText}`
    try {
      const data = (await res.json()) as { error?: string; message?: string }
      errMsg = data.error ?? data.message ?? errMsg
    } catch { /* ignore */ }
    const err = new Error(errMsg) as Error & { status: number }
    err.status = res.status
    throw err
  }

  return res.json() as Promise<T>
}

export function requireApiKey(): string {
  const key = getApiKey()
  if (!key) {
    console.error("No API key found.")
    console.error("  Run: spainmcp auth login")
    console.error("  Or set SPAINMCP_API_KEY env var")
    process.exit(1)
  }
  return key
}

export function isJsonMode(options: { json?: boolean }): boolean {
  return options.json === true || !process.stdout.isTTY
}
