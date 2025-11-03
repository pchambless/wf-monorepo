#!/bin/bash
# Quick cache clear for monorepo development

echo "🧹 Clearing all build caches..."

# Clear shared-imports cache
rm -rf packages/shared-imports/node_modules/.cache 2>/dev/null

# Clear Studio cache
rm -rf apps/studio/node_modules/.cache 2>/dev/null
rm -rf apps/studio/build 2>/dev/null

# Clear WhatsFresh cache
rm -rf apps/whatsfresh/node_modules/.cache 2>/dev/null
rm -rf apps/whatsfresh/build 2>/dev/null

# Clear Admin cache
rm -rf apps/admin/node_modules/.cache 2>/dev/null
rm -rf apps/admin/build 2>/dev/null

# Clear root cache
rm -rf node_modules/.cache 2>/dev/null

echo "✅ Cache cleared!"
echo ""
echo "💡 Now restart your app to pick up shared-imports changes"
