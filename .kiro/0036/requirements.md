# Requirements Document

## Introduction

This specification outlines the creation of a new dedicated Plan Management page to replace the current ArchIntel page functionality. Rather than reorganizing the existing ArchDashboard/archIntel page, we will create a clean, purpose-built interface focused exclusively on plan management workflows.

The current ArchDashboard/archIntel page suffers from feature creep and includes architectural analysis components that will remain for future use. This new page approach eliminates integration complexity and allows us to build a streamlined, focused user experience from the ground up, centered around plan management workflows without the baggage of existing analysis features.

## Requirements

### Requirement 1

**User Story:** As a plan manager, I want to see an overview of all plan statuses so that I can quickly understand the distribution of work across different phases.

#### Acceptance Criteria

1. WHEN I visit the new Plan Management page THEN I SHALL see a SelStatus widget positioned above the main plan grid
2. WHEN the SelStatus widget loads THEN it SHALL display all plan status options from the "planStatus" configuration in `/home/paul/wf-monorepo-new/packages/shared-imports/src/architecture/config/selectVals.json`
3. WHEN I view the SelStatus widget THEN it SHALL show the count of plans for each status (new, active, in-progress, on-hold, completed, ongoing, archived)
4. WHEN I click on a status in the SelStatus widget THEN the plan grid SHALL filter to show only plans with that status
5. WHEN no status filter is active THEN the plan grid SHALL show all active plans

### Requirement 2

**User Story:** As a plan manager, I want to view and edit plan details in a dedicated tab so that I can manage core plan information efficiently.

#### Acceptance Criteria

1. WHEN I select a plan from the plan list THEN a tabbed interface SHALL appear on the right side of the page
2. WHEN the Plan Detail tab is active THEN I SHALL see the plan name, plan status, and plan description fields
3. WHEN I edit the plan name field THEN the system SHALL validate that the name is not empty and update the plan record
4. WHEN I change the plan status THEN the system SHALL use the existing plan status changing workflow to update the record
5. WHEN I edit the plan description THEN the system SHALL validate that the description is not empty and update the plan record
6. WHEN any field is updated THEN the system SHALL trigger impact tracking for the change
7. WHEN field updates are saved THEN the plan list SHALL refresh to reflect the changes
8. WHEN there are validation errors THEN appropriate error messages SHALL be displayed to the user

### Requirement 3

**User Story:** As a plan manager, I want to access plan communications and impacts through organized tabs so that I can manage all aspects of a plan from one interface.

#### Acceptance Criteria

1. WHEN I select a plan THEN I SHALL see three tabs: Plan Detail, Plan Communications, and Plan Impacts
2. WHEN I click the Plan Communications tab THEN I SHALL see all communications related to the selected plan
3. WHEN I click the Plan Impacts tab THEN I SHALL see all impacts related to the selected plan
4. WHEN I switch between tabs THEN the content SHALL load efficiently without full page refreshes
5. WHEN no plan is selected THEN the tab area SHALL show a message prompting to select a plan
6. WHEN I select a different plan THEN the tab content SHALL update to show data for the newly selected plan
7. When I select the plan communications tab, I should be able to enter a new communication message with the type of communication, the type, the subject and the message.

### Requirement 4

**User Story:** As a plan manager, I want the interface to focus only on plan management features so that I can work efficiently without distracting analysis tools.

#### Acceptance Criteria

1. WHEN I visit the new Plan Management page THEN it SHALL contain only plan management features
2. WHEN I look for architectural analysis features THEN they SHALL not be present on this page
3. WHEN I navigate the interface THEN I SHALL only see plan-related functionality
4. WHEN the page loads THEN it SHALL have a clean, purpose-built design without legacy analysis components
5. WHEN I use the page THEN there SHALL be no confusion with architectural analysis workflows
6. WHEN I access plan management THEN it SHALL be completely separate from the existing ArchIntel analysis page

### Requirement 5

**User Story:** As a plan manager, I want the page layout to follow a master-detail pattern so that I can efficiently browse and manage plans.

#### Acceptance Criteria

1. WHEN I visit the new Plan Management page THEN I SHALL see a plan list on the left side of the page
2. WHEN I view the plan list THEN each plan SHALL display its the plan number (format NNNN)-name.
3. WHEN I click on a plan in the list THEN the detail tabs SHALL appear on the right side
4. WHEN I select a different plan THEN the right side SHALL update to show details for the new selection
5. WHEN the page loads THEN the layout SHALL be responsive and work on different screen sizes
6. WHEN I resize the browser window THEN the master-detail layout SHALL adapt appropriately

### Requirement 6

**User Story:** As a system administrator, I want proper event type hierarchy for plan management so that the system can coordinate updates across related components.

#### Acceptance Criteria

1. WHEN plan status changes occur THEN the system SHALL follow the eventType hierarchy: archIntel → SelPlanStatus → [planList, planCommunications, planImpacts]
2. WHEN a plan is updated THEN the planList component SHALL receive update events
3. WHEN a plan is updated THEN the planCommunications component SHALL receive update events if communications are affected
4. WHEN a plan is updated THEN the planImpacts component SHALL receive update events if impacts are affected
5. WHEN the SelPlanStatus widget is updated THEN it SHALL trigger appropriate child component updates
6. WHEN event coordination occurs THEN it SHALL follow the flow defined in `/home/paul/wf-monorepo-new/analysis-n-document/output/eventTypes.mmd`

### Requirement 7

**User Story:** As a plan manager, I want improved layout and field sizing so that I can work with plan data more effectively.

#### Acceptance Criteria

1. WHEN I view plan fields THEN they SHALL be appropriately sized for their content
2. WHEN I edit plan descriptions THEN the text area SHALL be large enough for meaningful content
3. WHEN I view the plan list THEN the columns SHALL be properly sized and aligned
4. WHEN I use the tabbed interface THEN the tabs SHALL be clearly labeled and easy to navigate
5. WHEN I interact with form fields THEN they SHALL have proper spacing and visual hierarchy
6. WHEN I view the SelStatus widget THEN it SHALL be visually integrated with the overall page design

### Requirement 8

**User Story:** As a user, I want to access the new Plan Management page through clear navigation so that I can easily find and use plan management features.

#### Acceptance Criteria

1. WHEN I look at the application navigation THEN I SHALL see a "Plan Management" menu item
2. WHEN I click the "Plan Management" navigation item THEN I SHALL be taken to the new dedicated plan management page
3. WHEN I access the new page THEN it SHALL have a clear URL route (e.g., /plan-management)
4. WHEN I bookmark the page THEN I SHALL be able to return directly to plan management
5. WHEN I navigate to the page THEN it SHALL load independently of the existing ArchIntel page
6. WHEN the existing ArchIntel page is accessed THEN it SHALL continue to function with its current architectural analysis features

### Requirement 9

**User Story:** As a developer, I want the new page to integrate with existing workflow systems so that plan updates trigger appropriate downstream processes.

#### Acceptance Criteria

1. WHEN a plan status is changed THEN the existing updatePlan workflow SHALL be triggered
2. WHEN plan fields are updated THEN the system SHALL use the config-driven workflow documentation from selectVals.json
3. WHEN plan updates occur THEN impact tracking SHALL be automatically recorded
4. WHEN workflow processes execute THEN they SHALL follow the timeout and retry policies defined in the workflow configuration
5. WHEN errors occur during plan updates THEN they SHALL be handled according to the workflow error handling strategies
6. WHEN plan updates complete THEN context refresh SHALL be triggered for dependent components
