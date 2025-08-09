# Schema Change Detection and Response

## Responsibility Model

### User Responsibilities

- ✅ Update table structures in `sql/database/whatsfresh/tables/`
- ✅ Update listViews in `sql/database/api_wf/views/`
- ✅ Decide what fields to expose/hide in views
- ✅ Control the data architecture and business logic

### Kiro Steering Responsibilities

- 🤖 Detect changes in both schema locations
- 🤖 Update displayConfigs with new/removed fields using safe defaults
- 🤖 Notify user of impacts and suggested actions
- 🤖 Maintain consistency between database schema and UI configurations
- 🤖 Generate change summaries and validation reports

## Detection Patterns

### Watch Paths

```
schema_change_detection:
  watch_paths:
    - "/sql/database/whatsfresh/tables/"
    - "/sql/database/api_wf/views/"

  on_change_detected:
    - update_display_configs_with_safe_defaults
    - notify_user_of_changes
    - generate_change_summary
    - validate_existing_configs
```

### Typical User Workflow

1. **User adds column** to `whatsfresh.ingredients` table
2. **User decides** to expose it in `api_wf.ingrList` view
3. **Kiro detects** both changes automatically
4. **Kiro updates** `ingrList.display.js` with safe defaults
5. **User fine-tunes** the display config as needed

## Safe Default Patterns

### New Field Detection

When a new field is added to a view:

- Add to displayConfig with `visible: false` (safe default)
- Use field name as default label
- Infer basic field type from SQL type
- Add comment indicating auto-generated

### Removed Field Detection

When a field is removed from a view:

- Mark as deprecated in displayConfig
- Add warning comment
- Suggest cleanup action to user

### Field Type Changes

When a field type changes:

- Update displayConfig field type
- Flag potential breaking changes
- Suggest review of dependent components

## Integration Points

### EventType Integration

- Update eventType field lists when views change
- Validate eventType queries against new schema
- Update parameter definitions if needed

### Component Integration

- Identify components using affected displayConfigs
- Generate impact reports for UI changes
- Suggest component updates when needed

### Workflow Integration

- Update workflow field mappings
- Validate workflow data transformations
- Flag potential workflow breaks

## Notification Patterns

### Change Summary Format

```
Schema Change Detected:
- Table: whatsfresh.ingredients
- View: api_wf.ingrList
- New Fields: organic_certified, supplier_rating
- Removed Fields: legacy_code
- Updated: ingrList.display.js (safe defaults added)
- Action Required: Review and customize new field displays
```

### Impact Analysis

- List affected displayConfigs
- Identify dependent eventTypes
- Flag components that may need updates
- Estimate development effort for changes

## Validation Rules

### Schema Consistency

- Ensure view fields exist in underlying tables
- Validate field types match between table and view
- Check for orphaned displayConfig entries

### Configuration Consistency

- Verify displayConfig fields exist in views
- Validate field type mappings
- Check for missing required configurations

## Refinement Areas

As we use this pattern, we may need to refine:

- Detection sensitivity (avoid noise from minor changes)
- Safe default intelligence (better type inference)
- Impact analysis accuracy (reduce false positives)
- Integration depth (how far to propagate changes)
- User notification preferences (frequency, detail level)

## Implementation Notes

This steering pattern enables:

- **Clean separation** of concerns between user and automation
- **Proactive** rather than reactive change management
- **Consistent** UI configurations across the application
- **Reduced** manual work for schema evolution
- **Better** visibility into change impacts

The user maintains full control over data architecture while Kiro handles the tedious consistency maintenance work.
