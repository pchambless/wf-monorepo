# Configuration Utilities

This directory contains utilities for accessing configuration data from `selectVals.json` and other configuration files.

## SelectVals Helper Utility

The `selectValsHelper.js` provides a clean, reusable way to access any configuration from `selectVals.json`.

### Basic Usage

```javascript
import {
  CommonConfigs,
  getConfigChoices,
} from "@whatsfresh/shared-imports/architecture/config/selectValsHelper";

// Enhanced parameterized API (recommended)
const planStatuses = CommonConfigs("planStatus");
const priorities = CommonConfigs("priority");
const clusters = CommonConfigs("cluster");
const complexities = CommonConfigs("complexity");
const workflows = CommonConfigs("registeredWorkflows");

// Returns: [{ value: "new", label: "New", color: "slate", ordr: 1 }, ...]

// Alternative: Direct function call
const priorities = getConfigChoices("priority");
```

### Advanced Usage

```javascript
import {
  getConfigChoices,
  getConfigChoice,
  getFormattedChoices,
} from "@whatsfresh/shared-imports/architecture/config/selectValsHelper";

// Get configuration with metadata
const statusConfig = getConfigChoices("planStatus", {
  sortByOrder: true,
  includeMetadata: true,
});

// Get a specific choice by value
const activeStatus = getConfigChoice("planStatus", "active");

// Get formatted choices for UI components
const formattedStatuses = getFormattedChoices("planStatus", {
  includeColors: true,
});
```

### Available Common Configurations

The `CommonConfigs` function provides access to any configuration in selectVals.json:

- `CommonConfigs('planStatus')` - Plan status options
- `CommonConfigs('priority')` - Priority levels
- `CommonConfigs('cluster')` - System clusters
- `CommonConfigs('complexity')` - Complexity levels
- `CommonConfigs('workflowTimeouts')` - Workflow timeout configurations
- `CommonConfigs('workflowRetryPolicies')` - Retry policy configurations
- `CommonConfigs('registeredWorkflows')` - Available workflows
- `CommonConfigs('workflowErrorHandling')` - Error handling strategies
- `CommonConfigs('workflowCommunicationPatterns')` - Communication patterns
- **Any new configuration** added to selectVals.json automatically works!

### Component Example

```javascript
import React, { useState, useEffect } from "react";
import { CommonConfigs } from "@whatsfresh/shared-imports/architecture/config/selectValsHelper";

const StatusSelector = ({ onStatusChange }) => {
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    // Load status options from configuration - clean and simple!
    const options = CommonConfigs("planStatus", { sortByOrder: true });
    setStatusOptions(options);
  }, []);

  return (
    <select onChange={(e) => onStatusChange(e.target.value)}>
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Multiple configurations in one component
const MultiConfigSelector = () => {
  const statuses = CommonConfigs("planStatus");
  const priorities = CommonConfigs("priority");
  const clusters = CommonConfigs("cluster");

  return (
    <div>
      <select>
        {statuses.map((s) => (
          <option key={s.value}>{s.label}</option>
        ))}
      </select>
      <select>
        {priorities.map((p) => (
          <option key={p.value}>{p.label}</option>
        ))}
      </select>
      <select>
        {clusters.map((c) => (
          <option key={c.value}>{c.label}</option>
        ))}
      </select>
    </div>
  );
};
```

### Benefits

1. **Centralized Configuration**: All configuration access goes through one utility
2. **Type Safety**: Consistent data structure and error handling
3. **Reusability**: Same utility works for any configuration in selectVals.json
4. **Sorting**: Automatic sorting by `ordr` field when available
5. **Fallback Handling**: Graceful error handling with fallback options
6. **Metadata Access**: Can access configuration metadata when needed
7. **🆕 Parameterized API**: Single function handles all configurations
8. **🆕 Future-Proof**: Automatically works with new configurations
9. **🆕 Self-Documenting**: Parameter clearly shows which config is being accessed
10. **🆕 Backward Compatible**: Legacy object-based API still available

### Configuration Structure

The utility expects configurations in `selectVals.json` to follow this structure:

```json
{
  "configName": {
    "name": "configName",
    "description": "Optional description",
    "choices": [
      {
        "value": "option1",
        "label": "Option 1",
        "ordr": 1,
        "color": "blue"
      }
    ]
  }
}
```

### Error Handling

The utility includes comprehensive error handling:

- Returns empty array if configuration not found
- Logs warnings for missing configurations
- Provides fallback options in components
- Graceful degradation for malformed data
