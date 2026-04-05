import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const namespace = "@spainmcp/oficial"
  const { data, error } = await supabase
    .from("mcp_servers")
    .select("namespace, display_name, is_active")
    .eq("namespace", namespace)
    .eq("is_active", true)
    .single()
  return Response.json({ namespace, data, error: error?.message ?? null })
}
