/**
 * Medium Complexity Tool Set Patterns
 * For use with gpt-4o model (3000-8000 tokens)
 */

export interface BasePattern {
    operation: string;
    description: string;
    tools: string[];
}

export interface WorkflowGenerator extends BasePattern {
    operation: "generate_workflow";
    template: string;
    variables: string[];
    validation: string[];
}

export interface ConfigGenerator extends BasePattern {
    operation: "generate_config";
    schema: object;
    defaults: object;
}

export interface BusinessLogicExtractor extends BasePattern {
    operation: "extract_logic";
    patterns: {
        find: string | RegExp;
        transform: string;
        output: string;
    }[];
}

export interface IntegrationAnalyzer extends BasePattern {
    operation: "analyze_integration";
    dependencies: string[];
    interfaces: string[];
}

export type Pattern = WorkflowGenerator | ConfigGenerator | BusinessLogicExtractor | IntegrationAnalyzer;

// Common patterns for medium complexity tasks
export const commonPatterns = {
    // Workflow Patterns
    workflowConfiguration: {
        operation: "generate_workflow" as const,
        tools: ["template_engine", "validation"],
        template: `
export const {{workflowName}}Config = {
    operations: [{{operations}}],
    validation: {{validation}},
    errorHandling: {{errorHandling}},
    dependencies: [{{dependencies}}]
};`,
        variables: ["workflowName", "operations", "validation", "errorHandling", "dependencies"],
        validation: ["syntax_check", "type_validation", "dependency_check"],
        description: "Generate workflow configuration objects"
    },

    displayConfiguration: {
        operation: "generate_config" as const,
        tools: ["schema_validator", "ui_generator"],
        schema: {
            fieldGroups: "array",
            layout: "object", 
            validation: "object",
            events: "array"
        },
        defaults: {
            layout: { columns: 1, spacing: "medium" },
            validation: { required: true, showErrors: true }
        },
        description: "Generate display configuration for UI components"
    },

    // Business Logic Patterns
    eventTypeAnalysis: {
        operation: "extract_logic" as const,
        tools: ["ast_parser", "pattern_matcher"],
        patterns: [{
            find: /export\s+const\s+(\w+)\s*=\s*\{[\s\S]*?eventType:\s*['"](\w+)['"][\s\S]*?\}/g,
            transform: "extractEventMetadata",
            output: "EventTypeMapping"
        }],
        description: "Extract business logic from eventType definitions"
    },

    crudOperationMapping: {
        operation: "extract_logic" as const,
        tools: ["code_analyzer", "dependency_mapper"],
        patterns: [{
            find: /(\w+):\s*\{[\s\S]*?operation:\s*['"](\w+)['"][\s\S]*?table:\s*['"](\w+)['"][\s\S]*?\}/g,
            transform: "mapCrudOperations",
            output: "CRUDMapping"
        }],
        description: "Map CRUD operations to database operations"
    },

    // Integration Patterns
    dependencyAnalysis: {
        operation: "analyze_integration" as const,
        tools: ["module_resolver", "import_analyzer"],
        dependencies: ["shared-imports", "api-endpoints", "database-schemas"],
        interfaces: ["EventType", "WorkflowConfig", "DisplayConfig"],
        description: "Analyze cross-module dependencies and interfaces"
    },

    // Template Processing Patterns
    templateMerging: {
        operation: "generate_workflow" as const,
        tools: ["template_processor", "zone_detector"],
        template: `
// BEGIN-GENERATED-{{zone}}
{{generatedContent}}
// END-GENERATED-{{zone}}

// BEGIN-MANUAL-{{zone}}
{{existingManualContent}}
// END-MANUAL-{{zone}}`,
        variables: ["zone", "generatedContent", "existingManualContent"],
        validation: ["zone_integrity", "merge_conflicts"],
        description: "Merge generated content with existing manual zones"
    },

    // Validation Patterns
    configValidation: {
        operation: "generate_config" as const,
        tools: ["json_schema", "type_checker"],
        schema: {
            required: ["name", "type", "validation"],
            properties: {
                name: { type: "string", pattern: "^[a-zA-Z][a-zA-Z0-9]*$" },
                type: { type: "string", enum: ["string", "number", "boolean", "object", "array"] },
                validation: { type: "object" }
            }
        },
        defaults: { validation: { required: false } },
        description: "Validate configuration structure and types"
    }
};