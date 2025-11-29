#!/bin/bash
echo "Starting Server Group..."
echo "  Server :3001 (60% width) - Verbose logging"
echo "  Gateway :3002 (40% width) - Request logging"
terminator -l ServerGroup &
disown
