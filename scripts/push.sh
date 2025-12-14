#!/bin/bash
# push.sh - Push your changes to remote
# Usage: ./scripts/push.sh "commit message"

MESSAGE="$1"
if [ -z "$MESSAGE" ]; then
  MESSAGE="Updated task status"
fi

BRANCH=$(git branch --show-current)

echo "📥 Pulling latest changes first..."
git pull origin $BRANCH

if [ $? -ne 0 ]; then
  echo "❌ Pull failed! Fix conflicts first"
  exit 1
fi

echo ""
echo "📦 Adding your changes..."
git add .

echo ""
echo "💾 Committing with message: $MESSAGE"
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
  echo "⚠️  Nothing to commit (no changes detected)"
  exit 0
fi

echo ""
echo "📤 Pushing to $BRANCH..."
git push origin $BRANCH

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Your changes are pushed!"
else
  echo ""
  echo "❌ Push failed! Run ./scripts/sync.sh for help"
  exit 1
fi
