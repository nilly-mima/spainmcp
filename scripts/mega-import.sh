#!/usr/bin/env bash
# Mass import 26 curated repos into skills_catalog.
# Uses import-skills-universal.mjs for each repo.
# $0 LLM cost.
set -e
cd "$(dirname "$0")/.."

# Format: owner/repo branch author icon_domain
REPOS=(
  # Smithery
  "smithery-ai/cli main smithery-ai smithery.ai"

  # Anthropic — additional repos (skills main already imported)
  "anthropics/knowledge-work-plugins main anthropic anthropic.com"
  "anthropics/claude-code main anthropic anthropic.com"
  "anthropics/claude-plugins-official main anthropic anthropic.com"
  "anthropics/claude-cookbooks main anthropic anthropic.com"
  "anthropics/claude-agent-sdk-demos main anthropic anthropic.com"
  "anthropics/healthcare main anthropic anthropic.com"

  # Composio
  "ComposioHQ/awesome-claude-skills master composio composio.dev"
  "ComposioHQ/awesome-claude-plugins master composio composio.dev"
  "ComposioHQ/awesome-codex-skills master composio composio.dev"
  "ComposioHQ/skills main composio composio.dev"

  # Microsoft
  "microsoft/skills main microsoft microsoft.com"
  "microsoft/GitHub-Copilot-for-Azure main microsoft microsoft.com"
  "microsoft/agent-skills main microsoft microsoft.com"
  "microsoft/amplifier-module-tool-skills main microsoft microsoft.com"

  # .NET
  "dotnet/maui main dotnet dotnet.microsoft.com"
  "dotnet/aspire main dotnet dotnet.microsoft.com"
  "dotnet/runtime main dotnet dotnet.microsoft.com"

  # Trail of Bits (security)
  "trailofbits/skills main trailofbits trailofbits.com"

  # Daniel Miessler (Fabric AI)
  "danielmiessler/Personal_AI_Infrastructure main danielmiessler danielmiessler.com"
  "danielmiessler/PAIPlugin main danielmiessler danielmiessler.com"

  # Modu AI
  "modu-ai/moai-adk main modu-ai modu.ai"
  "modu-ai/cc-plugins main modu-ai modu.ai"

  # Harvard Medical School
  "mims-harvard/ToolUniverse main mims-harvard hms.harvard.edu"

  # ruvnet (Claude-Flow)
  "ruvnet/claude-flow main ruvnet github.com"
)

TOTAL=${#REPOS[@]}
I=0
for ENTRY in "${REPOS[@]}"; do
  I=$((I + 1))
  read -r REPO BRANCH AUTHOR ICON <<< "$ENTRY"
  echo ""
  echo "=========================================="
  echo "[$I/$TOTAL] $REPO (branch=$BRANCH, author=$AUTHOR)"
  echo "=========================================="
  node scripts/import-skills-universal.mjs "$REPO" --all --branch="$BRANCH" --author="$AUTHOR" --icon="$ICON" || echo "ERR: $REPO failed, continuing..."
done

echo ""
echo "=========================================="
echo "MEGA IMPORT COMPLETE"
echo "=========================================="
