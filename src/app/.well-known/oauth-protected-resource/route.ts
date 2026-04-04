// Requerido por MCP spec — informa a los clientes que este server usa Bearer token auth
// https://spec.modelcontextprotocol.io/specification/authentication/

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mcp.lat"

  return Response.json(
    {
      resource: `${baseUrl}/api/mcp`,
      authorization_servers: [],
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
