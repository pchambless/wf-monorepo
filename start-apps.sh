#!/bin/bash
echo "Starting Apps Group..."
echo "  Studio :3004 (33% width)"
echo "  WhatsFresh :3000 (33% width) - Future"
echo "  Admin :3005 (33% width)"
terminator -l AppsGroup &
disown
