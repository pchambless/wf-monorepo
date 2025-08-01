# Plan Context Refresh System Requirements

## Introduction

This plan addresses two critical issues with plan-dependent functionality:

1. **Plan Context Refresh Issue**: When users select a different plan using the SelPlan widget, plan-dependent components do not automatically refresh their data to reflect the newly selected plan. This creates a poor user experience where users see stale data from the previously selected plan.

2. **Plan Status Update Form Issue**: The current CompletePlanForm is too narrow, uses broken MultiLineField, and only supports completion status changes, blocking users from managing plan statuses effectively.

This feature will implement an automatic refresh system for plan context changes and enhance the plan status update form to support all status transitions.

## Requirements

### Requirement 1: Automatic Plan Context Detection

**User Story:** As a user, I want all plan-dependent components to automatically detect when I select a different plan, so that I don't see stale data from the previous plan.

#### Acceptance Criteria

1. WHEN the user selects a different plan using SelPlan widget THEN all plan-dependent components SHALL detect the plan change
2. WHEN contextStore planID parameter changes THEN all subscribed components SHALL receive notification of the change
3. WHEN a component is plan-dependent THEN it SHALL subscribe to planID changes during component initialization

### Requirement 2: Automatic Data Refresh

**User Story:** As a user, I want all plan-dependent data to automatically refresh when I select a different plan, so that I immediately see the correct information for the new plan.

#### Acceptance Criteria

1. WHEN planID changes THEN CommunicationHistory component SHALL reload communications for the new plan
2. WHEN planID changes THEN ImpactTrackingEditor component SHALL reload impact data for the new plan
3. WHEN planID changes THEN any other plan-dependent components SHALL reload their respective data
4. WHEN data is being refreshed THEN components SHALL show appropriate loading indicators
5. WHEN refresh fails THEN components SHALL display appropriate error messages

### Requirement 3: Performance Optimization

**User Story:** As a user, I want plan changes to be responsive and not cause unnecessary network requests, so that the interface remains fast and efficient.

#### Acceptance Criteria

1. WHEN planID changes THEN only plan-dependent components SHALL refresh their data
2. WHEN the same plan is selected again THEN components SHALL NOT make unnecessary refresh requests
3. WHEN multiple components need to refresh THEN requests SHALL be batched or optimized where possible
4. WHEN a component is not visible THEN it SHALL defer data loading until it becomes visible

### Requirement 4: Consistent State Management

**User Story:** As a developer, I want a standardized way to handle plan context changes, so that all components behave consistently and are easy to maintain.

#### Acceptance Criteria

1. WHEN implementing plan-dependent components THEN developers SHALL use a standard hook or pattern for plan context subscription
2. WHEN planID changes THEN all components SHALL follow the same refresh lifecycle (loading → data fetch → update state)
3. WHEN components unmount THEN they SHALL properly unsubscribe from plan context changes
4. WHEN new plan-dependent components are added THEN they SHALL automatically work with the refresh system

### Requirement 5: User Feedback and Error Handling

**User Story:** As a user, I want clear feedback when plan data is loading or when errors occur, so that I understand the system state and can take appropriate action.

#### Acceptance Criteria

1. WHEN plan data is loading THEN components SHALL show loading indicators
2. WHEN plan data fails to load THEN components SHALL show error messages with retry options
3. WHEN no plan is selected THEN components SHALL show appropriate "select a plan" prompts
4. WHEN plan changes are in progress THEN the SelPlan widget SHALL indicate the transition state

### Requirement 6: Enhanced Plan Status Update Form

**User Story:** As a user, I want to update any plan status (not just completion) using a reliable and intuitive form, so that I can manage all plan lifecycle states effectively.

#### Acceptance Criteria

1. WHEN accessing plan status updates THEN the component SHALL be named PlanStatusUpdateForm (renamed from CompletePlanForm)
2. WHEN updating plan status THEN the form SHALL provide a dropdown with all 7 status options: new, active, in-progress, on-hold, completed, ongoing, archived
3. WHEN displaying status options THEN each status SHALL use color-coded visual indicators from selectVals.planStatus configuration
4. WHEN entering status update comments THEN the form SHALL use a reliable TextArea widget instead of the broken MultiLineField
5. WHEN submitting status changes THEN the form SHALL support any status transition, not just completion
6. WHEN status is updated THEN the form SHALL integrate with existing plan update workflows
7. WHEN form is displayed THEN it SHALL have appropriate width and layout for usability

### Requirement 7: Plan Status Configuration Integration

**User Story:** As a developer, I want the plan status form to use established configuration patterns, so that status options and colors are consistent across the system.

#### Acceptance Criteria

1. WHEN loading status options THEN the form SHALL use selectVals.planStatus from the configuration file
2. WHEN displaying status colors THEN the form SHALL use the defined color scheme: slate, blue, green, yellow, emerald, purple, gray
3. WHEN adding new statuses THEN they SHALL be configured in /packages/shared-imports/src/architecture/config/selectVals.json
4. WHEN status options change THEN all plan status displays SHALL automatically reflect the updates
