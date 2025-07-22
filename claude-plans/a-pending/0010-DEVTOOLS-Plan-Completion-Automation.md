# DEVTOOLS - Plan Completion Automation

## User Idea
Automate the plan completion workflow by enhancing the existing `complete-plan` CLI tool to integrate `update-impact complete` functionality and generate commit messages from impact lists. This eliminates manual steps and ensures consistent plan completion documentation.

**Current Pain Points:**
- Manual `update-impact complete PLAN_ID` step often forgotten
- Commit message generation requires Claude to provide impact summary
- Multi-step workflow prone to human error
- Inconsistent completion documentation

**Desired Outcome:**
1. **Impact Counter System**: Claude tracks file changes (~20 tokens) and prompts every 5 impacts with ready-to-run `update-impact add` commands
2. **Enhanced complete-plan**: Single command `complete-plan PLAN_ID` that completes all impacts and generates commit message from impact list

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: 0010
- **Files**: 3-4 (see impact-tracking.json: plan_id="0010")
- **Complexity**: Medium (CLI enhancement with JSON processing)
- **Packages**: claude-plans CLI tools (3-4 files)
- **Blast Radius**: DEVTOOLS (medium) - affects plan completion workflow

### Impact Tracking Status
- **Predicted**: 4 files
- **Actual**: TBD files (+X discovered)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: Future plan completions (streamlined workflow)
- **Blocked by**: None (independent enhancement)
- **Related**: Plan 0008 completion experience informed requirements
- **File Conflicts**: None (isolated to CLI tools)

## Implementation Strategy

### Phase 1: Analysis & Design
1. **Examine existing CLI tools** (`complete-plan.js`, `update-impact.js`)
2. **Analyze impact-tracking.json structure** for commit message generation
3. **Design integration approach**: Enhance vs rebuild vs hybrid

### Phase 2: Core Integration
1. **Enhance complete-plan.js** to call update-impact completion
2. **Add commit message generation** from impact tracking data
3. **Preserve existing functionality** (backward compatibility)
4. **Add error handling** for edge cases

### Phase 3: Documentation & Testing
1. **Update CLAUDE.md** with new streamlined workflow
2. **Test with sample plan** to validate full workflow
3. **Add optional auto-commit** flag for full automation

### Architecture Options

**Option A: Enhance complete-plan.js**
- Integrate `update-impact complete` logic directly
- Add commit message generation from JSON
- Single command does everything

**Option B: Wrapper Script**
- Create new `finish-plan` command that calls existing tools
- Maintains tool separation
- Easier to test incrementally

**Option C: Hybrid Approach**
- Enhance `complete-plan` for core functionality
- Keep `update-impact` tools for manual progress tracking
- Best of both worlds

**Recommended: Option C** - Hybrid approach for cross-session safety

### Impact Counter Technical Design

**Session Tracking (Lightweight - ~20 tokens):**
```
Session impacts: 4/5
Files: [MainLayout.jsx, AppBar.jsx, theme.js, navigation.js]
```

**Auto-Prompt Mechanism:**
- Track file modifications from Edit/Write/MultiEdit tool calls
- At 5 impacts, generate ready-to-run commands from conversation history
- Extract file paths and infer descriptions from recent changes
- Reset counter after user runs batch commands

**ADHD-Friendly Benefits:**
- No manual remembering - automatic prompts every 5 changes
- Copy/paste ready commands - no thinking required
- Cross-session resilient - impacts documented before session ends
- Batch efficiency - 5 commands at once vs constant interruption

## Next Steps
1. **Examine existing CLI architecture** and JSON structure
2. **Implement enhanced complete-plan.js** with integrated impact completion
3. **Add commit message generation** from impact tracking data
4. **Update CLAUDE.md** with streamlined workflow documentation
5. **Test with dry-run mode** before going live
