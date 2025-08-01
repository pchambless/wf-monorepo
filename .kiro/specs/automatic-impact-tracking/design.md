# Design Document

## Overview

The Automatic Impact Tracking system will integrate with the existing file modification workflow to automatically create impact records in the `api_wf.plan_impacts` table. The system will be implemented as a middleware layer that intercepts file operations and generates appropriate database records without disrupting the normal development flow.

## Architecture

### Core Components

1. **ImpactTracker** - Main orchestrator that coordinates impact detection and recording
2. **FileWatcher** - Monitors file system changes and triggers impact creation
3. **PlanResolver** - Determines which plan to associate with file changes
4. **ImpactGenerator** - Creates meaningful descriptions and determines change types
5. **DatabaseWriter** - Handles the actual database operations for impact records

### Integration Points

- **File Operation Hooks** - Integrate with existing `fsWrite`, `strReplace`, `deleteFile` tools
- **Context Store** - Read plan selection from existing contextStore when available
- **Guidance System** - Extract plan context from Claude guidance and .kiro/specs folders
- **Database API** - Use existing `execDml` function for impact record creation

## Components and Interfaces

### ImpactTracker Class

```javascript
class ImpactTracker {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.planResolver = new PlanResolver();
    this.impactGenerator = new ImpactGenerator();
    this.databaseWriter = new DatabaseWriter();
    this.batchMode = false;
    this.batchDescription = null;
    this.pendingImpacts = [];
  }

  // Main entry point for tracking file changes
  async trackFileChange(filePath, changeType, context = {}) {
    if (!this.enabled) return;

    try {
      const planId = await this.planResolver.resolvePlan(context);
      const description = this.impactGenerator.generateDescription(
        filePath,
        changeType,
        context,
        this.batchDescription
      );

      const impact = {
        plan_id: planId,
        file_path: filePath,
        change_type: changeType,
        description: description,
        status: "completed",
        userID: context.userID || "kiro",
      };

      if (this.batchMode) {
        this.pendingImpacts.push(impact);
      } else {
        await this.databaseWriter.writeImpact(impact);
      }
    } catch (error) {
      console.warn("Impact tracking failed:", error);
      // Don't throw - file operations should continue
    }
  }

  // Batch operations
  startBatch(description) {
    this.batchMode = true;
    this.batchDescription = description;
    this.pendingImpacts = [];
  }

  async commitBatch() {
    if (this.pendingImpacts.length > 0) {
      await this.databaseWriter.writeBatchImpacts(this.pendingImpacts);
    }
    this.batchMode = false;
    this.batchDescription = null;
    this.pendingImpacts = [];
  }
}
```

### PlanResolver Class

```javascript
class PlanResolver {
  async resolvePlan(context = {}) {
    // Method 1: Explicit plan ID from context
    if (context.planId) {
      return context.planId;
    }

    // Method 2: ContextStore (when UI is running)
    if (typeof window !== "undefined" && window.contextStore) {
      const planId = window.contextStore.getParameter("planID");
      if (planId) return planId;
    }

    // Method 3: Working directory analysis
    const workingDir = process.cwd();
    const specMatch = workingDir.match(/\.kiro\/specs\/([^\/]+)/);
    if (specMatch) {
      return await this.derivePlanFromSpec(specMatch[1]);
    }

    // Method 4: Guidance document analysis
    const guidancePlan = await this.extractPlanFromGuidance();
    if (guidancePlan) return guidancePlan;

    // Method 5: Interactive prompt (if in interactive mode)
    if (context.interactive) {
      return await this.promptForPlan();
    }

    // Default: 0 (unassociated impact - avoids referential integrity violation)
    return 0;
  }

  async derivePlanFromSpec(specName) {
    // Look for plan ID in spec files or derive from database
    // Implementation details...
  }

  async extractPlanFromGuidance() {
    // Parse guidance documents for plan references
    // Implementation details...
  }
}
```

### ImpactGenerator Class

