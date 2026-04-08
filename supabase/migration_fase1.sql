-- ══════════════════════════════════════════════════════
-- SpainMCP — Fase 1 Migration
-- Nuevas tablas: namespaces, connections, scoped_tokens,
--                connection_logs, skills
-- Ejecutar en Supabase SQL Editor DESPUÉS de schema.sql
-- ══════════════════════════════════════════════════════

-- Activar extensión para vault (si no está activa)
CREATE EXTENSION IF NOT EXISTS pgsodium;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════
-- 1. NAMESPACES — agrupación de recursos por usuario
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS namespaces (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL UNIQUE,          -- "mi-empresa", "curious-falcon-42"
  owner_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Restricción: nombre solo alfanumérico + guiones
ALTER TABLE namespaces ADD CONSTRAINT namespaces_name_format
  CHECK (name ~ '^[a-z0-9][a-z0-9\-]{1,62}[a-z0-9]$');

CREATE INDEX IF NOT EXISTS idx_namespaces_owner ON namespaces(owner_id);

ALTER TABLE namespaces ENABLE ROW LEVEL SECURITY;

-- Lectura: solo tus propios namespaces
CREATE POLICY "namespaces_owner_read"
  ON namespaces FOR SELECT
  USING (owner_id = auth.uid());

-- Insert: solo autenticados
CREATE POLICY "namespaces_owner_insert"
  ON namespaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Delete: solo propietario
CREATE POLICY "namespaces_owner_delete"
  ON namespaces FOR DELETE
  USING (owner_id = auth.uid());

-- ═══════════════════════════════════════════════════
-- 2. CONNECTIONS — conexiones gestionadas a MCPs
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS connections (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id   TEXT        NOT NULL,               -- developer-defined or auto
  namespace_id    UUID        NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,
  mcp_url         TEXT        NOT NULL,               -- URL del MCP server upstream
  name            TEXT,                                -- display name opcional
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('connected', 'auth_required', 'error', 'pending')),
  auth_url        TEXT,                                -- authorizationUrl si auth_required
  error_message   TEXT,                                -- si status = error
  metadata        JSONB       DEFAULT '{}'::jsonb,     -- custom metadata (userId, etc.)
  headers_encrypted TEXT,                              -- headers cifrados (API keys upstream)
  oauth_token_id  UUID,                                -- referencia a vault secret
  server_info     JSONB,                               -- {name, version, tools[]}
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Un connection_id por namespace
  UNIQUE(namespace_id, connection_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_namespace ON connections(namespace_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_metadata ON connections USING GIN(metadata);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Lectura: via namespace ownership
CREATE POLICY "connections_owner_read"
  ON connections FOR SELECT
  USING (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

-- Insert: solo en namespaces propios
CREATE POLICY "connections_owner_insert"
  ON connections FOR INSERT
  WITH CHECK (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

-- Update: solo en namespaces propios
CREATE POLICY "connections_owner_update"
  ON connections FOR UPDATE
  USING (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

-- Delete: solo en namespaces propios
CREATE POLICY "connections_owner_delete"
  ON connections FOR DELETE
  USING (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════
-- 3. SCOPED_TOKENS — service tokens con policy
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scoped_tokens (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash  TEXT        NOT NULL UNIQUE,          -- SHA256 del token
  token_prefix TEXT       NOT NULL,                  -- "smc_tk_..." para identificación
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy      JSONB       NOT NULL,                  -- [{namespaces, resources, operations, metadata, ttl}]
  expires_at  TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN     DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoped_tokens_hash ON scoped_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_scoped_tokens_owner ON scoped_tokens(owner_id);
CREATE INDEX IF NOT EXISTS idx_scoped_tokens_active ON scoped_tokens(is_active) WHERE is_active = true;

ALTER TABLE scoped_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scoped_tokens_owner_read"
  ON scoped_tokens FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "scoped_tokens_owner_insert"
  ON scoped_tokens FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "scoped_tokens_owner_delete"
  ON scoped_tokens FOR DELETE
  USING (owner_id = auth.uid());

-- ═══════════════════════════════════════════════════
-- 4. CONNECTION_LOGS — metering RPCs para billing
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS connection_logs (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id   UUID        NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  namespace_id    UUID        NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,
  method          TEXT        NOT NULL,               -- "tools/list", "tools/call", etc.
  tool_name       TEXT,                                -- nombre del tool si method = tools/call
  duration_ms     INTEGER,                             -- duración de la llamada
  status_code     INTEGER,                             -- HTTP status del upstream
  error           TEXT,                                -- mensaje de error si falló
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para queries de billing (RPCs por namespace/mes)
CREATE INDEX IF NOT EXISTS idx_connection_logs_namespace_date
  ON connection_logs(namespace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_connection_logs_connection
  ON connection_logs(connection_id, created_at DESC);

-- Partitioning hint: considerar partición por mes cuando >1M rows

ALTER TABLE connection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connection_logs_owner_read"
  ON connection_logs FOR SELECT
  USING (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

-- Insert: solo via service role (el proxy escribe logs)

-- ═══════════════════════════════════════════════════
-- 5. SKILLS — registro de skills
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS skills (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  qualified_name  TEXT        NOT NULL UNIQUE,        -- "namespace/skill-name"
  namespace_id    UUID        NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,
  display_name    TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  content         TEXT        NOT NULL,                -- skill content/instructions
  agent_configs   JSONB       DEFAULT '[]'::jsonb,     -- associated agent configurations
  install_count   INTEGER     DEFAULT 0,
  is_active       BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_namespace ON skills(namespace_id);
CREATE INDEX IF NOT EXISTS idx_skills_qualified_name ON skills(qualified_name);
CREATE INDEX IF NOT EXISTS idx_skills_active ON skills(is_active) WHERE is_active = true;

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Lectura pública de skills activas
CREATE POLICY "skills_public_read"
  ON skills FOR SELECT
  USING (is_active = true);

-- Write: solo owner del namespace
CREATE POLICY "skills_owner_insert"
  ON skills FOR INSERT
  WITH CHECK (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "skills_owner_update"
  ON skills FOR UPDATE
  USING (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "skills_owner_delete"
  ON skills FOR DELETE
  USING (
    namespace_id IN (SELECT id FROM namespaces WHERE owner_id = auth.uid())
  );

CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════
-- 6. ACTUALIZAR mcp_servers — vincular a namespaces
-- ═══════════════════════════════════════════════════

ALTER TABLE mcp_servers
  ADD COLUMN IF NOT EXISTS namespace_id UUID REFERENCES namespaces(id),
  ADD COLUMN IF NOT EXISTS config_schema JSONB,        -- Zod schema para configuración
  ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT true;

-- ═══════════════════════════════════════════════════
-- 7. VISTA: billing summary por namespace/mes
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE VIEW billing_summary AS
SELECT
  n.id AS namespace_id,
  n.name AS namespace_name,
  n.owner_id,
  DATE_TRUNC('month', cl.created_at) AS month,
  COUNT(*) AS total_rpcs,
  COUNT(DISTINCT cl.connection_id) AS active_connections,
  AVG(cl.duration_ms)::INTEGER AS avg_duration_ms,
  COUNT(*) FILTER (WHERE cl.error IS NOT NULL) AS error_count
FROM connection_logs cl
JOIN namespaces n ON n.id = cl.namespace_id
GROUP BY n.id, n.name, n.owner_id, DATE_TRUNC('month', cl.created_at);

-- ═══════════════════════════════════════════════════
-- RESUMEN
-- ═══════════════════════════════════════════════════
-- Tablas nuevas: namespaces, connections, scoped_tokens, connection_logs, skills
-- Tablas actualizadas: mcp_servers (+ namespace_id, config_schema, is_remote)
-- Vista: billing_summary
-- Trigger: update_updated_at (connections, skills)
-- RLS: todas las tablas con policies por owner
