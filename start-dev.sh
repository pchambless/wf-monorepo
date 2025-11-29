#!/bin/bash

echo "Starting WhatsFresh Development Environment..."
echo ""
echo "Layout:"
echo "  Terminal 1: Server :3001        → Run: ./start-server.sh"
echo "  Terminal 2: API Gateway :3002   → Run: npm start"
echo "  Terminal 3: Studio :3004        → Run: npm start"
echo "  Terminal 4: Admin :3005         → Run: npm start"
echo "  Terminal 5: Command Line        → Free for git, MCP, etc."
echo ""
echo "Opening Terminator with WhatsFresh-Dev layout..."

terminator -l WhatsFresh-Dev
