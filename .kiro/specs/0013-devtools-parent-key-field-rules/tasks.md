# Implementation Plan

## Task Overview

Integrate directiveMap.js system into genDirectives.js and fix parent key field configuration to unblock Plan 0011 DML operations.

**Expanded Scope:** Based on architectural assessment, this plan now includes full directiveMap integration to fix the root cause and prevent future similar bugs.

- [x] 1. Investigate Current Architecture and Integration Points

  - Review directiveMap.js system and processDirectives() API
  - Analyze genDirectives.js hardcoded logic that needs replacement
  - Identify integration points and compatibility requirements
  - Document current parent key logic flow and fix points
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Integrate DirectiveMap System into GenDirectives


  - [x] 2.1 Import and setup directiveMap integration

    - Import directiveMap.js into genDirectives.js
    - Create integration wrapper for processDirectives() API
    - Test basic integration with sample directive
    - _Requirements: 1.1_

  - [x] 2.2 Replace hardcoded field type logic with directiveMap calls

    - Remove duplicate field type assignment logic from genDirectives.js
    - Replace with directiveMap.processDirectives() calls
    - Ensure all existing field types continue to work correctly
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.3 Verify parent key fields get correct configuration

    - Test that parentKey: true fields get type: "number", required: true, hidden: true
    - Remove incorrect type: "select" assignment for parent keys
    - Ensure directiveMap business rules are properly applied
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.4 Add preservation logic for manual customizations

    - Ensure existing manual overrides are preserved during integration
    - Log warnings when manual settings conflict with directiveMap rules
    - Test backward compatibility with existing directives
    - _Requirements: 3.2_

- [ ] 3. Create Architecture Documentation




  - [ ] 3.1 Create or update ARCHITECTURE-RULES.md




    - Add [PARENT-KEY-FIELDS] section
    - Document purpose and data integrity patterns
    - _Requirements: 2.1, 2.2_

  - [ ] 3.2 Document parent key configuration rules
    - Specify required properties (type: "number", required: true, hidden: true)
    - Include detection logic explanation
    - Add configuration examples
    - _Requirements: 2.3, 2.4, 2.5_

- [ ] 4. Regenerate Affected Directives

  - [ ] 4.1 Identify all directives with parent key fields

    - Scan existing directives for parentKey: true fields
    - Create list of affected files for regeneration
    - _Requirements: 3.1_

  - [ ] 4.2 Run directive regeneration

    - Execute genDirectives.js with fixed logic
    - Verify all parent key fields get correct configuration
    - Test preservation of manual customizations
    - _Requirements: 3.1, 3.2_

  - [ ] 4.3 Validate generation stability
    - Run generation twice to verify only timestamp changes
    - Ensure no unexpected modifications occur
    - _Requirements: 3.3_

- [ ] 5. Validation and Testing

  - [ ] 5.1 Verify parent key field configuration

    - Check all parentKey fields have type: "number", required: true, hidden: true
    - Validate configuration across all affected directives
    - _Requirements: 4.1_

  - [ ] 5.2 Test form generation

    - Verify forms produce proper hidden number inputs for parent keys
    - Test form data collection includes parent key values
    - _Requirements: 4.2, 4.3_

  - [ ] 5.3 Test DML integration
    - Verify DML operations receive parent key values in form data
    - Test that account_id field is properly populated from acctID
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 6. Unblock Plan 0011

  - [ ] 6.1 Validate Plan 0011 DML operations

    - Test INSERT operations include required parent key values
    - Verify account_id field is properly included in SQL
    - Confirm DML operations complete successfully
    - _Requirements: 4.4, 4.5_

  - [ ] 6.2 Complete end-to-end testing
    - Test complete form → FormStore → API → DML → database flow
    - Verify all parent key relationships work correctly
    - Confirm Plan 0011 can proceed with testing
    - _Requirements: 4.4, 4.5_
