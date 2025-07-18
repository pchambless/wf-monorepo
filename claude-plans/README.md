# 🧠 Claude Plans Workspace

This folder serves as a scoped planning and collaboration space between Paul and Claude. It supports an investigation-first development workflow centered around focused prompts, AI-assisted analysis, and iterative refinement.

## Folder Structure

- `a-pending/` – Active development ideas and scoped investigations awaiting validation or implementation  
- `b-completed/` – Finalized plans including Claude’s strategic insights, completed action steps, and handoffs to subsequent phases  
- `index.md` – Directory-level overview or guide to completed plans 
- `nameing convention` - new plans should use this naming convention `yyyy-mm-dd descriptive-name.md`.

## Workflow Philosophy

Each entry in this workspace starts with a clearly defined idea or need. Claude assists by analyzing the request, proposing a task breakdown, and suggesting implementation or cleanup strategies. Plans evolve across phases, often referencing earlier tasks for context.

This folder reflects an exploratory development style—keeping efforts focused, traceable, and scoped for maximum clarity.

## Future Considerations

If additional collaborators join or the workflow expands, this folder could evolve into a more general `dev-cycles/` or `sprint-plans/` structure. For now, it documents the evolving dialogue between architecture and action.

## ADHD Helpers

### Quick Setup (One-Time)

**Step 1: Add aliases to your ~/.bashrc file**
```bash
echo 'alias new-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/create-plan.js"' >> ~/.bashrc
echo 'alias complete-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/complete-plan.js"' >> ~/.bashrc
echo 'alias plan-status="cd /home/paul/wf-monorepo-new/claude-plans && jq \".plans[] | \\\"\\(.id): \\(.name) [\\(.status)]\\\"\" plan-registry.json"' >> ~/.bashrc
echo 'alias plan-active="cd /home/paul/wf-monorepo-new/claude-plans && jq \".plans[] | select(.status == \\\"active\\\") | \\\"\\(.id): \\(.name)\\\"\" plan-registry.json"' >> ~/.bashrc
echo 'alias plan-done="cd /home/paul/wf-monorepo-new/claude-plans && jq \".plans[] | select(.status == \\\"completed\\\") | \\\"\\(.id): \\(.name)\\\"\" plan-registry.json"' >> ~/.bashrc
source ~/.bashrc
```

**Step 2: Fix line endings (if needed)**
```bash
dos2unix /home/paul/wf-monorepo-new/claude-plans/tools/create-plan.js
dos2unix /home/paul/wf-monorepo-new/claude-plans/tools/complete-plan.js
```

### Daily Workflow Commands

**1. Create a new plan:**
```bash
paul@Cham-Dell:~$ new-plan DEVTOOLS "Registry System Test"
# Result: 0001-DEVTOOLS-Registry-System-Test.md
```

**2. Mark a plan as DONE:**
```bash
paul@Cham-Dell:~$ complete-plan 0003
# Result: DONE-0003-DEVTOOLS-Claude-Plans-Management.md
```

**3. Check plan status (quick overview):**
```bash
paul@Cham-Dell:~$ plan-status
# Shows: "0001: Registry System Test [active]"
#        "0003: Claude Plans Management [completed]"
```

**4. See only active plans:**
```bash
paul@Cham-Dell:~$ plan-active
# Shows: "0001: Registry System Test"
#        "0002: Test Auto Increment"
```

**5. See completed plans:**
```bash
paul@Cham-Dell:~$ plan-done
# Shows: "0003: Claude Plans Management"
```

### Advanced Queries (when you need details)

**Get specific plan info:**
```bash
# Plan name by ID
jq '.plans[] | select(.id == "0003") | .name' plan-registry.json

# All impacts for a plan
jq '.impacts[] | select(.plan_id == "0003")' impact-tracking.json

# Completed impacts for a plan
jq '.impacts[] | select(.plan_id == "0003" and .status == "completed")' impact-tracking.json
```

**Find file conflicts:**
```bash
# Files affected by multiple plans
jq '.impacts | group_by(.file) | map(select(length > 1))' impact-tracking.json

# Plans affecting same package
jq '.impacts | group_by(.package) | map({package: .[0].package, plans: map(.plan_id) | unique})' impact-tracking.json
```

### Troubleshooting

**If commands don't work:**
1. Check aliases: `alias | grep plan`
2. Reload shell: `source ~/.bashrc` 
3. Check file permissions: `ls -la /home/paul/wf-monorepo-new/claude-plans/tools/`
4. Run dos2unix on script files if needed
