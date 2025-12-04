---
inclusion: always
---

# Plan 1: Agent Knowledge Base

**Living documentation system** - workflows, techniques, and patterns that actually work.

## Quick Access

When you need to know "how do I...?", check Plan 1 first:

```sql
-- Search for a topic
SELECT id, subject, LEFT(message, 150) as preview 
FROM api_wf.plan_communications 
WHERE plan_id = 1 
  AND (subject LIKE '%your_topic%' OR message LIKE '%your_topic%')
ORDER BY created_at DESC;

-- Get full details
SELECT message 
FROM api_wf.plan_communications 
WHERE plan_id = 1 AND id = [id_from_above];
```

## Available Topics

Query to see what's available:
```sql
SELECT subject, type, created_at 
FROM api_wf.plan_communications 
WHERE plan_id = 1 
ORDER BY created_at DESC;
```

## Adding New Knowledge

When you discover something useful:
```sql
INSERT INTO api_wf.plan_communications 
(plan_id, from_agent, to_agent, type, subject, message, created_by)
VALUES (1, 'kiro', 'any', 'guidance', 
  'Technique: [Short Name]',
  '# [Full Explanation]\n\n## Problem\n...\n\n## Solution\n...\n\n## Example\n```sql\n...\n```',
  'kiro');
```

## Why This Matters

- **Reduces repeated questions** - "How do I clone a page?" → Check Plan 1
- **Captures what works** - Real solutions, not theoretical docs
- **Shared learning** - Claude and Kiro both contribute and benefit
- **Always current** - Database updates immediately available

## Communication Types

- `guidance` - How-to workflows and techniques
- `analysis` - Investigation findings and patterns
- `milestone` - System improvements and discoveries

---

**Remember:** If you're stuck, search Plan 1 before asking Paul. The answer might already be there.
