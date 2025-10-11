# IndexedDB Schema Versions

Each version file represents one schema migration for StudioDB.

## Development vs Production

### During Development (Now)
- Use **v01.js only**
- Edit v01.js directly when schema changes
- Delete StudioDB in DevTools and refresh to apply changes
- Fast iteration, no migration complexity

### Before Production
- Copy current v01.js → v02.js (preserving history)
- Make breaking changes in new v03.js
- Add proper migration path
- Never delete old versions (breaks existing users)

## File Naming Convention

- `v01.js` to `v99.js` (supports up to 99 versions)
- Zero-padded for consistent sorting

## Version Schema Pattern

```javascript
export const v09 = {
  // Working tables use ++idbID (auto-increment local key) + id (MySQL key)
  eventComp_xref: '++idbID, id, pageID, comp_name, parent_id, _dmlMethod',

  // Reference tables use unique name index only
  refContainers: '&name',
};
```

## Key Patterns

- `++idbID` - Auto-increment IndexedDB primary key (local only)
- `id` - MySQL primary key (null for new records, populated after sync)
- `&name` - Unique index
- `[xref_id+paramName]` - Compound index

## Migration Strategy

1. **Adding tables**: Just add them to the schema object
2. **Removing tables**: Set to `null`
3. **Changing primary key**: Delete table in one version, recreate in next
4. **Adding fields**: Just add them to the index list

## Current Version: v09

### Working Tables (editable, sync to MySQL)
- `eventComp_xref` - Page component hierarchy
- `eventTriggers` - Component event triggers
- `eventProps` - Component properties
- `eventTypes` - Event type definitions
- `eventSQL` - SQL query definitions
- `triggers` - Trigger action/class definitions

### Reference Tables (read-only caches)
- `refContainers` - Container types
- `refComponents` - Component types
- `refTriggerActions` - Trigger actions
- `refTriggerClasses` - Trigger classes

## Next Version Template

```javascript
// v10.js
export const v10 = {
  // Add new changes here
  // Example: newTable: '++idbID, id, name, _dmlMethod'
};
```

Then update `index.js` and `studioDb.js`:
```javascript
// versions/index.js
export { v10 } from './v10.js';

// studioDb.js
db.version(10).stores(v10);
```
