#!/usr/bin/env node

/**
 * Universal Document Update Script
 * Part of Plan 0018 Phase 3: Document Management Integration
 *
 * Scans .kiro/specs/ and .kiro/issues/ directories for unregistered markdown files
 * and registers them in the plan_documents database table.
 *
 * Usage:
 *   # Register existing documents for a plan
 *   node claude-plans/tools/document-update.js --plan 18          # Register documents for plan 18
 *   node claude-plans/tools/document-update.js --plan 18 --dry-run # Show what would be registered
 *   node claude-plans/tools/document-update.js --plan 18 --file path.md # Register specific file
 *   node claude-plans/tools/document-update.js --plan 18 --verbose # Detailed output
 *
 *   # Create and register new documents (Plan 0019 enhancement)
 *   node claude-plans/tools/document-update.js --create --type=plan --plan-id=19 --by=user
 *   node claude-plans/tools/document-update.js --create --type=spec --plan-id=19 --by=kiro
 *   node claude-plans/tools/document-update.js --create --type=issue --plan-id=19 --by=claude
 */

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseDocumentMetadata } from "../../packages/shared-imports/src/utils/documentMetadata.js";
import {
  batchRegisterDocuments,
  getRegisteredDocuments,
} from "../../packages/shared-imports/src/services/documentService.js";
import { logImpact } from "../../packages/shared-imports/src/services/impactService.js";

// Get current directory for relative path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../..");

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes("--dry-run"),
  verbose: args.includes("--verbose"),
  specificFile: null,
  planId: null,
  // Plan 0019 enhancements
  create: args.includes("--create"),
  type: null,
  by: null,
};

// Check for plan ID argument (legacy --plan format)
const planIndex = args.indexOf("--plan");
if (planIndex !== -1 && args[planIndex + 1]) {
  options.planId = parseInt(args[planIndex + 1], 10);
}

// Check for plan ID argument (new --plan-id format for create mode)
const planIdIndex = args.indexOf("--plan-id");
if (planIdIndex !== -1 && args[planIdIndex + 1]) {
  options.planId = parseInt(args[planIdIndex + 1], 10);
}

// Also check for --plan-id=<value> format
const planIdArg = args.find((arg) => arg.startsWith("--plan-id="));
if (planIdArg) {
  options.planId = parseInt(planIdArg.split("=")[1], 10);
}

// Check for document type argument
const typeArg = args.find((arg) => arg.startsWith("--type="));
if (typeArg) {
  options.type = typeArg.split("=")[1];
}

// Check for creator argument
const byArg = args.find((arg) => arg.startsWith("--by="));
if (byArg) {
  options.by = byArg.split("=")[1];
}

// Check for specific file argument
const fileIndex = args.indexOf("--file");
if (fileIndex !== -1 && args[fileIndex + 1]) {
  options.specificFile = args[fileIndex + 1];
}

/**
 * Recursively scan directory for markdown files
 * @param {string} dirPath - Directory to scan
 * @param {Array} results - Array to collect results
 */
function scanDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, results);
      } else if (stat.isFile() && item.endsWith(".md")) {
        // Convert to relative path from workspace root
        const relativePath = path
          .relative(workspaceRoot, fullPath)
          .replace(/\\/g, "/");
        results.push(relativePath);
      }
    }
  } catch (error) {
    console.warn(
      `Warning: Could not scan directory ${dirPath}: ${error.message}`
    );
  }

  return results;
}

/**
 * Get all markdown files in target directories
 * @returns {Array} - Array of relative file paths
 */
