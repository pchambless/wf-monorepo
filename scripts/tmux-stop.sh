#!/bin/bash
# Stop WhatsFresh tmux session

echo "Stopping WhatsFresh servers..."

# Kill the main session (stops all panes)
/usr/bin/tmux kill-session -t wf-dev 2>/dev/null && echo "✅ All servers stopped" || echo "⚠️  No session running"

# Also kill individual sessions if they exist (from old scripts)
/usr/bin/tmux kill-session -t wf-server 2>/dev/null
/usr/bin/tmux kill-session -t wf-gateway 2>/dev/null
/usr/bin/tmux kill-session -t wf-studio 2>/dev/null

echo "🛑 Done"
