# Studio Database Layer

IndexedDB-based local-first storage with MySQL sync.

## Structure

```
/db
├── studioDb.js         # Dexie database instance
├── versions/           # Schema migrations (v01-v99)
└── operations/         # Database operations (CRUD, sync)
```

## Usage

### Import Database Operations

```javascript
import { db } from '@/db/studioDb';
import {
  getComponentsByPage,
  updateComponent,
  syncToMySQL
} from '@/db/operations';
```

### Local-First Workflow

1. **Create** - New records start with `id: null`, `_dmlMethod: 'INSERT'`
2. **Update** - Modified records marked with `_dmlMethod: 'UPDATE'`
3. **Delete** - Deleted records marked with `_dmlMethod: 'DELETE'`
4. **Sync** - Push changes to MySQL, update local `id`, clear `_dmlMethod`

### Example: Create Component

```javascript
import { createComponent } from '@/db/operations';

const idbID = await createComponent({
  pageID: 57,
  comp_name: 'NewButton',
  parent_id: 10,
  comp_type: 'component',
  container: 'Button'
});

// Record now in IndexedDB:
// { idbID: 1, id: null, comp_name: 'NewButton', _dmlMethod: 'INSERT' }
```

### Example: Sync to MySQL

```javascript
import { syncToMySQL } from '@/db/operations';

const results = await syncToMySQL();
// Results: [{ success: true, idbID: 1, mysqlId: 123 }]

// Record now updated:
// { idbID: 1, id: 123, comp_name: 'NewButton', _dmlMethod: null }
```

## Key Concepts

### idbID vs id

- `idbID` - IndexedDB primary key (auto-increment, local only)
- `id` - MySQL primary key (null until synced)

Always reference records by `idbID` locally.

### _dmlMethod

Tracks pending changes:
- `'INSERT'` - New record not yet in MySQL
- `'UPDATE'` - Modified record needs MySQL update
- `'DELETE'` - Deleted record needs MySQL deletion
- `null` - Synced, no pending changes

## Adding New Operations

Create new files in `/operations/` for new table types:

```javascript
// /operations/myTableOps.js
import { db } from '../studioDb.js';

export const getMyRecords = async () => {
  return await db.myTable.toArray();
};
```

Export from `/operations/index.js`.
