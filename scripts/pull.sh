#!/bin/bash
# pull.sh - Get latest changes from remote
# Usage: ./scripts/pull.sh

BRANCH=$(git branch --show-current)

echo "📥 Pulling latest changes from $BRANCH..."
git pull origin $BRANCH

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ You're up to date!"
  echo ""
  echo "📋 Recent updates:"
  git log --oneline -3
else
  echo ""
  echo "❌ Pull failed! Run ./scripts/sync.sh for help"
  exit 1
fi
