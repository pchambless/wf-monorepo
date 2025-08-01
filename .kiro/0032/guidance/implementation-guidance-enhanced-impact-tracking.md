# Enhanced Impact Tracking with Phase Support - Implementation Guidance

**Plan ID:** 32  
**Target Audience:** Development Team  
**Agent:** Claude  
**Created:** 2025-07-28  

## Overview
This guidance document outlines the implementation steps for adding phase support to the impact tracking system, enabling better process intelligence and quality scoring.

## Objectives
- Update all impact tracking workflows to include phase parameter
- Establish phase-based development process guidelines
- Implement process quality scoring based on phase progression
- Update documentation and templates with new phase requirements

## Phase Definitions
- **idea**: Plan creation/conception (default)
- **analysis**: Investigation and discovery (Claude)
- **guidance**: Implementation planning (Claude)
- **development**: Actual coding/changes (Kiro, Claude, User)
- **adhoc**: Unplanned quick fixes (Plan 0 only)

## Requirements
- All workflows must include phase parameter in impact tracking
- Default phase should be appropriate for each workflow type
- Backward compatibility maintained for existing impact records

## Implementation Steps

### 1. Update createPlan Workflow
**File:** `packages/shared-imports/src/architecture/workflows/plans/createPlan.js`
- Add `phase: 'idea'` to impact tracking call
- Ensure plan creation impacts are properly categorized

### 2. Update createGuidance Workflow  
**File:** `packages/shared-imports/src/architecture/workflows/guidance/createGuidance.js`
- Add `phase: 'guidance'` to impact tracking call
- Update createPlanImpact call to include phase parameter

### 3. Update createAnalysis Workflow
**File:** `packages/shared-imports/src/architecture/workflows/analysis/createAnalysis.js`
- Add `phase: 'analysis'` to impact tracking call
- Ensure analysis impacts are properly categorized

### 4. Update CLAUDE.md Templates
**File:** `CLAUDE.md`
- Update impact tracking command template to include phase parameter
- Add examples for each phase type
- Update quick fix documentation

### 5. Update Steering.yaml Documentation
**File:** `.kiro/steering.yaml`
- Update workflow patterns documentation
- Include phase-based impact tracking guidelines
- Add process quality metrics guidance

### 6. Update Server-side Impact Tracking
**File:** `apps/wf-server/server/workflows/impact-tracking/`
- Update server-side utilities to handle phase parameter
- Ensure backward compatibility for existing calls

## Integration Points
- createPlan.js workflow
- createGuidance.js workflow
- createAnalysis.js workflow
- Impact tracking API endpoints
- CLAUDE.md templates
- Steering.yaml workflow documentation

## Testing Requirements
- Test plan creation with phase tracking
- Test guidance creation with phase tracking
- Test analysis creation with phase tracking
- Verify phase data in database queries
- Test backward compatibility with existing workflows

## Process Quality Metrics
Once implemented, the following metrics will be available:
- **Analysis thoroughness**: DISCOVERED impacts per plan
- **Guidance quality**: ANALYZED impacts before development
- **Implementation efficiency**: CREATE/MODIFY ratio
- **Process adherence**: % of plans with all phases

## Expected Impacts

| File Path | Phase | Change Type | Description |
|-----------|-------|-------------|-------------|
| `packages/shared-imports/src/architecture/workflows/plans/createPlan.js` | development | MODIFY | Update createPlan workflow to include phase parameter |
| `packages/shared-imports/src/architecture/workflows/guidance/createGuidance.js` | development | MODIFY | Update createGuidance workflow to include phase parameter |
| `packages/shared-imports/src/architecture/workflows/analysis/createAnalysis.js` | development | MODIFY | Update createAnalysis workflow to include phase parameter |
| `CLAUDE.md` | development | MODIFY | Update impact tracking command template to include phase parameter |
| `.kiro/steering.yaml` | development | MODIFY | Update workflow patterns documentation |
| `apps/wf-server/server/workflows/impact-tracking/` | development | MODIFY | Update server-side impact tracking utilities |

## Success Criteria
- All workflows successfully include phase parameter in impact tracking calls
- Database contains phase data for all new impacts
- Process quality queries return meaningful phase-based analytics
- Documentation accurately reflects new phase requirements
- No regression in existing workflow functionality