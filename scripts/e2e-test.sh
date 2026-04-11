#!/bin/bash
# ═══════════════════════════════════════════════════
# SpainMCP E2E Tests — run against production
# Usage: bash scripts/e2e-test.sh
# ═══════════════════════════════════════════════════

BASE="https://spainmcp-fngo.vercel.app"
CF="https://spainmcp-connect.nilmiq.workers.dev"
KEY="sk-spainmcp-1527eeb6503e4284a5defc217ed43810"
PASS=0
FAIL=0

check() {
  local name="$1" url="$2" expected="$3" method="${4:-GET}" body="$5"

  if [ "$method" = "GET" ]; then
    resp=$(curl -s -H "Authorization: Bearer $KEY" "$url" 2>/dev/null)
  else
    resp=$(curl -s -X "$method" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d "$body" "$url" 2>/dev/null)
  fi

  if echo "$resp" | grep -q "$expected"; then
    echo "  ✓ $name"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name (expected: $expected)"
    echo "    got: ${resp:0:120}"
    FAIL=$((FAIL + 1))
  fi
}

echo "═══════════════════════════════════════"
echo "SpainMCP E2E Tests"
echo "═══════════════════════════════════════"
echo ""

echo "── Vercel API ──"
check "Health" "$BASE/api/v1/health" '"status":"ok"'
check "Servers list" "$BASE/api/v1/servers" '"qualifiedName"'
check "Servers search" "$BASE/api/v1/servers?q=postgres" '"qualifiedName"'
check "Namespaces (auth)" "$BASE/api/v1/namespaces" '"namespaces"'
check "Namespaces (no auth)" "$BASE/api/v1/namespaces" '"Unauthorized"' "GET_NOAUTH"
check "Usage" "$BASE/api/v1/usage" '"plan"'
check "Skills" "$BASE/api/v1/skills" '"qualifiedName"'

echo ""
echo "── CF Worker ──"
check "Worker health" "$CF/health" '"status":"ok"'

echo ""
echo "── Gateway ──"
check "Gateway info" "$CF/mcp/demo-app" '"SpainMCP Gateway"'

echo ""
echo "── Frontend pages ──"
for path in "/" "/mcps" "/precios" "/privacy" "/legal" "/docs/playground"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "  ✓ $path ($code)"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $path ($code)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "═══════════════════════════════════════"
echo "Results: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
