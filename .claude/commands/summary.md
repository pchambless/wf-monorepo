---
description: "Generate and store session accomplishments and next steps summary"
allowed-tools: []
---

# Session Summary Generator

This command uses the shared summary specification.

See: `.shared/commands/summary.md` for complete instructions and template.

## Claude-Specific Implementation

1. Generate summary using shared template
2. Create JSON payload file for execDML
3. Provide curl command for user execution
4. User stores summary in database

This ensures consistent AI coordination across Claude and Kiro sessions.
