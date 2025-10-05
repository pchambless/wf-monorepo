 # DirectRender CRUD Setup Session                                                                                                                                                    │ │
**Date**: 2025-10-01

**Context**: Continuation of DirectRender Coordination - Building first CRUD page (Ingredient Types)

## Accomplishments

### 1. Created execDML Action
**File**: `/apps/wf-studio/src/rendering/WorkflowEngine/triggers/action/execDML.js`
- Handles INSERT/UPDATE/DELETE operations for forms
- Merges formData from context with trigger content configuration
- Calls shared-imports execDml API wrapper
- Returns result for onSuccess callbacks

```javascript
export async function execDML(content, context) {
    const { execDml } = await import('@whatsfresh/shared-imports');
    const dmlRequest = {
        method: content.method,
        table: content.table,
        data: context.formData || content.data || {}
    };
    console.log('💾 execDML:', dmlRequest);
    return await execDml(dmlRequest);
}
```

### 2. Established Ingredient Types CRUD Structure
**Database Setup**:
- **eventSQL queries**:
    - ingrTypeList (id: 11): Grid data query
    - ingrTypeDtl (id: 12): Form detail query

- **eventType_xref**:
    - ingrTypePage (id: 57): Container page
    - ingrTypeGrid (id: 56): Left-side grid component
    - ingrTypeForm (id: 59): Right-side form component

- **Basic triggers established**:
    - Grid onChange → setVals (ingrTypeID, ingrTypeName) + refresh form
    - Form onRefresh → execEvent (detail query)

### 3. Identified Configuration Patterns
Through building this first CRUD page, identified standard requirements:
- Grid needs: rowKey, selectable, dataSource props + onRefresh trigger
- Form needs: layout prop + onSubmit (execDML) + onSuccess (refresh grid)
- Grid-to-form linking: onChange → setVals + refresh
- Form-to-grid linking: onSuccess → refresh

## Next Steps

### Immediate: Complete Ingredient Types Configuration

**Database Fixes Needed**:

```sql
-- 1. Add grid onRefresh trigger for initial data load
INSERT INTO api_wf.eventTrigger (xref_id, class, action, ordr, content, is_dom_event, created_by)
VALUES (56, 'onRefresh', 'execEvent', 1, '11', 0, 'Paul');

-- 2. Add grid props for data binding
INSERT INTO api_wf.eventProps (xref_id, prop_name, prop_value, created_by)
VALUES
    (56, 'rowKey', 'id', 'Paul'),
    (56, 'selectable', 'true', 'Paul'),
    (56, 'dataSource', 'ingrTypeList', 'Paul');

-- 3. Fix form onRefresh to use detail query (12) not list query (11)
UPDATE api_wf.eventTrigger
SET content = '12'
WHERE xref_id = 59 AND class = 'onRefresh';

-- 4. Add form onSubmit trigger
INSERT INTO api_wf.eventTrigger (xref_id, class, action, ordr, content, is_dom_event, created_by)
VALUES (59, 'onSubmit', 'execDML', 1, '{"method": "INSERT", "table": "api_wf.ingredient_types"}', 1, 'Paul');

-- 5. Add form onSuccess trigger to refresh grid
INSERT INTO api_wf.eventTrigger (xref_id, class, action, ordr, content, is_dom_event, created_by)
VALUES (59, 'onSuccess', 'refresh', 2, '["ingrTypeGrid"]', 0, 'Paul');

-- 6. Add form props
INSERT INTO api_wf.eventProps (xref_id, prop_name, prop_value, created_by)
VALUES (59, 'layout', 'vertical', 'Paul');

-- 7. Check for and remove duplicate onChange setVals triggers
SELECT * FROM api_wf.eventTrigger
WHERE xref_id = 56 AND class = 'onChange' AND action = 'setVals';
```

### Testing Plan

1. **Generate pageConfig**: `POST http://localhost:3001/api/genPageConfig {"pageID": 57}`
2. **Preview**: `http://localhost:5173/preview/wf-client/ingrTypePage`
3. **Test flow**:
     - Grid loads data on page load (onRefresh)
     - Clicking grid row populates form (onChange → setVals + refresh)
     - Form submission creates record (onSubmit → execDML)
     - Grid refreshes after save (onSuccess → refresh)

### Future Work

1. **Determine INSERT vs UPDATE logic**: Form needs to detect if ingrTypeID exists in context to choose between INSERT/UPDATE
2. **Build 2-3 more CRUD forms**: Identify reusable patterns for scaffolding
3. **Create scaffolding stored procedures**: Auto-generate standard CRUD configurations
4. **Field validation**: Add required/optional field handling
5. **Form field binding**: Implement automatic form population from detail query results

## Key Files Modified

- `/apps/wf-studio/src/rendering/WorkflowEngine/triggers/action/execDML.js` - NEW
- Database tables: `api_wf.eventSQL`, `api_wf.eventType_xref`, `api_wf.eventTrigger`, `api_wf.eventProps`

## Architecture Notes

**CRUD Pattern Emerging**:
- Grid loads data on page load via `onRefresh` (SELECT query).
- Selecting a grid row triggers `onChange` → `setVals` (populate form) and refreshes the form (detail query).
- Form loads detail data on `onRefresh`.
- Form submission triggers `onSubmit` → `execDML` (INSERT/UPDATE/DELETE).
- On successful form submission (`onSuccess`), the grid is refreshed to show updated data.
- Props and triggers are standardized for grid (`rowKey`, `selectable`, `dataSource`, `onRefresh`) and form (`layout`, `onSubmit`, `onSuccess`).
- Data flows between grid and form are managed via context and triggers.
- This pattern is reusable for other CRUD pages.

- Page → Grid + Form (side-by-side layout)
- Grid: onRefresh (load data) + onChange (select row)
- Form: onRefresh (load detail) + onSubmit (save) + onSuccess (refresh grid)
- Data flow: execEvent (SELECT) ↔ execDML (INSERT/UPDATE/DELETE)
- State management: componentId-keyed dataStore in DirectRenderer

**Template Variables**:
- Form data: `{{form.fieldName.value}}` (scraped by DirectRenderer)
- API responses: `{{response.fieldName}}` (from TriggerEngine)
- Grid selection: `{{selected.fieldName}}` (from onChange context)
- Component value: `{{this.value}}` (from event target)             