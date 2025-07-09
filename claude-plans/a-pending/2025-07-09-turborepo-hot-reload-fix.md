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

## Implementation Steps

### 1. Test Current Behavior
- [ ] Add a console.log to a shared-imports component
- [ ] Start dev server and verify log appears
- [ ] Modify the log message and check if change auto-reflects
- [ ] Document current refresh behavior

### 2. Fix TurboRepo Configuration  
- [ ] Update `turbo.json` dev task to include dependency tracking
- [ ] Add proper file watching configuration
- [ ] Test dev task dependency chain

### 3. Enhance shared-imports Package
- [ ] Add proper build/watch script to shared-imports
- [ ] Configure file watching for source changes
- [ ] Test package refresh behavior

### 4. Verify Fix
- [ ] Test hot-reload with shared-imports changes
- [ ] Verify dev server auto-refresh works
- [ ] Test multiple concurrent changes
- [ ] Document improved workflow

## Test Component
Create a test log in a commonly used shared-imports component to verify hot-reload behavior before and after fixes.

## Results
- ✅ TurboRepo dependency tracking added
- ✅ Dev server stability improved  
- ❌ Hot-reload still requires manual restart (file: dependency limitation)

## Decision
**DEFERRED** - Manual restarts acceptable for MVP development. Revisit post-MVP for optimization.

## Future Enhancement Options
- Implement webpack watch for shared-imports
- Switch to published packages instead of file: dependencies
- Add symlink-based development workflow