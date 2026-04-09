-- ═══════════════════════════════════════════════════
-- MIGRACIÓN: Servidores privados (is_private)
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════

ALTER TABLE mcp_servers ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- ═══════════════════════════════════════════════════
-- RESUMEN
-- mcp_servers nueva col: is_private (BOOLEAN DEFAULT false)
-- Servidores existentes quedan públicos por defecto
-- ═══════════════════════════════════════════════════
