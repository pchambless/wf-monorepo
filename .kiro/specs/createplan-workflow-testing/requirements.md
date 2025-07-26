# CreatePlan Workflow Testing Requirements

## Introduction

This spec defines the testing requirements for validating the createPlan() workflow implementation. The workflow must atomically create records in three database tables (plans, plan_documents, plan_impacts) with consistent data and proper error handling.

## Requirements

### Requirement 1: Atomic Plan Creation

**User Story:** As a developer using the Architecture Intel Dashboard, I want to create a plan through the createPlan() workflow, so that all related database records are created consistently.

#### Acceptance Criteria

1. WHEN I submit a valid plan through CreatePlanForm THEN the system SHALL create a record in api_wf.plans table
2. WHEN a plan record is created THEN the system SHALL create a corresponding record in api_wf.plan_documents table
3. WHEN a plan record is created THEN the system SHALL create a corresponding record in api_wf.plan_impacts table
4. WHEN any database operation fails THEN the system SHALL rollback all operations and return a meaningful error message
5. WHEN all operations succeed THEN the system SHALL return success with planId, paddedPlanId, and documentPath

### Requirement 2: Document Path Generation

**User Story:** As a system administrator, I want plan documents to follow consistent naming patterns, so that files are organized and predictable.

#### Acceptance Criteria

1. WHEN a plan is created THEN the system SHALL generate a document path using format "claude-plans/a-pending/NNNN-Plan Name.md"
2. WHEN generating document paths THEN the system SHALL pad plan IDs to 4 digits with leading zeros
3. WHEN generating document paths THEN the system SHALL sanitize plan names by removing special characters
4. WHEN generating document paths THEN the system SHALL normalize multiple spaces to single spaces
5. WHEN the document path is generated THEN both plan_documents and plan_impacts tables SHALL reference the same path

### Requirement 3: Data Validation

**User Story:** As a developer, I want the workflow to validate input data, so that invalid plans are rejected before database operations.

#### Acceptance Criteria

1. WHEN required fields (cluster, name, description) are missing THEN the system SHALL return validation error without database operations
2. WHEN userID is missing THEN the system SHALL return validation error without database operations
3. WHEN validation fails THEN the system SHALL return { success: false, message: "descriptive error" }
4. WHEN validation passes THEN the system SHALL proceed with database operations
5. WHEN optional fields are missing THEN the system SHALL use appropriate defaults (priority: "normal")

### Requirement 4: Database Record Consistency

**User Story:** As a database administrator, I want all plan-related records to have consistent data, so that referential integrity is maintained.

#### Acceptance Criteria

1. WHEN a plan is created THEN plan_documents.plan_id SHALL match plans.id
2. WHEN a plan is created THEN plan_impacts.plan_id SHALL match plans.id
3. WHEN a plan is created THEN plan_documents.file_path SHALL match plan_impacts.file_path
4. WHEN a plan is created THEN all records SHALL have consistent created_by and created_at values
5. WHEN a plan is created THEN plan_documents.title SHALL match plans.name

### Requirement 5: Error Handling

**User Story:** As a developer, I want meaningful error messages when plan creation fails, so that I can diagnose and fix issues.

#### Acceptance Criteria

1. WHEN database connection fails THEN the system SHALL return business-meaningful error message
2. WHEN constraint violations occur THEN the system SHALL return descriptive error message
3. WHEN any step fails THEN the system SHALL log the error for debugging
4. WHEN errors occur THEN the system SHALL NOT leave partial data in any table
5. WHEN errors occur THEN the system SHALL return { success: false, message: "clear description" }

### Requirement 6: Success Response Format

**User Story:** As a UI developer, I want consistent success responses from the workflow, so that I can provide proper user feedback.

#### Acceptance Criteria

1. WHEN plan creation succeeds THEN the system SHALL return success: true
2. WHEN plan creation succeeds THEN the system SHALL return planId (numeric)
3. WHEN plan creation succeeds THEN the system SHALL return paddedPlanId (4-digit string)
4. WHEN plan creation succeeds THEN the system SHALL return documentPath (full path string)
5. WHEN plan creation succeeds THEN the system SHALL return descriptive success message

### Requirement 7: Integration with CreatePlanForm

**User Story:** As a user of the Architecture Intel Dashboard, I want to create plans through the web interface, so that I can initiate new development work.

#### Acceptance Criteria

1. WHEN I fill out the CreatePlanForm with valid data THEN the form SHALL call the createPlan workflow
2. WHEN the workflow succeeds THEN the form SHALL display success message with plan ID
3. WHEN the workflow fails THEN the form SHALL display the error message
4. WHEN plan creation succeeds THEN the form SHALL reset to empty state
5. WHEN plan creation succeeds THEN the form SHALL show plan details in success message

### Requirement 8: Test Data Management

**User Story:** As a developer testing the workflow, I want to create and clean up test plans, so that I can validate functionality without polluting the database.

#### Acceptance Criteria

1. WHEN creating test plans THEN the system SHALL generate sequential plan IDs
2. WHEN test plans are created THEN they SHALL be identifiable as test data
3. WHEN testing is complete THEN test plans SHALL be cleanable via deletePlan workflow
4. WHEN multiple test plans are created THEN each SHALL have unique document paths
5. WHEN testing edge cases THEN the system SHALL handle various plan name formats correctly
