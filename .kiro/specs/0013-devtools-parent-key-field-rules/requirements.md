# Requirements Document

## Introduction

Plan 0011 (Complete DML Process) is blocked by incorrect parent key field configuration in generated directives. The genDirectives.js tool is incorrectly assigning `type: "select"` to parent key fields instead of the required `type: "number"`, `required: true`, and `hidden: true` configuration. This causes DML operations to fail because parent key values (like acctID) are not properly included in form data.

## Requirements

### Requirement 1: Fix Parent Key Field Generation Logic

**User Story:** As a developer using the genDirectives.js tool, I want parent key fields to be automatically configured with the correct type and properties, so that DML operations receive proper data types and required fields.

#### Acceptance Criteria

1. WHEN genDirectives.js processes a field with `parentKey: true` THEN the system SHALL set `type: "number"`
2. WHEN genDirectives.js processes a field with `parentKey: true` THEN the system SHALL set `required: true`
3. WHEN genDirectives.js processes a field with `parentKey: true` THEN the system SHALL set `hidden: true`
4. WHEN genDirectives.js processes a field with `parentKey: true` THEN the system SHALL NOT set `type: "select"`

### Requirement 2: Document Parent Key Configuration Rules

**User Story:** As a developer working with the WhatsFresh architecture, I want clear documentation of parent key field rules, so that I understand the data integrity patterns and can maintain consistency.

#### Acceptance Criteria

1. WHEN ARCHITECTURE-RULES.md is updated THEN it SHALL include a [PARENT-KEY-FIELDS] section
2. WHEN the documentation is created THEN it SHALL explain the purpose of parent key fields
3. WHEN the documentation is created THEN it SHALL specify the required configuration (type: "number", required: true, hidden: true)
4. WHEN the documentation is created THEN it SHALL include examples of proper parent key field configuration
5. WHEN the documentation is created THEN it SHALL explain the detection logic used by genDirectives.js

### Requirement 3: Regenerate All Affected Directives

**User Story:** As a developer, I want all existing directives with parent key fields to be updated with the correct configuration, so that all forms work consistently with DML operations.

#### Acceptance Criteria

1. WHEN directives are regenerated THEN all fields with `parentKey: true` SHALL have correct configuration
2. WHEN directives are regenerated THEN manual customizations SHALL be preserved
3. WHEN directives are regenerated THEN only timestamp changes SHALL occur on second generation run
4. WHEN regeneration is complete THEN all parent key fields (acctID, userID, etc.) SHALL be properly configured

### Requirement 4: Validation and Testing

**User Story:** As a developer, I want to verify that the parent key field fixes work correctly, so that Plan 0011 DML operations can complete successfully.

#### Acceptance Criteria

1. WHEN validation is performed THEN all parentKey fields SHALL have type: "number", required: true, hidden: true
2. WHEN forms are generated THEN parent key fields SHALL produce proper hidden number inputs
3. WHEN DML operations are executed THEN parent key values SHALL be included in form data
4. WHEN Plan 0011 testing resumes THEN DML INSERT operations SHALL include required parent key values
5. WHEN Plan 0011 testing resumes THEN account_id field SHALL be properly populated from acctID
