/**
 * SpainMCP E2E test runner
 * Usage: npx tsx scripts/test-e2e.ts
 *
 * Set TEST_BASE_URL env var to run against a different environment.
 * Set TEST_API_KEY to skip key generation and reuse an existing key.
 */

const BASE = process.env.TEST_BASE_URL ?? 'https://spainmcp-fngo.vercel.app'
const WORKER = 'https://spainmcp-connect.nilmiq.workers.dev'

let passed = 0
let failed = 0

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    console.log(`  ✓  ${name}`)
    passed++
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  ✗  ${name}\n       ${msg}`)
    failed++
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg)
}

function assertStatus(res: Response, expected: number | number[]): void {
  const ok = Array.isArray(expected)
    ? expected.includes(res.status)
    : res.status === expected
  if (!ok) {
    const allowed = Array.isArray(expected) ? expected.join(' | ') : String(expected)
    throw new Error(`Expected HTTP ${allowed}, got ${res.status}`)
  }
}

async function json(res: Response): Promise<unknown> {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Response is not JSON: ${text.slice(0, 120)}`)
  }
}

// ---------------------------------------------------------------------------
// State shared between tests
// ---------------------------------------------------------------------------
let apiKey = process.env.TEST_API_KEY ?? ''

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {

// ---------------------------------------------------------------------------
// Section: Health & basics
// ---------------------------------------------------------------------------
console.log('\nHealth & basics')

await test('GET /api/v1/health → 200 + {status:"ok"}', async () => {
  const res = await fetch(`${BASE}/api/v1/health`)
  assertStatus(res, 200)
  const body = await json(res) as Record<string, unknown>
  assert(body.status === 'ok', `status field is "${body.status}", expected "ok"`)
  assert(typeof body.version === 'string', 'missing version field')
  assert(typeof body.timestamp === 'string', 'missing timestamp field')
})

await test('GET /api/v1/servers → 200 + {servers:[], pagination:{}}', async () => {
  const res = await fetch(`${BASE}/api/v1/servers`)
  assertStatus(res, 200)
  const body = await json(res) as Record<string, unknown>
  assert(Array.isArray(body.servers), '"servers" must be an array')
  const pagination = body.pagination as Record<string, unknown>
  assert(typeof pagination === 'object' && pagination !== null, '"pagination" missing')
  assert(typeof pagination.currentPage === 'number', 'pagination.currentPage missing')
  assert(typeof pagination.totalCount === 'number', 'pagination.totalCount missing')
})

await test('GET /api/mcps → 200 + {mcps:[], total:N}', async () => {
  const res = await fetch(`${BASE}/api/mcps`)
  assertStatus(res, 200)
  const body = await json(res) as Record<string, unknown>
  assert(Array.isArray(body.mcps), '"mcps" must be an array')
  assert(typeof body.total === 'number', '"total" must be a number')
  assert((body.total as number) > 0, '"total" must be > 0 — curated MCP data missing')
})

// ---------------------------------------------------------------------------
// Section: Auth flow (key generation)
// ---------------------------------------------------------------------------
console.log('\nAuth flow')

await test('POST /api/keys/request with invalid email → 400', async () => {
  const res = await fetch(`${BASE}/api/keys/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  })
  assertStatus(res, 400)
  const body = await json(res) as Record<string, unknown>
  assert(typeof body.error === 'string', 'error field missing in 400 response')
})

await test('POST /api/keys/request with no body → 400', async () => {
  const res = await fetch(`${BASE}/api/keys/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  assertStatus(res, 400)
})

// Key generation creates a real DB row + sends email — only run if no key provided.
if (!apiKey) {
  console.log('  ~  Skipping live key generation (set TEST_API_KEY to test with an existing key)')
} else {
  await test('Provided TEST_API_KEY has correct prefix format', async () => {
    assert(apiKey.startsWith('sk-spainmcp-'), `Key must start with "sk-spainmcp-", got: ${apiKey.slice(0, 20)}`)
  })
}

// ---------------------------------------------------------------------------
// Section: Protected endpoints — 401 without auth
// ---------------------------------------------------------------------------
console.log('\nProtected endpoints — unauthenticated')

await test('GET /api/v1/namespaces without auth → 401', async () => {
  const res = await fetch(`${BASE}/api/v1/namespaces`)
  assertStatus(res, 401)
  const body = await json(res) as Record<string, unknown>
  assert(body.error === 'Unauthorized', `Expected "Unauthorized", got "${body.error}"`)
})

await test('POST /api/v1/namespaces without auth → 401', async () => {
  const res = await fetch(`${BASE}/api/v1/namespaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test-ns' }),
  })
  assertStatus(res, 401)
})

await test('POST /api/v1/auth/token without auth → 401', async () => {
  const res = await fetch(`${BASE}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policy: [{ namespaces: 'my-ns' }] }),
  })
  assertStatus(res, 401)
})

