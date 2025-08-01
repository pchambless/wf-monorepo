#!/bin/bash

# ┌────────────────────────────────────────────┐
# │ Claude CLI Launcher with Session Diagnostics │
# │ Author: Paul + Copilot • Updated: 2025-07-27 │
# └────────────────────────────────────────────┘

SETTINGS_PATH="$(dirname "$0")/settings.json"
TEMPLATE_PATH="$(dirname "$0")/settings.template.json"
SESSION_LOG="$(dirname "$0")/claude-session.log"

echo ""
echo "🔧 Claude Launcher Starting..."

# ─────────────────────────────────────────────
# Step 1: Validate JSON settings
# ─────────────────────────────────────────────
echo "🧪 Validating settings.json..."
if ! jq empty "$SETTINGS_PATH" 2>/dev/null; then
  echo "⚠️  settings.json is malformed. Restoring default template..."
  cp "$TEMPLATE_PATH" "$SETTINGS_PATH"
else
  echo "✅ settings.json is valid."
fi

# ─────────────────────────────────────────────
# Step 2: Detect authorization method
# ─────────────────────────────────────────────
echo "🔍 Checking Claude auth method..."
AUTH_HEADER=$(grep -i 'Authorization' "$SETTINGS_PATH")

if [[ -z "$AUTH_HEADER" ]]; then
  echo "⚠️  No Authorization header detected. CLI may default to Pro login flow."
else
  echo "🔐 API Key in use: $(echo "$AUTH_HEADER" | sed 's/^.*sk-/sk-/')"
fi

# ─────────────────────────────────────────────
# Step 3: Session health diagnostics (/status)
# ─────────────────────────────────────────────
echo "📋 Running CLI status check..."
STATUS_OUTPUT=$("~/.claude/local/node_modules/.bin/claude" /status 2>/dev/null)

# Trace login state
if echo "$STATUS_OUTPUT" | grep -q "Auth Token: none"; then
  echo "⚠️  CLI session lacks auth token. Likely using Console-mode key."
else
  echo "✅ Auth token detected. Claude Pro login appears active."
fi

# Check for billing errors
if echo "$STATUS_OUTPUT" | grep -q "Credit balance too low"; then
  echo "🚨 Warning: CLI may fail due to insufficient Console credits."
fi

# Check model access level
if echo "$STATUS_OUTPUT" | grep -q "Model" && echo "$STATUS_OUTPUT" | grep -q "opus"; then
  echo "🧠 Opus model available for session."
else
  echo "📦 Default model in use: $(echo "$STATUS_OUTPUT" | grep 'Model' | awk -F':' '{print $2}')"
fi

# Save full session metadata for provenance
echo "$STATUS_OUTPUT" > "$SESSION_LOG"
echo "📝 Session trace saved to: $SESSION_LOG"

# ─────────────────────────────────────────────
# Step 4: Launch Claude CLI
# ─────────────────────────────────────────────
echo ""
echo "🚀 Launching Claude CLI..."
"$HOME/.claude/local/node_modules/.bin/claude" "$@"