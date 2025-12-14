#!/bin/bash
# Make all git helper scripts executable
# Run this once after pulling the scripts

chmod +x scripts/pull.sh
chmod +x scripts/push.sh
chmod +x scripts/sync.sh

echo "✅ All git scripts are now executable!"
echo ""
echo "You can now run:"
echo "  ./scripts/pull.sh"
echo "  ./scripts/push.sh 'your message'"
echo "  ./scripts/sync.sh"
