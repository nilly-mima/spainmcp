// Requerido por MCP spec — informa a los clientes que este server usa Bearer token auth
// https://spec.modelcontextprotocol.io/specification/authentication/

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mcp.lat"

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://xjumlmtepbzebuxbhksu.supabase.co"

  return Response.json(
    {
      resource: `${baseUrl}/api/mcp`,
      // Apunta al OAuth 2.1 server de Supabase — descubrimiento automático para MCP clients
      authorization_servers: [
        `${supabaseUrl}/.well-known/oauth-authorization-server/auth/v1`,
      ],
      bearer_methods_supported: ["header"],
      resource_documentation: `${baseUrl}/docs`,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  )
}
