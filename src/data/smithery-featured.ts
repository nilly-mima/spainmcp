export type SmitheryItem = {
  nombre: string
  slug: string
  descripcion_en: string
  scope: 'remote' | 'local'
  downloads: string
  icon_url: string
}

export const smitheryRow1: SmitheryItem[] = [
  {
    nombre: 'Instagram',
    slug: 'instagram',
    descripcion_en: 'Instagram is a social media platform for sharing photos, videos, and stories. Only supports Instagram Business and Creator accounts, not Instagram Personal accounts.',
    scope: 'remote',
    downloads: '442.77k',
    icon_url: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/instagram.svg',
  },
  {
    nombre: 'Google Sheets',
    slug: 'googlesheets',
    descripcion_en: 'Read, write, and format spreadsheet data. Manage sheets, run formulas, and collaborate on structured data in real time.',
    scope: 'remote',
    downloads: '55.61k',
    icon_url: 'https://logos.composio.dev/api/googlesheets',
  },
  {
    nombre: 'AgentMail',
    slug: 'agentmail',
    descripcion_en: 'AgentMail is the email inbox API for AI agents. It gives agents their own email inboxes, like Gmail does for humans.',
    scope: 'remote',
    downloads: '23.91k',
    icon_url: 'https://icons.duckduckgo.com/ip3/agentmail.to.ico',
  },
  {
    nombre: 'Context7',
    slug: 'upstash/context7-mcp',
    descripcion_en: 'Fetch up-to-date, version-specific documentation and code examples directly into your prompts. Enhance your coding experience by eliminating outdated information and hallucinated APIs.',
    scope: 'remote',
    downloads: '12.88k',
    icon_url: 'https://api.smithery.ai/servers/upstash/context7-mcp/icon',
  },
  {
    nombre: 'Mesh MCP',
    slug: 'clay-inc/clay-mcp',
    descripcion_en: 'Access your network seamlessly with a simple and efficient server. Leverage a variety of tools to enhance your applications and workflows.',
    scope: 'remote',
    downloads: '23.35k',
    icon_url: 'https://api.smithery.ai/servers/clay-inc/clay-mcp/icon',
  },
  {
    nombre: 'Linkup',
    slug: 'LinkupPlatform/linkup-mcp-server',
    descripcion_en: 'Search the web in real time to get trustworthy, source-backed answers. Find the latest news and comprehensive results from the most relevant sources.',
    scope: 'remote',
    downloads: '38.62k',
    icon_url: 'https://api.smithery.ai/servers/LinkupPlatform/linkup-mcp-server/icon',
  },
  {
    nombre: 'Google Drive',
    slug: 'googledrive',
    descripcion_en: 'Upload, organize, and share files in the cloud. Manage folders, set permissions, and search across stored documents.',
    scope: 'remote',
    downloads: '6.61k',
    icon_url: 'https://logos.composio.dev/api/googledrive',
  },
]

