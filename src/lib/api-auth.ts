import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export type AuthResult = {
  userId: string
  type: 'api_key' | 'scoped_token'
  policy?: object
  email?: string
}

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function authenticateRequest(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7).trim()
  if (!token) return null

  const supabase = getServiceClient()
  const hash = hashToken(token)

  if (token.startsWith('sk-spainmcp-')) {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, user_id, email, is_active')
      .eq('key_hash', hash)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    return {
      userId: data.user_id ?? data.email,
      type: 'api_key',
      email: data.email,
    }
  }

  if (token.startsWith('smc_tk_')) {
    const { data, error } = await supabase
      .from('scoped_tokens')
      .select('id, user_id, policy, expires_at, is_active')
      .eq('token_hash', hash)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null
    }

    return {
      userId: data.user_id,
      type: 'scoped_token',
      policy: data.policy,
    }
  }

  return null
}