function discoverDocuments() {
  const specsDir = path.join(workspaceRoot, ".kiro", "specs");
  const issuesDir = path.join(workspaceRoot, ".kiro", "issues");

  let allFiles = [];

  // Scan specs directory
  if (fs.existsSync(specsDir)) {
    const specsFiles = scanDirectory(specsDir);
    allFiles = allFiles.concat(specsFiles);
    if (options.verbose) {
      console.log(`Found ${specsFiles.length} files in .kiro/specs/`);
    }
  } else {
    console.warn("Warning: .kiro/specs/ directory not found");
  }

  // Scan issues directory
  if (fs.existsSync(issuesDir)) {
    const issuesFiles = scanDirectory(issuesDir);
    allFiles = allFiles.concat(issuesFiles);
    if (options.verbose) {
      console.log(`Found ${issuesFiles.length} files in .kiro/issues/`);
    }
  } else {
    console.warn("Warning: .kiro/issues/ directory not found");
  }

  return allFiles;
}

/**
 * Filter documents to only include those for the specified plan
 * @param {Array} allFiles - All discovered files
 * @param {number} planId - Plan ID to filter for
 * @returns {Array} - Files that belong to the specified plan
 */
function filterByPlan(allFiles, planId) {
  return allFiles.filter((filePath) => {
    // Extract metadata to get the plan_id
    try {
      const fullPath = path.join(workspaceRoot, filePath);
      const content = fs.readFileSync(fullPath, "utf8");
      const metadata = parseDocumentMetadata(filePath, content);
      return metadata.plan_id === planId;
    } catch (error) {
      console.warn(`Warning: Could not process ${filePath}: ${error.message}`);
      return false;
    }
  });
}

/**
 * Create a new document file and register it in the database
 * Plan 0019 enhancement for UI-integrated automation
 * @param {string} type - Document type: 'plan', 'spec', 'issue'
 * @param {number} planId - Plan ID
 * @param {string} createdBy - Who created it: 'user', 'claude', 'kiro'
 * @returns {Object} - Creation result
 */
