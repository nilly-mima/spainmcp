-- ══════════════════════════════════════════════════════
-- SpainMCP — Schema completo
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- Tabla existente: api_keys
-- (ya creada en sesiones anteriores)

-- ── Nueva tabla: mcp_servers (registry de MCPs publicados) ──

CREATE TABLE IF NOT EXISTS mcp_servers (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace       TEXT        NOT NULL UNIQUE,   -- "@usuario/mcp-name"
  display_name    TEXT        NOT NULL,
  description     TEXT,
  upstream_url    TEXT        NOT NULL,           -- URL real del MCP server
  owner_email     TEXT        NOT NULL,
  is_active       BOOLEAN     DEFAULT true,
  is_verified     BOOLEAN     DEFAULT false,      -- verificado por SpainMCP
  install_count   INTEGER     DEFAULT 0,
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mcp_servers_namespace    ON mcp_servers(namespace);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_owner_email  ON mcp_servers(owner_email);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_is_active    ON mcp_servers(is_active);

-- RLS: solo lectura pública, escritura via service role
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mcp_servers_public_read"
  ON mcp_servers FOR SELECT
  USING (is_active = true);