// ---------------------------------------------------------------------------
// Section: Protected endpoints — authenticated (only when TEST_API_KEY is set)
// ---------------------------------------------------------------------------
if (apiKey) {
  console.log('\nProtected endpoints — authenticated')

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  await test('GET /api/v1/namespaces with valid key → 200 + {namespaces:[], pagination:{}}', async () => {
    const res = await fetch(`${BASE}/api/v1/namespaces`, { headers: authHeaders })
    assertStatus(res, 200)
    const body = await json(res) as Record<string, unknown>
    assert(Array.isArray(body.namespaces), '"namespaces" must be an array')
    const pagination = body.pagination as Record<string, unknown>
    assert(typeof pagination === 'object' && pagination !== null, '"pagination" missing')
  })

  await test('POST /api/v1/auth/token with valid key + policy → 201 + {token:"smc_tk_..."}', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/token`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        policy: [{ namespaces: 'test-namespace', resources: 'connections', operations: 'read' }],
      }),
    })
    assertStatus(res, 201)
    const body = await json(res) as Record<string, unknown>
    assert(typeof body.token === 'string', '"token" field missing')
    assert((body.token as string).startsWith('smc_tk_'), `token must start with "smc_tk_", got "${(body.token as string).slice(0, 16)}"`)
    assert(typeof body.expiresAt === 'string', '"expiresAt" missing')
  })

  await test('POST /api/v1/auth/token with invalid policy → 400', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/token`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ policy: [] }),
    })
    assertStatus(res, 400)
    const body = await json(res) as Record<string, unknown>
    assert(typeof body.error === 'string', 'error field missing')
  })

  await test('POST /api/v1/namespaces with invalid name → 400', async () => {
    const res = await fetch(`${BASE}/api/v1/namespaces`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'INVALID NAME!' }),
    })
    assertStatus(res, 400)
    const body = await json(res) as Record<string, unknown>
    assert(typeof body.error === 'string', 'error field missing')
  })

  // Namespace creation — use a unique name to avoid 409 on repeated runs
  const testNs = `e2e-${Date.now().toString(36)}`

  await test(`POST /api/v1/namespaces create "${testNs}" → 201 | 403 (plan limit)`, async () => {
    const res = await fetch(`${BASE}/api/v1/namespaces`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: testNs }),
    })
    // 201 = created, 403 = free tier limit reached (both are valid outcomes)
    assertStatus(res, [201, 403])
    const body = await json(res) as Record<string, unknown>
    if (res.status === 403) {
      assert(typeof body.error === 'string', '403 response must have "error" field')
      // Verify the plan limit message shape
      assert(
        (body.error as string).includes('límite') || (body.error as string).toLowerCase().includes('limit'),
        `Plan limit message not recognized: "${body.error}"`
      )
      console.log(`       (free tier limit reached — 403 is expected)`)
    } else {
      assert(body.name === testNs, `name mismatch: expected "${testNs}", got "${body.name}"`)
      assert(typeof body.createdAt === 'string', '"createdAt" missing')
    }
  })
} else {
  console.log('\nProtected endpoints — authenticated: SKIPPED (TEST_API_KEY not set)')
}

// ---------------------------------------------------------------------------
// Section: Gateway — unauthenticated lookup for non-existent server
// ---------------------------------------------------------------------------
console.log('\nGateway')

await test('GET /api/gateway/@nonexistent/mcp → 404 with JSON error', async () => {
  const res = await fetch(`${BASE}/api/gateway/@nonexistent/mcp-does-not-exist-xyz`)
  assertStatus(res, 404)
  const body = await json(res) as Record<string, unknown>
  assert(typeof body.error === 'string', 'error field missing in 404 response')
})

await test('GET /api/gateway (missing path) → 400', async () => {
  const res = await fetch(`${BASE}/api/gateway/only-one-segment`)
  assertStatus(res, 400)
})

// ---------------------------------------------------------------------------
// Section: Usage/billing (public by email, no auth required)
// ---------------------------------------------------------------------------
console.log('\nUsage & billing')

await test('GET /api/account/usage without email → 400', async () => {
  const res = await fetch(`${BASE}/api/account/usage`)
  assertStatus(res, 400)
  const body = await json(res) as Record<string, unknown>
  assert(typeof body.error === 'string', 'error field missing')
})

await test('GET /api/account/usage?email=test@test.com → 200 + {used, limit, tier}', async () => {
  const res = await fetch(`${BASE}/api/account/usage?email=test%40test.com`)
  assertStatus(res, 200)
  const body = await json(res) as Record<string, unknown>
  assert(typeof body.used === 'number', '"used" must be a number')
  assert(typeof body.limit === 'number', '"limit" must be a number')
  assert(typeof body.tier === 'string', '"tier" must be a string')
  assert(typeof body.month === 'string', '"month" missing')
  assert(typeof body.resetDate === 'string', '"resetDate" missing')
})

// ---------------------------------------------------------------------------
// Section: Cloudflare Worker
// ---------------------------------------------------------------------------
console.log('\nCloudflare Worker')

await test(`GET ${WORKER}/health → 200`, async () => {
  let res: Response
  try {
    res = await fetch(`${WORKER}/health`, { signal: AbortSignal.timeout(10_000) })
  } catch (err) {
    throw new Error(`Worker unreachable: ${err instanceof Error ? err.message : err}`)
  }
  assertStatus(res, 200)
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(48)}`)
console.log(`  ${passed} passed   ${failed} failed`)
if (failed > 0) {
  console.log(`  Run with TEST_API_KEY=sk-spainmcp-... for full authenticated coverage.`)
}
console.log(`${'─'.repeat(48)}\n`)

process.exit(failed > 0 ? 1 : 0)
}

main()
