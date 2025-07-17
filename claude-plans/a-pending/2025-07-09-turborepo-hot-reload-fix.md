# TurboRepo Hot-Reload Fix Plan

**Date:** 2025-07-09  
**Status:** PARTIALLY_COMPLETE - DEFERRED  
**Priority:** HIGH

## Problem
TurboRepo is not properly hot-reloading changes from shared-imports package. When shared-imports components are modified, wf-client doesn't refresh automatically, requiring manual restarts.

## Root Causes Identified
1. **Missing dependency chain**: TurboRepo dev task lacks `dependsOn: ["^dev"]` 
2. **No build/watch in shared-imports**: Package has placeholder build script
3. **File-based dependencies**: `file:../../packages/shared-imports` may not trigger hot-reload

## Implementation Impact Analysis

### Impact Summary
- **Files**: 12 (see impact-tracking.json: plan_id="2025-07-09-turborepo-hot-reload")
- **Complexity**: Medium (build system configuration, file watching)
- **Packages**: packages/shared-imports (5), root (2), claude-plans (4)
- **Blast Radius**: DEVTOOLS (medium), SHARED (high)

### Impact Tracking Status
- **Predicted**: 8 files
- **Actual**: 12 files (+4 discovered)
- **Accuracy**: 67%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: None (optimization task)
- **Blocked by**: None
- **Related**: None currently
- **File Conflicts**: None identified

### Status: DEFERRED
**Decision**: Manual restarts acceptable for MVP development. Hot-reload still requires manual restart due to file: dependency limitation.

### Results Achieved
- ✅ TurboRepo dependency tracking added
- ✅ Dev server stability improved  
- ❌ Hot-reload still requires manual restart (file: dependency limitation)

### Future Enhancement Options (BackBurner)
- Implement webpack watch for shared-imports
- Switch to published packages instead of file: dependencies
- Add symlink-based development workflow