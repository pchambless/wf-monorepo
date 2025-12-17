Query vw_plan_composite for the specified planID and update .agentTask/currentPlanUpdates.md for GitHub Copilot visibility.

**Steps:**
1. Query `api_wf.vw_plan_composite WHERE plan_id = :planID`
2. Format results as markdown with sections
3. Write to `.agentTask/currentPlanUpdates.md`
4. Optionally commit to git

**Format the output as:**

```markdown
# Plan [ID]: [Name]

**Status**: [status] | **Priority**: [priority] | **Last Updated**: [timestamp]

---

## 📋 Plan Overview

[plan description]

---

## 💬 Recent Communications

### [type]: [subject] - [agent] ([date])
[message excerpt or full text]

---

## 📁 File Changes

### [change_type]: [file_path] - [agent] ([date])
[description]

---

_Last synced: [timestamp]_
_This file is auto-generated for GitHub Copilot context - do not edit manually_
```

**Usage:**
```
/syncCopilot 75
```

**When to run:**
- After completing a phase/milestone
- Before requesting Copilot architectural guidance
- After major architecture decisions
- Daily during active development
