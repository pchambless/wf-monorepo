#!/bin/bash
# Cleanup legacy technical debt from WhatsFresh monorepo
# Archive first, then delete after verification

set -e

ARCHIVE_DIR="archive/legacy-$(date +%Y%m%d)"
echo "📦 Creating archive at: $ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"

# Archive .kiro legacy directories
echo "📂 Archiving .kiro legacy directories..."
mkdir -p "$ARCHIVE_DIR/.kiro"

# Old plan directories (July-August markdown-based planning)
for plan in 0019 0021 0029 0032 0034 0035 0036 0040 0041; do
  if [ -d ".kiro/$plan" ]; then
    echo "  - Archiving .kiro/$plan"
    mv ".kiro/$plan" "$ARCHIVE_DIR/.kiro/"
  fi
done

# Obsolete .kiro subdirectories
for dir in plans specs templates commands workflows settings issues hooks config; do
  if [ -d ".kiro/$dir" ]; then
    echo "  - Archiving .kiro/$dir"
    mv ".kiro/$dir" "$ARCHIVE_DIR/.kiro/"
  fi
done

# Archive CLI routing system
echo "📂 Archiving CLI routing system..."
mkdir -p "$ARCHIVE_DIR/cli"

if [ -d "cli/toolsets" ]; then
  echo "  - Archiving cli/toolsets"
  mv cli/toolsets "$ARCHIVE_DIR/cli/"
fi

for file in TaskRouter.js route-task.js generate-prompt.js; do
  if [ -f "cli/$file" ]; then
    echo "  - Archiving cli/$file"
    mv "cli/$file" "$ARCHIVE_DIR/cli/"
  fi
done

if [ -d "cli/services" ]; then
  echo "  - Archiving cli/services"
  mv cli/services "$ARCHIVE_DIR/cli/"
fi

if [ -d "cli/utils" ]; then
  echo "  - Archiving cli/utils"
  mv cli/utils "$ARCHIVE_DIR/cli/"
fi

if [ -d "cli/notebooks" ]; then
  echo "  - Archiving cli/notebooks"
  mv cli/notebooks "$ARCHIVE_DIR/cli/"
fi

# Show archive summary
echo ""
echo "✅ Archive complete!"
echo ""
echo "📊 Archive contents:"
find "$ARCHIVE_DIR" -type f | wc -l | xargs echo "   Files:"
du -sh "$ARCHIVE_DIR" | cut -f1 | xargs echo "   Size:"
echo ""
echo "📍 Archive location: $ARCHIVE_DIR"
echo ""
echo "🔍 Review archive contents:"
echo "   tree $ARCHIVE_DIR"
echo ""
echo "🗑️  To permanently delete archive after verification:"
echo "   rm -rf $ARCHIVE_DIR"
echo ""
echo "✅ Remaining active structure:"
echo "   .kiro/steering.yaml    - Active configuration"
echo "   .shared/commands/      - Active slash commands"
echo "   cli/README.md          - Documentation"
echo "   cli/ModelExecutor.js   - If still used"
echo ""
