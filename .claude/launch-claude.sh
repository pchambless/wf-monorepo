#!/bin/bash

SETTINGS_PATH="$(dirname "$0")/settings.json"
TEMPLATE_PATH="$(dirname "$0")/settings.template.json"

# Step 1: Validate JSON
if ! jq empty "$SETTINGS_PATH" 2>/dev/null; then
  echo "⚠ settings.json is malformed. Restoring default template..."
  cp "$TEMPLATE_PATH" "$SETTINGS_PATH"
else
  echo "✅ settings.json is valid."
fi

# Step 2: Launch Claude CLI
echo "🚀 Launching Claude CLI..."
~/.claude/local/node_modules/.bin/claude "$@"