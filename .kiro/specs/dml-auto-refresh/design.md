# Design Document

## Overview

The DML Auto-Refresh Enhancement extends the existing DML system to optionally return fresh table data in the same response as database operations. This eliminates client-side double API calls and improves user experience while maintaining full backward compatibility.

## Architecture

### Current Architecture
```
Client → execDML → dmlProcessor → sqlBuilder → Database
Client → execEventType → executeQuery → Database (separate call)
```

### Enhanced Architecture
```
Client → execDML → dmlProcessor → sqlBuilder → Database
                              ↓ (if listEvent provided)
                              → executeEventType → Database
                              ↓
                              Combined Response
```

## Components and Interfaces

### 1. Shared Utility: executeEventType.js

**Location:** `apps/wf-server/server/utils/executeEventType.js`

**Purpose:** Extract reusable event execution logic from execEventType controller

**Interface:**
```javascript
export const executeEventType = async (eventType, params) => {
  // Returns: query result data
  // Throws: structured error objects
}
```

**Dependencies:**
- `@whatsfresh/shared-imports/events` (getEventType)
- `../queryResolver.js` (createRequestBody)
- `../dbUtils.js` (executeQuery)
- `../logger.js`

### 2. Enhanced DML Processor

**Location:** `apps/wf-server/server/utils/dml/dmlProcessor.js`

**New Interface:**
```javascript
export const processDML = async (requestBody) => {
  // Input: { method, table, data, primaryKey, listEvent? }
  // Output: { dmlResult, refreshData? }
}
```

**Parameter Mapping Logic:**
```javascript
const buildEventParams = (data) => {
  const eventParams = {};
  Object.entries(data).forEach(([fieldName, value]) => {
    eventParams[`:${fieldName}`] = value;
  });
  return eventParams;
};
```

### 3. Updated Controller

**Location:** `apps/wf-server/server/controller/execEventType.js`

**Change:** Refactor to use shared `executeEventType` utility

## Data Models

### Enhanced Request Schema
```javascript
{
  method: "UPDATE",           // Required: INSERT|UPDATE|DELETE
  table: "ingredient_types",  // Required: target table
  data: {                     // Required: field data + context
    ingrTypeID: 3,
    ingrTypeName: "Produce", 
    acctID: 1,
    userID: 123
  },
  primaryKey: "ingrTypeID",   // Required for UPDATE/DELETE
  listEvent: "ingrTypeList"   // Optional: refresh event type
}
```

### Enhanced Response Schema

**Without listEvent (backward compatible):**
```javascript
{
  success: true,
  method: "UPDATE",
  table: "ingredient_types", 
  result: { ... },
  message: "UPDATE operation completed successfully"
}
```

**With listEvent (enhanced):**
```javascript
{
  dmlResult: {
    success: true,
    method: "UPDATE",
    table: "ingredient_types",
    result: { ... },
    message: "UPDATE operation completed successfully"
  },
  refreshData: [
    { ingrTypeID: 1, ingrTypeName: "Spice", ... },
    { ingrTypeID: 3, ingrTypeName: "Produce", ... }
  ]
}
```

**Partial success (DML success, refresh failure):**
```javascript
{
  dmlResult: {
    success: true,
    method: "UPDATE", 
    table: "ingredient_types",
    result: { ... },
    message: "UPDATE operation completed successfully"
  },
  refreshData: null,
  refreshError: "Failed to execute listEvent: ingrTypeList"
}
```

## Error Handling

### Error Scenarios

1. **DML Failure:** Return existing error response (no change)
2. **DML Success + Refresh Success:** Return combined response
3. **DML Success + Refresh Failure:** Return partial success with refreshError
4. **Invalid listEvent:** Log warning, continue with DML-only response

### Error Response Structure
```javascript
{
  dmlResult: { success: true, ... },
  refreshData: null,
  refreshError: "Event type 'invalidEvent' not found"
}
```

## Testing Strategy

### Unit Tests

**executeEventType.js:**
- Valid event execution
- Invalid event type handling
- Parameter substitution
- Database error handling

**dmlProcessor.js:**
- Existing DML functionality (regression)
- listEvent parameter validation
- Parameter mapping logic
- Combined response structure
- Partial success scenarios

### Integration Tests

**End-to-End Scenarios:**
- UPDATE with refresh → combined response
- INSERT without listEvent → backward compatibility
- DELETE with invalid listEvent → partial success
- Network failure during refresh → error handling

### Test Data Requirements
- Sample DML requests with/without listEvent
- Mock event type definitions
- Database fixtures for before/after state validation

## Implementation Phases

### Phase 1: Extract Shared Utility
1. Create `executeEventType.js` utility
2. Refactor `execEventType.js` controller
3. Test existing functionality (no regression)

### Phase 2: Enhance DML Processor
1. Add listEvent parameter validation
2. Implement parameter mapping logic
3. Integrate executeEventType call
4. Update response structure

### Phase 3: Testing & Validation
1. Unit test coverage
2. Integration testing
3. Backward compatibility verification
4. Performance impact assessment

## Performance Considerations

- **Additional Query:** Each DML with listEvent executes one extra SELECT
- **Response Size:** Combined responses will be larger
- **Caching:** No caching planned initially (same as existing list queries)
- **Timeout:** Refresh failures won't block DML success

## Security Considerations

- **Parameter Injection:** Use existing queryResolver parameter substitution
- **Data Exposure:** Refresh queries use same permissions as existing list events
- **Logging:** Sanitize parameters in refresh operation logs