---
description: "Generate and store session accomplishments and next steps summary"
allowed-tools: []
---

# Session Summary Generator

This command uses the shared summary specification.

See: `.shared/commands/summary.md` for complete instructions and template.

## Kiro-Specific Implementation

1. Generate summary using shared template
2. Create JSON payload with execDML format
3. Execute curl command to store in database (when on Linux)
4. Confirm storage and show record ID

This ensures consistent AI coordination across Claude and Kiro sessions.
