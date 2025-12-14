# Agent Task Management System

## 📋 Overview

This folder contains the **living task management system** for the WF-Monorepo. It uses a single reusable file (`CURRENT.md`) that tracks active sprint tasks and gets archived to the database when complete.

## 🎯 Philosophy

- **One living document** - `CURRENT.md` always contains current sprint tasks
- **No file bloat** - Reuse same file, overwrite for each sprint
- **Git history** - Full version control via git log
- **DB archive** - Save to `plan_communications` when sprint completes
- **YAML configs** - Static orchestration rules for agent coordination

## 📁 Folder Structure

```
.agentTask/
├── CURRENT.md              ← THE living task file (always current sprint)
├── README.md               ← This file (usage instructions)
├── orchestration.yml       ← Sprint coordination rules
└── agents/                 ← Agent-specific configurations
    ├── kiro.yml            ← Database agent patterns
    ├── claude.yml          ← Config/file agent patterns
    ├── vscode.yml          ← Component agent patterns
    └── github-copilot.yml  ← Orchestration agent rules
```

## 🤖 How Agents Use This System

### **1. Check Current Tasks**
```bash
# Read CURRENT.md to find your assigned tasks
cat .agentTask/CURRENT.md | grep "assigned_to: {your_name}"
```

### **2. Update Task Status**
When starting a task:
```markdown
**Status:** ⏳ in-progress
**Started:** 2025-12-14T15:00:00Z
```

When completing a task:
```markdown
**Status:** ✅ complete
**Completed:** 2025-12-14T15:30:00Z
```

### **3. Log Impact**
After completing work, run the impact logging SQL provided in the task:
```sql
CALL sp_logPlanImpact(
  {plan_id}, 
  '{target}', 
  '{change_type}', 
  '{description}',
  '{phase}', 
  '{your_name}', 
  '{affected_apps}', 
  NULL
);
```

### **4. Commit and Push**
```bash
git add .agentTask/CURRENT.md
git commit -m "✅ {agent_name} completed: {task_name}"
git push origin {branch_name}
```

## 📊 Viewing Task History

### **See all changes to CURRENT.md:**
```bash
# Full history
git log --follow .agentTask/CURRENT.md

# With diffs
git log -p --follow .agentTask/CURRENT.md

# One-line summary
git log --oneline --follow .agentTask/CURRENT.md
```

### **View specific version:**
```bash
# Show file from 3 commits ago
git show HEAD~3:.agentTask/CURRENT.md

# Show file from specific commit
git show {commit_hash}:.agentTask/CURRENT.md
```

### **Compare versions:**
```bash
# Compare current vs 2 commits ago
git diff HEAD~2 HEAD -- .agentTask/CURRENT.md
```

## 🏷️ Sprint Tags

When a sprint completes, it gets tagged:
```bash
# Tag the sprint completion
git tag -a plan-{id}-s{sprint}-complete -m "Sprint S{n} completed"
git push origin plan-{id}-s{sprint}-complete

# View CURRENT.md from a completed sprint
git show plan-74-s1-complete:.agentTask/CURRENT.md
```

## 🔄 Sprint Lifecycle

### **1. Sprint Start**
- Overwrite `CURRENT.md` with new sprint tasks
- Update orchestration.yml with new workflow
- Commit as "🎯 Sprint S{n} initialized"

### **2. During Sprint**
- Agents update task statuses in `CURRENT.md`
- Commit after each task completion
- Git tracks all changes

### **3. Sprint Complete**
- All tasks marked ✅ complete
- All impacts logged to database
- Run `scripts/complete-sprint.sh`:
  - Archives `CURRENT.md` → `plan_communications`
  - Tags the completion in git
  - Clears `CURRENT.md` for next sprint

## 🗄️ Archival Process

When sprint completes, `CURRENT.md` content is saved to:

1. **Database** (`plan_communications` table):
   - Searchable across all sprints
   - Queryable for reporting
   - Permanent record

2. **Git Tag**:
   - Fast access via `git show`
   - Version control history
   - Local + remote backup

3. **Optional Local Backup**:
   - `.agentTask/archive/plan-{id}-s{sprint}-{date}.md`
   - For offline reference

## 📝 Agent-Specific Configs

Each agent has a YAML config defining:
- Capabilities
- Common patterns/templates
- Impact logging defaults
- Completion protocols

See `agents/` folder for details.

## 🎯 Orchestration Rules

`orchestration.yml` defines:
- Task dependencies
- Parallel vs sequential execution
- Agent assignments
- Estimated token usage
- Impact tracking rules
- Archive settings

## 🛠️ Helper Scripts

(To be created in `scripts/` folder)

- `complete-sprint.sh` - Archive and tag sprint completion
- `start-sprint.sh` - Initialize new sprint in CURRENT.md
- `agent-task-update.sh` - Helper for agents to update tasks

## 📚 Best Practices

1. **Always update CURRENT.md** when task status changes
2. **Commit frequently** with descriptive messages
3. **Log impacts immediately** after completing work
4. **Check dependencies** before starting a task
5. **Tag sprint completions** for easy reference
6. **Archive before overwriting** for new sprint

## 🔗 Related Systems

- **plan_communications** - Database archive of completed sprints
- **plan_impacts** - Impact tracking for all changes
- **modules** - Dependency graph for blast radius analysis
- **sp_logPlanImpact** - Stored procedure for impact logging

## 💡 Future Enhancements

- Auto-generate task updates from commits
- GitHub Actions for auto-archival
- Slack/Discord notifications on task completion
- Visual dashboard from CURRENT.md parsing
- AI-powered task assignment based on agent availability

---

**Created:** 2025-12-14  
**Version:** 1.0  
**Maintained by:** github-copilot