# API - Server Log Enhancements

## User Idea
1. The current logs for successful requests are pretty good, but logging errored requests are very noisy.  We need to look at cutting out parts of the error info that are not helpful.
2. On errorred requests, send the request.data back to the client as a response in order to help debug issues directly in the client.  This should include only helpful information that will help debug the problem, not a lot of system info silliness.
3. logs that could be eliminated
    **DML Requests**
        -- 2025-07-21 08:58:17 [debug]: [dbUtils.js] Handling PATCH-specific logic
        -- 2025-07-21 08:58:17 [debug]: [dbUtils.js] Connection released
        -- 2025-07-21 08:58:17 [info]: [execDML.js] DML operation completed successfully
        -- 2025-07-21 08:58:17 [info]: [app.js]  Response: POST /api/execDML 200 (563ms)

    **SELECT requests**
        -- 2025-07-21 08:58:17 [http]: [execEventType.js] POST /api/execEventType
        -- 2025-07-21 08:58:17 [debug]: [executeEventType.js] Found event route with method: GET
        -- 2025-07-21 08:58:17 [debug]: [dbUtils.js] Handling GET-specific logic
        -- 2025-07-21 08:58:18 [info]: Performance measurement for database_query [Performance: 84.72ms]
        -- 2025-07-21 08:58:18 [debug]: [dbUtils.js] Connection released
        -- 2025-07-21 08:58:18 [info]: [app.js]  Response: POST /api/execEventType 200 (91ms)
        -- POST /api/execEventType reenm200 92.558 ms


## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: 0013
- **Files**: TBD (see impact-tracking.json: plan_id="0013")
- **Complexity**: TBD (High|Medium|Low)
- **Packages**: TBD (package names and file counts)
- **Blast Radius**: API (high)

### Impact Tracking Status
- **Predicted**: TBD files
- **Actual**: TBD files (+X discovered)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: [List plans that can't proceed until this is done]
- **Blocked by**: [List plans that must complete first]
- **Related**: [List plans with overlapping scope]
- **File Conflicts**: [Specific files being modified by multiple plans]

## Implementation Strategy
[High-level approach and key phases]

## Next Steps
1. [First implementation phase]
2. [Second phase]
3. [Testing and validation]