```javascript
class ImpactGenerator {
  generateDescription(filePath, changeType, context, batchDescription) {
    let description = "";

    // Add batch context if available
    if (batchDescription) {
      description += `${batchDescription} - `;
    }

    // Generate change-specific description
    switch (changeType) {
      case "CREATE":
        description += `Created ${this.getFileType(filePath)}`;
        break;
      case "MODIFY":
        description += `Modified ${this.getFileType(filePath)}`;
        break;
      case "DELETE":
        description += `Deleted ${this.getFileType(filePath)}`;
        break;
    }

    // Add context-specific details
    if (context.purpose) {
      description += ` - ${context.purpose}`;
    }

    // Add file-specific context
    if (this.isComponentFile(filePath)) {
      description += " component";
    } else if (this.isUtilityFile(filePath)) {
      description += " utility";
    }

    return description;
  }

  getFileType(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);

    if (ext === ".jsx" || ext === ".tsx") return "React component";
    if (ext === ".js" || ext === ".ts") return "JavaScript module";
    if (ext === ".css" || ext === ".scss") return "stylesheet";
    if (ext === ".md") return "documentation";
    if (ext === ".json") return "configuration";

    return fileName;
  }
}
```

## Data Models

### Enhanced Impact Record

The existing `api_wf.plan_impacts` table will be used with these fields:

```sql
- id (auto-increment)
- plan_id (defaults to 0 for unassociated impacts - avoids referential integrity violations)
- file_path (full relative path from workspace root)
- change_type (CREATE, MODIFY, DELETE)
- description (auto-generated with context)
- status (always 'completed' for automatic tracking)
- userID (from context or 'kiro' default)
- created_at (auto-timestamp)
- updated_at (auto-timestamp)
```

### Configuration Model

```javascript
const ImpactTrackingConfig = {
  enabled: true,
  batchMode: false,
  autoAssociate: true,
  promptForPlan: false,
  excludePatterns: [
    "node_modules/**",
    ".git/**",
    "*.log",
    "temp/**",
    "**/*.test.js",
    "**/*.test.jsx",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.js",
    "**/*.spec.jsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/test/**",
    "**/tests/**",
    "**/__tests__/**",
    "**/cypress/**",
    "**/jest/**",
    "**/tasks.md",
    "**/.kiro/specs/*/tasks.md",
  ],
  includePatterns: [
    "packages/**/*.js",
    "packages/**/*.jsx",
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "*.md",
    "*.json",
  ],
};
```

## Error Handling

### Graceful Degradation

1. **Database Connection Failures** - Log error, continue file operation
2. **Plan Resolution Failures** - Create impact with plan_id = 0
3. **Permission Errors** - Log warning, skip impact creation
4. **Invalid File Paths** - Sanitize and normalize paths before storage

### Error Recovery

```javascript
class ErrorHandler {
  static async handleImpactError(error, context) {
    console.warn(`Impact tracking failed: ${error.message}`);

    // Log to file for later analysis
    await this.logFailure(error, context);

    // Don't throw - allow file operations to continue
    return null;
  }

  static async logFailure(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      context: context,
      stack: error.stack,
    };

    // Append to impact-tracking-errors.log
    await fs.appendFile(
      "impact-tracking-errors.log",
      JSON.stringify(logEntry) + "\n"
    );
  }
}
```

## Testing Strategy

### Unit Tests

1. **PlanResolver Tests** - Test all plan resolution methods
2. **ImpactGenerator Tests** - Verify description generation logic
3. **DatabaseWriter Tests** - Mock database operations
4. **Error Handling Tests** - Ensure graceful failure modes

### Integration Tests

1. **File Operation Integration** - Test with actual fsWrite/strReplace calls
2. **Database Integration** - Test with real database connections
3. **Context Store Integration** - Test with running UI components
4. **Batch Operation Tests** - Verify batch commit functionality

### Performance Tests

1. **High-Frequency Changes** - Test debouncing with rapid file modifications
2. **Large File Operations** - Ensure minimal performance impact
3. **Database Load** - Test batch operations under load
4. **Memory Usage** - Monitor for memory leaks in long-running processes

## Implementation Phases

### Phase 1: Core Infrastructure

- Implement ImpactTracker, PlanResolver, and ImpactGenerator classes
- Create database writer with error handling
- Add configuration system

### Phase 2: File Operation Integration

- Hook into existing fsWrite, strReplace, deleteFile tools
- Implement change type detection
- Add basic plan resolution

### Phase 3: Advanced Plan Resolution

- Implement spec folder analysis
- Add guidance document parsing
- Create interactive prompting system

### Phase 4: Batch Operations & UI

- Implement batch mode functionality
- Create configuration UI components
- Add impact tracking dashboard

### Phase 5: Performance & Polish

- Add debouncing for rapid changes
- Implement file pattern filtering
- Optimize database operations
- Add comprehensive error logging
