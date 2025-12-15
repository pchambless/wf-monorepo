#!/bin/bash
# sync.sh - Interactive git sync helper
# Usage: ./scripts/sync.sh

BRANCH=$(git branch --show-current)

echo "🔄 Git Sync Helper"
echo "=================="
echo ""
echo "Current branch: $BRANCH"
echo ""

# Get latest info from remote
git fetch origin

echo "📊 Current Status:"
git status --short

echo ""
echo "📝 Recent commits:"
git log --oneline -5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "What do you want to do?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1) Pull latest from GitHub"
echo "2) Push my changes to GitHub"
echo "3) Sync both ways (pull + push)"
echo "4) Show detailed status"
echo "5) Help! I'm confused - show me what to do"
echo ""

read -p "Enter 1, 2, 3, 4, or 5: " choice

case $choice in
  1)
    echo ""
    echo "📥 Pulling latest changes..."
    git pull origin $BRANCH
    if [ $? -eq 0 ]; then
      echo "✅ Pull successful!"
    else
      echo "❌ Pull failed - you may have conflicts to resolve"
    fi
    ;;
    
  2)
    echo ""
    read -p "Enter commit message (or press Enter for default): " msg
    if [ -z "$msg" ]; then
      msg="Syncing changes"
    fi
    
    git add .
    git commit -m "$msg"
    
    if [ $? -eq 0 ]; then
      git push origin $BRANCH
      if [ $? -eq 0 ]; then
        echo "✅ Push successful!"
      else
        echo "❌ Push failed"
      fi
    else
      echo "⚠️  Nothing to commit"
    fi
    ;;
    
  3)
    echo ""
    echo "🔄 Full sync: pull + push..."
    
    git pull origin $BRANCH
    if [ $? -ne 0 ]; then
      echo "❌ Pull failed - fix conflicts before pushing"
      exit 1
    fi
    
    git add .
    git commit -m "Syncing changes"
    
    if [ $? -eq 0 ]; then
      git push origin $BRANCH
      echo "✅ Fully synced!"
    else
      echo "⚠️  Nothing new to push (already synced)"
    fi
    ;;
    
  4)
    echo ""
    echo "📊 Detailed Status:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    git status
    echo ""
    echo "🌲 Branch info:"
    git branch -vv
    echo ""
    echo "📍 Remote status:"
    git remote -v
    ;;
    
  5)
    echo ""
    echo "🆘 Git Status Report"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Send this to GitHub Copilot:"
    echo ""
    echo "Branch: $BRANCH"
    echo ""
    echo "Status:"
    git status
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    echo ""
    echo "Modified files:"
    git diff --name-only
    ;;
    
  *)
    echo "Invalid choice. Please run again and choose 1-5."
    exit 1
    ;;
esac
