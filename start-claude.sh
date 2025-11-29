#!/bin/bash
echo "Starting Claude/Commands Group..."
echo "  Claude Code (70% width) - Main workspace"
echo "  Adhoc Commands (30% width) - Quick tasks"
terminator -l ClaudeGroup &
disown
