import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['nilmiq@gmail.com']

export function isAdmin(email: string | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}

export function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getAdminSession(req: Request): Promise<{ email: string } | null> {
  const authHeader = req.headers.get('x-admin-email')
  if (authHeader && isAdmin(authHeader)) {
    return { email: authHeader }
  }
  return null
}
