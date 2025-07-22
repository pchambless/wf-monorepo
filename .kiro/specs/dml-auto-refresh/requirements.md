# Requirements Document

## Introduction

The DML Auto-Refresh Enhancement addresses a common UX friction point where clients must make two separate API calls after database operations: one for the DML operation (INSERT/UPDATE/DELETE) and another to refresh the table data. This enhancement will allow the server to return fresh table data in the same response as the DML operation, eliminating the need for double API calls and improving user experience.

## Requirements

### Requirement 1

**User Story:** As a client application, I want to receive fresh table data immediately after a successful DML operation, so that I don't need to make a separate API call to refresh the UI.

#### Acceptance Criteria

1. WHEN a DML request includes a `listEvent` parameter THEN the system SHALL execute the specified list event after successful DML operation
2. WHEN the DML operation succeeds AND listEvent is provided THEN the system SHALL return both DML result and fresh table data in a single response
3. WHEN the DML operation succeeds AND no listEvent is provided THEN the system SHALL return only the DML result (backward compatibility)
4. WHEN the DML operation fails THEN the system SHALL NOT execute the listEvent and SHALL return only the DML error

### Requirement 2

**User Story:** As a developer, I want the parameter mapping between DML data and list event parameters to be automatic, so that I don't need to manually specify parameter mappings for common scenarios.

#### Acceptance Criteria

1. WHEN converting DML data to event parameters THEN the system SHALL map each field name to a parameter name using the format `:fieldName`
2. WHEN a DML data field is `acctID: 123` THEN the system SHALL create an event parameter `:acctID: 123`
3. WHEN multiple fields exist in DML data THEN the system SHALL convert all fields to their corresponding parameter format
4. WHEN the listEvent requires parameters not present in DML data THEN the system SHALL log a warning but continue execution

### Requirement 3

**User Story:** As a system maintainer, I want the event execution logic to be reusable across controllers, so that we maintain consistency and reduce code duplication.

#### Acceptance Criteria

1. WHEN event execution is needed THEN the system SHALL use a shared utility function `executeEventType()`
2. WHEN the `execEventType` controller processes requests THEN it SHALL use the shared utility function
3. WHEN the `dmlProcessor` executes list events THEN it SHALL use the same shared utility function
4. WHEN the shared utility encounters an error THEN it SHALL throw consistent error objects with proper status codes

### Requirement 4

**User Story:** As a client application, I want the response format to be predictable and well-structured, so that I can reliably process both DML results and refresh data.

#### Acceptance Criteria

1. WHEN listEvent is provided and succeeds THEN the response SHALL contain `dmlResult` and `refreshData` properties
2. WHEN listEvent is not provided THEN the response SHALL contain only the existing DML result structure
3. WHEN DML succeeds but listEvent fails THEN the system SHALL return the DML result with an error indicator for the refresh operation
4. WHEN both operations succeed THEN the `refreshData` SHALL contain the current state of the table after the DML operation

### Requirement 5

**User Story:** As a system administrator, I want proper logging and error handling for the enhanced DML operations, so that I can troubleshoot issues effectively.

#### Acceptance Criteria

1. WHEN a listEvent is executed after DML THEN the system SHALL log the event execution separately from the DML operation
2. WHEN parameter mapping occurs THEN the system SHALL log the mapped parameters in a sanitized format
3. WHEN the listEvent fails after successful DML THEN the system SHALL log both the DML success and the refresh failure
4. WHEN errors occur THEN the system SHALL provide clear error messages distinguishing between DML and refresh failures