export const smitheryRow2: SmitheryItem[] = [
  {
    nombre: 'Blockscout MCP Server',
    slug: 'blockscout/mcp-server',
    descripcion_en: 'Provide AI agents and automation tools with contextual access to blockchain data including balances, tokens, NFTs, and contract metadata.',
    scope: 'remote',
    downloads: '10.84k',
    icon_url: 'https://icons.duckduckgo.com/ip3/blockscout.com.ico',
  },
  {
    nombre: 'Supabase',
    slug: 'Supabase',
    descripcion_en: 'Search the Supabase docs for up-to-date guidance and troubleshoot errors quickly. Manage organizations, projects, databases, and Edge Functions.',
    scope: 'remote',
    downloads: '7.60k',
    icon_url: 'https://api.smithery.ai/servers/Supabase/icon',
  },
  {
    nombre: 'Notion',
    slug: 'notion',
    descripcion_en: 'Search across your Notion workspace and connected sources to quickly find pages, databases, and users. View full page and database details for deeper context.',
    scope: 'remote',
    downloads: '2.90k',
    icon_url: 'https://api.smithery.ai/servers/notion/icon',
  },
  {
    nombre: 'Exa Search',
    slug: 'exa',
    descripcion_en: 'Fast, intelligent web search and web crawling. New mcp tool: Exa-code is a context tool for coding agents.',
    scope: 'remote',
    downloads: '35.54k',
    icon_url: 'https://api.smithery.ai/servers/exa/icon',
  },
  {
    nombre: 'Google Calendar',
    slug: 'googlecalendar',
    descripcion_en: 'Schedule events, check availability, and manage calendars. Create meetings, set reminders, and coordinate across time zones.',
    scope: 'remote',
    downloads: '4.19k',
    icon_url: 'https://logos.composio.dev/api/googlecalendar',
  },
  {
    nombre: 'Youtube',
    slug: 'youtube',
    descripcion_en: 'YouTube is a video-sharing platform with user-generated content, live streaming, and monetization opportunities, widely used for marketing, education, and entertainment.',
    scope: 'remote',
    downloads: '3.33k',
    icon_url: 'https://logos.composio.dev/api/youtube',
  },
  {
    nombre: 'Brave Search',
    slug: 'brave',
    descripcion_en: 'Search the web, local businesses, images, videos, and news with rich, structured results. Refine results by country, language, freshness, and SafeSearch.',
    scope: 'remote',
    downloads: '9.22k',
    icon_url: 'https://api.smithery.ai/servers/brave/icon',
  },
]

export const smitheryRow3: SmitheryItem[] = [
  {
    nombre: 'Slack',
    slug: 'slack',
    descripcion_en: 'Slack is a channel-based messaging platform. With Slack, people can work together more effectively, connect all their software tools and services.',
    scope: 'remote',
    downloads: '23.05k',
    icon_url: 'https://logos.composio.dev/api/slack',
  },
  {
    nombre: 'Microsoft Learn MCP',
    slug: 'microsoft/learn_mcp',
    descripcion_en: "The Microsoft Learn MCP Server enables clients like GitHub Copilot and other AI agents to bring trusted and up-to-date information from Microsoft's official documentation.",
    scope: 'remote',
    downloads: '6.22k',
    icon_url: 'https://api.smithery.ai/servers/microsoft/learn_mcp/icon',
  },
  {
    nombre: 'Gmail',
    slug: 'gmail',
    descripcion_en: 'Manage Gmail end-to-end: send, draft, reply, forward, and bulk-modify or delete messages and threads. Organize your inbox with labels, archiving, and trashing.',
    scope: 'remote',
    downloads: '40.38k',
    icon_url: 'https://api.smithery.ai/servers/gmail/icon',
  },
  {
    nombre: 'Google Super',
    slug: 'googlesuper',
    descripcion_en: 'Google Super App combines all Google services including Drive, Calendar, Gmail, Sheets, Analytics, Ads, and more.',
    scope: 'remote',
    downloads: '5.16k',
    icon_url: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google.svg',
  },
  {
    nombre: 'Docfork',
    slug: 'docfork/mcp',
    descripcion_en: 'Up-to-date docs for AI Agents. Sign up for free API key at https://docfork.com',
    scope: 'remote',
    downloads: '610',
    icon_url: 'https://icons.duckduckgo.com/ip3/docfork.com.ico',
  },
  {
    nombre: 'Google Tasks',
    slug: 'googletasks',
    descripcion_en: 'Google Tasks provides a simple to-do list and task management system integrated into Gmail and Google Calendar for quick and easy tracking.',
    scope: 'remote',
    downloads: '1.78k',
    icon_url: 'https://logos.composio.dev/api/googletasks',
  },
  {
    nombre: 'Ticktick',
    slug: 'ticktick',
    descripcion_en: 'TickTick is a cross-platform task management and to-do list application designed to help users organize their tasks and schedules efficiently.',
    scope: 'remote',
    downloads: '2.23k',
    icon_url: 'https://ticktick.com/favicon.ico',
  },
]
