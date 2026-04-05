import { createClient } from '@supabase/supabase-js'

// Lazy — evita que createClient explote en build si las env vars no están disponibles
export function getSupabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
  )
}

// Re-export para compatibilidad con los componentes que lo usan directamente
export const supabaseBrowser = getSupabaseBrowser()
