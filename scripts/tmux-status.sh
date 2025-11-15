#!/bin/bash
# Show status of WhatsFresh servers

echo "WhatsFresh Server Status:"
echo ""

if /usr/bin/tmux has-session -t wf-dev 2>/dev/null; then
    echo "✅ All servers running in session 'wf-dev'"
    echo "   └─ Server:  :3001"
    echo "   └─ Gateway: :3002"
    echo "   └─ Studio:  :3004"
    echo ""
    echo "Attach to view: /usr/bin/tmux attach -t wf-dev"
    echo "Stop all:       ./scripts/tmux-stop.sh"
else
    echo "❌ No servers running"
    echo ""
    echo "Start servers: ./scripts/tmux-start.sh"
fi
