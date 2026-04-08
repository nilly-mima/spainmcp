-- ══════════════════════════════════════════════════════
-- SpainMCP — Deploy Migration
-- Nuevas columnas en mcp_servers + tabla releases
-- Ejecutar en Supabase SQL Editor DESPUÉS de migration_fase1.sql
-- ══════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- 1. RELEASES — historial de deploys de código MCP
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS releases (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id       UUID        NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
  version         TEXT        NOT NULL DEFAULT '1.0.0',
  source_code     TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'building'
                  CHECK (status IN ('building', 'active', 'failed', 'superseded')),
  deploy_url      TEXT,
  build_log       TEXT,
  deployed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_releases_server_id ON releases(server_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

-- RLS: owner puede ver sus releases; escritura solo service role
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Lectura pública de releases activos (para status checks sin auth)
CREATE POLICY "releases_public_read"
  ON releases FOR SELECT
  USING (status = 'active');

-- ═══════════════════════════════════════════════════
-- 2. ACTUALIZAR mcp_servers — columnas de deploy
-- ═══════════════════════════════════════════════════

ALTER TABLE mcp_servers
  ADD COLUMN IF NOT EXISTS source_code        TEXT,
  ADD COLUMN IF NOT EXISTS is_deployed        BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS deploy_url         TEXT,
  ADD COLUMN IF NOT EXISTS current_release_id UUID        REFERENCES releases(id);

-- ═══════════════════════════════════════════════════
-- RESUMEN
-- ═══════════════════════════════════════════════════
-- Tabla nueva: releases (server_id, version, source_code, status, deploy_url, build_log)
-- mcp_servers nuevas cols: source_code, is_deployed, deploy_url, current_release_id
