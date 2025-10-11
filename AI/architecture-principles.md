 Key Architectural Principle: Parameter Flow Contract

  ## Core Architecture: Parameter Flow Contract

  ### The Fundamental Pattern
  1. **User Action** (click, select, navigate) →
  2. **Parameter Set** (`contextStore.setParameter()`) →
  3. **execEvent Call** (with confidence parameters exist)

  ### The Contract
  - Any eventType with `:paramName` expects that parameter in database api_wf.context_store.
  - Components NEVER manually manage these parameters
  - Missing parameters = UI flow bug, NOT component bug
  - Let execEvent throw - errors reveal broken navigation/selection logic

  ### Universal Rule for All Agents
  **If execEvent fails due to missing parameters, fix the UI flow, don't work around it**

## Database & SQL Principles:
  - Audit trail fields (created_at/by, updated_at/by) are auto-injected - never manually specify
  - table 'active' column is virtual based on the deleted_at null (1) not null (0).  1=active.
  - Parent keys are always type: "number", required: true, hidden: true
  - Field naming: camelCase in forms → snake_case in database via pageMap.fieldMappings

## Column/Field Metadata Standards:
  - **Field identifier**: Always use `name` property (never `field_name`, `field`, or `fieldName`)
  - **Visibility**: Use `hidden` boolean (true = hidden, false = visible) - never use `visible`
  - **Data transformation**: Convert MySQL `field_name` → `name` at load time in pageLoader.js
  - **No fallback chains**: Code should never use `column.name || column.field_name` - standardize at data boundary
  - **Prop naming**: Always use `columns` for both Grid and Form components (never `fields`) - simplifies logic and maintains consistency

## EventType System Sacred Rules:
  - Never modify core processing utilities (dmlProcessor) without system-wide impact analysis
  - eventType definitions are contracts - changing them affects every caller
  - The : prefix in SQL parameters is a delimiter, not decoration.  It signals that a parameter is present.  

## Blast Radius Awareness:
  - EVENTS, API, SHARED clusters = "high blast radius, tread carefully"
  - Changes to parameter processing = potential system-wide breakage
  - When in doubt, check established patterns before innovating

## Development Workflow:
  - If a pattern has been working for months, adapt new code to it, don't change the pattern
  - Test core functionality (like login) after making infrastructure changes
  - Impact tracking prevents "surprise" breakages across the monorepo

## CRUD Architecture
  - **CRUD components handle standard operations**: List views, form entry, edit flows, and delete operations follow consistent patterns
  - **Custom solutions only when necessary**: If data doesn't fit CRUD patterns (complex workflows, multi-step processes), then build custom components
  - **Leverage existing patterns**: The CRUD system provides proven UI/UX patterns for data management

## Business Workflow Modules
  - **Encapsulate complex operations**: Multi-step business processes (plan creation, completion, communication) should be atomic workflow modules, not UI-managed sequences
  - **Transaction integrity**: Workflows handle database transactions - all steps succeed or all rollback
  - **Single responsibility**: UI calls one workflow function, not multiple DML operations
  - **Consistent patterns**: All workflows follow same structure: validate → execute steps → commit/rollback → return result
  - **Example pattern**: `createPlan(data, userID)` → INSERT plan → INSERT documents → INSERT impacts → return success/failure
  - **Location**: Workflow modules in `/packages/shared-imports/src/workflows/` for cross-package reuse
  - **Error handling**: Workflows provide business-meaningful error messages, not database error codes

