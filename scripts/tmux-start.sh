#!/bin/bash
# Start all WhatsFresh servers with named panes for easy log viewing

SESSION_NAME="wf-dev"

# Stop any existing session
if /usr/bin/tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Stopping existing session..."
    /usr/bin/tmux kill-session -t $SESSION_NAME 2>/dev/null
fi

# Clean up old individual sessions
/usr/bin/tmux kill-session -t wf-server 2>/dev/null
/usr/bin/tmux kill-session -t wf-gateway 2>/dev/null
/usr/bin/tmux kill-session -t wf-studio 2>/dev/null

echo "Starting servers with named panes..."

# Create new session with server
/usr/bin/tmux new-session -d -s $SESSION_NAME -n "WhatsFresh Servers" \
    "cd ~/projects/github/wf-monorepo/apps/server && npm start"

# Name the first pane
/usr/bin/tmux select-pane -t $SESSION_NAME:0.0 -T "Server :3001"

# Split for gateway
/usr/bin/tmux split-window -h -t $SESSION_NAME \
    "cd ~/projects/github/wf-monorepo/apps/api-gateway && npm start"
/usr/bin/tmux select-pane -t $SESSION_NAME:0.1 -T "Gateway :3002"

# Split for studio
/usr/bin/tmux split-window -h -t $SESSION_NAME \
    "cd ~/projects/github/wf-monorepo/apps/studio && npm start"
/usr/bin/tmux select-pane -t $SESSION_NAME:0.2 -T "Studio :3004"

# Make panes equal size
/usr/bin/tmux select-layout -t $SESSION_NAME even-horizontal

echo "✅ All servers started with named panes"
echo ""
echo "📋 Copy/Paste Tips:"
echo "  - Alt+Arrow    : Switch panes (no Ctrl+B needed!)"
echo "  - Ctrl+B z     : Zoom into pane (for easier copying)"
echo "  - Ctrl+B [     : Scroll mode"
echo "  - v            : Start selection (in scroll mode)"
echo "  - y or Enter   : Copy to clipboard"
echo "  - Shift+drag   : Select text (copies on release)"
echo "  - Ctrl+B D     : Detach"
echo ""
echo "Stop all: ./scripts/tmux-stop.sh"
echo ""
sleep 1

# Attach to the session
/usr/bin/tmux attach-session -t $SESSION_NAME