async function createDocument(type, planId, createdBy) {
  try {
    let filePath, content, title;

    switch (type) {
      case "plan":
        filePath = `claude-plans/a-pending/${planId
          .toString()
          .padStart(4, "0")}-CLUSTER-Plan-Name.md`;
        title = `Plan ${planId}`;
        content = generatePlanTemplate(planId, title);
        break;

      case "spec":
        filePath = `.kiro/specs/${planId
          .toString()
          .padStart(4, "0")}-plan-name/design.md`;
        title = `Plan ${planId} Specification`;
        content = generateSpecTemplate(planId, title);
        break;

      case "issue":
        filePath = `.kiro/issues/${planId
          .toString()
          .padStart(3, "0")}-issue-description.md`;
        title = `Issue ${planId}`;
        content = generateIssueTemplate(planId, title);
        break;

      case "investigation":
        filePath = `.kiro/investigations/${planId
          .toString()
          .padStart(4, "0")}-investigation-topic.md`;
        title = `Plan ${planId} Investigation Guide`;
        content = generateInvestigationGuideTemplate(planId, title);
        break;

      default:
        throw new Error(`Unknown document type: ${type}`);
    }

    // Create directory if it doesn't exist
    const fullPath = path.join(workspaceRoot, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create the file
    fs.writeFileSync(fullPath, content, "utf8");

    // Get the proper creator name for audit trails
    const creatorName = await getCreatorName(createdBy);

    // Create metadata directly for create mode (don't rely on extraction)
    const metadata = {
      plan_id: planId,
      document_type: type,
      file_path: filePath,
      title: title,
      author: creatorName,
      status: "draft",
      created_by: creatorName,
    };

    const registerResult = await batchRegisterDocuments([metadata], planId);

    // Log the impact for tracking
    const impactResult = await logImpact({
      planId: planId,
      filePath: filePath,
      changeType: "CREATED",
      description: `Created ${type} document: ${title} (by ${createdBy})`,
      createdBy: creatorName,
    });

    if (options.verbose && impactResult.success) {
      console.log(`📊 Impact logged: ${impactResult.message}`);
    }

    return {
      success: true,
      filePath: filePath,
      title: title,
      registered: registerResult.summary.registered > 0,
      impactLogged: impactResult.success,
      message: `Created ${type} document: ${title}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Failed to create ${type} document`,
    };
  }
}

/**
 * Generate template content for plan documents
 */
function generatePlanTemplate(planId, title) {
  return `# ${title}

## Plan Overview
[Brief description of the plan objective]

## Background
[Context and motivation for this plan]

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: ${planId.toString().padStart(4, "0")}
- **Files**: TBD
- **Complexity**: TBD
- **Packages**: TBD
- **Blast Radius**: TBD

### Plan Dependencies
- **Blocks**: TBD
- **Blocked by**: TBD
- **Related**: TBD

## Key Deliverables
[List of main deliverables]

## Success Criteria
[How to measure completion]

## Implementation Notes
[Technical details and considerations]

## Current Status
- **Phase**: Planning
- **Next Steps**: TBD
`;
}

/**
 * Generate template content for spec documents
 */
function generateSpecTemplate(planId, title) {
  return `# ${title}

## Requirements
[Functional and non-functional requirements]

## Design
[Technical design and architecture]

## Implementation Tasks
[Breakdown of implementation steps]

## Testing Strategy
[How to validate the implementation]

## Dependencies
[External dependencies and prerequisites]
`;
}

/**
 * Generate template content for issue documents
 */
function generateIssueTemplate(planId, title) {
  return `# ${title}

## Issue Description
[Clear description of the problem]

## Steps to Reproduce
[How to reproduce the issue]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Impact
[Severity and impact assessment]

## Proposed Solution
[Suggested fix or workaround]

## Related Plans
- Plan ${planId.toString().padStart(4, "0")}
`;
}

/**
 * Generate template content for investigation guide documents
 */
function generateInvestigationGuideTemplate(planId, title) {
  return `# ${title}

## Investigation Scope
**Objective**: [What are we trying to understand or determine?]
**Context**: [Why is this investigation needed for Plan ${planId
    .toString()
    .padStart(4, "0")}?]

## Code References
### Key Files to Examine
- \`path/to/primary/component.js\` - [Description of relevance]
- \`path/to/related/service.js\` - [What to look for here]
- \`path/to/configuration.json\` - [Configuration aspects]

### Integration Points
- **API Endpoints**: [Relevant endpoints to understand]
- **Database Tables**: [Tables that might be affected]
- **Shared Components**: [Cross-package dependencies]

## Discovery Checklist
### Phase 1: Architecture Understanding
- [ ] Map current data flow and component relationships
- [ ] Identify existing patterns and conventions
- [ ] Document current state and limitations

### Phase 2: Integration Analysis  
- [ ] Assess impact on existing systems
- [ ] Identify potential conflicts or dependencies
- [ ] Evaluate required changes and their scope

### Phase 3: Implementation Planning
- [ ] Define specific implementation approach
- [ ] Identify required utilities or helpers
- [ ] Plan testing and validation strategy

## Architectural Questions
### Core Design Decisions
1. **Question**: [Key architectural decision needed]
   - **Options**: [Option A vs Option B]
   - **Implications**: [Trade-offs and consequences]

2. **Question**: [Integration approach question]  
   - **Current State**: [How it works now]
   - **Proposed Change**: [What needs to change]

### Technical Considerations
- **Performance**: [Performance implications to investigate]
- **Scalability**: [Future growth considerations]
- **Maintainability**: [Long-term maintenance concerns]

## Risk Assessment
### High Risk Areas
- **System Impact**: [Components that could break]
- **Data Integrity**: [Database or state consistency concerns]
- **User Experience**: [Potential UX disruptions]

### Mitigation Strategies
- **Rollback Plan**: [How to undo changes if needed]
- **Testing Strategy**: [How to validate changes safely]
- **Monitoring**: [What to watch during rollout]

## Investigation Timeline
### Phase 1: Initial Analysis (Est: [X hours])
- Code review and pattern analysis
- Architecture mapping and documentation

### Phase 2: Deep Dive (Est: [X hours])  
- Integration point analysis
- Risk assessment and mitigation planning

### Phase 3: Implementation Planning (Est: [X hours])
- Detailed approach definition
- Task breakdown and sequencing

## Findings Summary
**Status**: [In Progress | Completed]
**Last Updated**: [Date]

### Key Discoveries
- **Finding 1**: [Description and implications]
- **Finding 2**: [Description and implications]

### Recommendations
1. **Recommendation**: [Specific guidance for implementation]
   - **Rationale**: [Why this approach is recommended]
   - **Implementation Notes**: [Key considerations for Kiro]

### Next Steps
- [ ] [Specific action item 1]
- [ ] [Specific action item 2]
- [ ] Ready for Kiro implementation: [Yes/No - criteria]

## Related Documents
- Plan ${planId.toString().padStart(4, "0")}: [Plan name and link]
- Related Investigation Guides: [Links to other investigation docs]
- Implementation Specs: [Links to Kiro's spec documents]
`;
}

/**
 * Get the proper creator name for audit trails
 * @param {string} creatorType - 'user', 'claude', 'kiro'
 * @returns {string} - Actual name for created_by field
 */
async function getCreatorName(creatorType) {
  const { default: contextStore } = await import(
    "../../packages/shared-imports/src/stores/contextStore.js"
  );

  switch (creatorType) {
    case "user":
      return contextStore.getParameter("firstName") || "Paul";
    case "claude":
      return "Claude";
    case "kiro":
      return "Kiro";
    default:
      return creatorType; // fallback
  }
}

/**
 * Handle create mode - Plan 0019 enhancement
 * Creates new documents and automatically registers them in database
 */
async function handleCreateMode() {
  console.log(
    "🆕 CREATE MODE - Creating new document with database registration"
  );

  // Validate required arguments for create mode
  if (!options.planId) {
    console.error("Error: --plan-id <id> is required for create mode");
    process.exit(1);
  }

  if (!options.type) {
    console.error(
      "Error: --type=<plan|spec|issue> is required for create mode"
    );
    process.exit(1);
  }

  if (!options.by) {
    console.error("Error: --by=<user|claude|kiro> is required for create mode");
    process.exit(1);
  }

  // Validate type
  if (!["plan", "spec", "issue", "investigation"].includes(options.type)) {
    console.error(
      "Error: --type must be one of: plan, spec, issue, investigation"
    );
    process.exit(1);
  }

  // Validate creator
  if (!["user", "claude", "kiro"].includes(options.by)) {
    console.error("Error: --by must be one of: user, claude, kiro");
    process.exit(1);
  }

  console.log(
    `Creating ${options.type} document for Plan ${options.planId} by ${options.by}`
  );

  if (options.dryRun) {
    console.log(
      "🔍 DRY RUN MODE - Would create document but no files or database changes will be made"
    );
    console.log(
      `Would create: ${options.type} document for Plan ${options.planId}`
    );
    return;
  }

  // Create the document
  const result = await createDocument(options.type, options.planId, options.by);

  if (result.success) {
    console.log("✅ Document creation successful!");
    console.log(`📄 File: ${result.filePath}`);
    console.log(`📝 Title: ${result.title}`);
    console.log(
      `💾 Database: ${result.registered ? "Registered" : "Registration failed"}`
    );

    if (options.verbose) {
      console.log(`🔧 Created by: ${options.by}`);
      console.log(`📊 Plan ID: ${options.planId}`);
      console.log(`📋 Type: ${options.type}`);
    }
  } else {
    console.error("❌ Document creation failed:");
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
}

/**
 * Filter out already registered documents
 * @param {Array} allFiles - All discovered files
 * @param {Array} registeredDocs - Already registered documents
 * @returns {Array} - Unregistered files
 */
function filterUnregistered(allFiles, registeredDocs) {
  const registeredPaths = new Set(registeredDocs.map((doc) => doc.file_path));
  return allFiles.filter((filePath) => !registeredPaths.has(filePath));
}

/**
 * Process files and extract metadata
 * @param {Array} filePaths - Array of file paths to process
 * @returns {Array} - Array of metadata objects
 */
function processFiles(filePaths) {
  const metadataArray = [];

  for (const filePath of filePaths) {
    try {
      const fullPath = path.join(workspaceRoot, filePath);
      const content = fs.readFileSync(fullPath, "utf8");
      const metadata = parseDocumentMetadata(filePath, content);

      metadataArray.push(metadata);

      if (options.verbose) {
        console.log(
          `Processed: ${filePath} -> Plan ${metadata.plan_id}, Title: "${metadata.title}"`
        );
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  }

  return metadataArray;
}

/**
 * Display results summary
 * @param {Object} results - Batch registration results
 * @param {boolean} isDryRun - Whether this was a dry run
 */
function displayResults(results, isDryRun = false) {
  const { summary } = results;

  console.log("\n" + "=".repeat(50));
  console.log(
    isDryRun ? "Document Update Results (DRY RUN)" : "Document Update Results"
  );
  console.log("=".repeat(50));

  if (summary.registered > 0) {
    console.log(
      `✓ ${isDryRun ? "Would register" : "Registered"}: ${
        summary.registered
      } documents`
    );

    if (!isDryRun && options.verbose) {
      results.results.success.forEach((result) => {
        console.log(
          `  - ${result.metadata.title} (${result.metadata.file_path})`
        );
      });
    }
  }

  if (summary.skipped > 0) {
    console.log(`⚠ Skipped: ${summary.skipped} documents (already registered)`);

    if (options.verbose) {
      results.results.skipped.forEach((result) => {
        console.log(
          `  - ${result.metadata.title} (${result.metadata.file_path})`
        );
      });
    }
  }

  if (summary.failed > 0) {
    console.log(`✗ Failed: ${summary.failed} documents`);

    results.results.failed.forEach((result) => {
      console.log(`  - ${result.metadata.title}: ${result.error}`);
    });
  }

  if (summary.total === 0) {
    console.log("No documents found to process.");
  }

  console.log(
    `\nSummary: ${summary.registered} registered, ${summary.skipped} skipped, ${summary.failed} failed`
  );
  console.log("=".repeat(50));
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log("Universal Document Update Script");
    console.log("Enhanced for Plan 0019: Database-First Planning System\n");

    // Handle create mode (Plan 0019 enhancement)
    if (options.create) {
      return await handleCreateMode();
    }

    // Legacy mode: register existing documents
    // Require plan ID
    if (!options.planId) {
      console.error("Error: --plan <id> is required");
      console.log("Use --help for usage information");
      process.exit(1);
    }

    console.log(`Processing documents for Plan ${options.planId}`);

    if (options.dryRun) {
      console.log("🔍 DRY RUN MODE - No database changes will be made\n");
    }

    // Handle specific file mode
    if (options.specificFile) {
      console.log(`Processing specific file: ${options.specificFile}`);

      const filePath = options.specificFile.startsWith(".kiro/")
        ? options.specificFile
        : path
            .relative(workspaceRoot, path.resolve(options.specificFile))
            .replace(/\\/g, "/");

      const metadataArray = processFiles([filePath]);

      if (options.dryRun) {
        console.log("\nWould register:");
        metadataArray.forEach((metadata) => {
          console.log(
            `- Plan ${metadata.plan_id}: ${metadata.title} (${metadata.document_type})`
          );
        });
        return;
      }

      const results = await batchRegisterDocuments(metadataArray);
      displayResults(results, false);
      return;
    }

    // Discover all documents
    console.log("🔍 Discovering documents...");
    const allFiles = discoverDocuments();
    console.log(`Found ${allFiles.length} total markdown files`);

    if (allFiles.length === 0) {
      console.log("No markdown files found in .kiro/specs/ or .kiro/issues/");
      return;
    }

    // Filter to documents for the specified plan
    console.log(`🎯 Filtering documents for Plan ${options.planId}...`);
    const planFiles = filterByPlan(allFiles, options.planId);
    console.log(
      `Found ${planFiles.length} documents for Plan ${options.planId}`
    );

    if (planFiles.length === 0) {
      console.log(`No documents found for Plan ${options.planId}`);
      return;
    }

    // Get already registered documents for this plan
    console.log(
      `📋 Checking registered documents for Plan ${options.planId}...`
    );
    const registeredResult = await getRegisteredDocuments(options.planId);

    if (!registeredResult.success) {
      console.error(
        "Failed to fetch registered documents:",
        registeredResult.error
      );
      process.exit(1);
    }

    const registeredDocs = registeredResult.documents;
    console.log(`Found ${registeredDocs.length} already registered documents`);

    // Filter to unregistered files
    const unregisteredFiles = filterUnregistered(planFiles, registeredDocs);
    console.log(`Found ${unregisteredFiles.length} unregistered documents`);

    if (unregisteredFiles.length === 0) {
      console.log("✅ All documents are already registered!");
      return;
    }

    // Process unregistered files
    console.log("📝 Processing unregistered documents...");
    const metadataArray = processFiles(unregisteredFiles);

    if (options.dryRun) {
      console.log("\nWould register the following documents:");
      metadataArray.forEach((metadata) => {
        console.log(
          `- Plan ${metadata.plan_id}: ${metadata.title} (${metadata.document_type})`
        );
        console.log(`  Path: ${metadata.file_path}`);
      });
      return;
    }

    // Register documents
    console.log("💾 Registering documents...");
    const results = await batchRegisterDocuments(metadataArray, options.planId);

    // Display results
    displayResults(results, false);

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Script execution failed:", error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Handle command line help
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Universal Document Update Script
Enhanced for Plan 0019: Database-First Planning System

MODES:
  1. Legacy Mode: Register existing documents in database
  2. Create Mode: Create new documents with automatic database registration

LEGACY MODE USAGE:
  node claude-plans/tools/document-update.js --plan <id> [options]

  Required:
    --plan <id>        Plan ID to process documents for

  Options:
    --dry-run          Show what would be registered without making changes
    --file <path>      Register specific file only
    --verbose          Show detailed output

  Examples:
    node claude-plans/tools/document-update.js --plan 18
    node claude-plans/tools/document-update.js --plan 18 --dry-run
    node claude-plans/tools/document-update.js --plan 18 --verbose

CREATE MODE USAGE (Plan 0019 Enhancement):
  node claude-plans/tools/document-update.js --create --type=<type> --plan-id=<id> --by=<creator> [options]

  Required:
    --create           Enable create mode
    --type=<type>      Document type: plan, spec, issue
    --plan-id=<id>     Plan ID for the new document
    --by=<creator>     Creator: user, claude, kiro

  Options:
    --dry-run          Show what would be created without making changes
    --verbose          Show detailed output

  Examples:
    node claude-plans/tools/document-update.js --create --type=plan --plan-id=19 --by=user
    node claude-plans/tools/document-update.js --create --type=spec --plan-id=19 --by=kiro
    node claude-plans/tools/document-update.js --create --type=issue --plan-id=19 --by=claude --dry-run

DOMAIN BOUNDARIES (Plan 0019):
  • Plans: Created by users via Architecture Dashboard
  • Specs: Created by Kiro for implementation details
  • Issues: Created by Claude/users for problem tracking

General Options:
  --help, -h         Show this help message
`);
  process.exit(0);
}

// Run the script
main();
