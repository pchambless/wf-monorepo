# Implementation Plan

- [x] 1. Extract shared utility for event execution

  - Create `apps/wf-server/server/utils/executeEventType.js` with reusable logic
  - Export `executeEventType(eventType, params)` function that handles event lookup, query building, and execution
  - Include proper error handling with structured error objects
  - Add comprehensive logging with parameter sanitization
  - _Requirements: 3.1, 3.4_

- [x] 2. Refactor existing execEventType controller


  - Modify `apps/wf-server/server/controller/execEventType.js` to use new shared utility
  - Maintain exact same API contract and response format
  - Ensure no regression in existing functionality
  - Test that all existing event types continue to work
  - _Requirements: 3.2_

- [x] 3. Enhance DML processor with auto-refresh capability


- [x] 3.1 Add listEvent parameter validation



  - Update `processDML` function signature to accept optional `listEvent` parameter
  - Validate listEvent is a valid string when provided
  - Log listEvent processing attempts with sanitized parameters
  - _Requirements: 1.1, 5.1_


- [ ] 3.2 Implement parameter mapping logic

  - Create `buildEventParams` function to convert DML data fields to event parameters
  - Map each field name to `:fieldName` format for parameter substitution
  - Handle edge cases like null values and special characters

  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.3 Integrate executeEventType call after successful DML

  - Call `executeEventType(listEvent, eventParams)` after DML operation succeeds
  - Handle refresh operation errors gracefully without affecting DML success

  - Implement partial success response structure when refresh fails
  - _Requirements: 1.2, 4.3, 5.3_

- [x] 3.4 Update response structure for combined results



  - Return `{ dmlResult, refreshData }` when listEvent succeeds
  - Return `{ dmlResult, refreshData: null, refreshError }` when refresh fails
  - Maintain backward compatibility when no listEvent provided
  - _Requirements: 1.3, 4.1, 4.2_

- [ ] 4. Create comprehensive unit tests
- [ ] 4.1 Test executeEventType utility function

  - Test valid event execution with various parameter combinations
  - Test invalid event type handling and error responses
  - Test parameter substitution edge cases
  - Test database connection errors and timeout scenarios
  - _Requirements: 3.4, 5.4_

- [ ] 4.2 Test enhanced dmlProcessor functionality



  - Test existing DML operations continue working (regression testing)
  - Test listEvent parameter validation and edge cases
  - Test parameter mapping logic with various data structures
  - Test combined response structure in success scenarios
  - Test partial success scenarios when refresh fails
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 4.1, 4.2, 4.3_

- [ ] 5. Integration testing and validation
- [ ] 5.1 End-to-end testing with real database

  - Test UPDATE operation with listEvent returns fresh data
  - Test INSERT operation without listEvent maintains backward compatibility
  - Test DELETE operation with invalid listEvent handles gracefully
  - Verify audit trail fields are properly maintained in all scenarios
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5.2 Performance and error handling validation
  - Measure response time impact of additional refresh queries
  - Test network failure scenarios during refresh operation
  - Verify logging output includes both DML and refresh operations
  - Test parameter sanitization in log outputs
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
