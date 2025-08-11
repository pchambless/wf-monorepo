/**
 * Low Complexity Tool Set Patterns
 * For use with gemini-flash model (1500-4000 tokens)
 */

export interface BasePattern {
    operation: string;
    description: string;
    tools: string[];
}

export interface FileFinder extends BasePattern {
    operation: "find";
    pattern: string;
}

export interface ContentExtractor extends BasePattern {
    operation: "extract";
    patterns: {
        find: string | RegExp;
        capture: string[];
    }[];
}

export interface FileGenerator extends BasePattern {
    operation: "generate";
    template: string;
    variables: string[];
}

export interface Validator extends BasePattern {
    operation: "validate";
    checks: {
        type: "syntax" | "structure" | "content";
        pattern: string | RegExp;
    }[];
}

export type Pattern = FileFinder | ContentExtractor | FileGenerator | Validator;

// Common patterns for reuse
export const commonPatterns = {
    // SQL Patterns
    sqlTableDefinition: {
        operation: "extract" as const,
        tools: ["grep_search"],
        patterns: [{
            find: "CREATE TABLE `(\\w+)` \\((.*?)\\)\\s*(?:COLLATE='([^']+)')?\\s*(?:ENGINE=(\\w+))?\\s*(?:AUTO_INCREMENT=(\\d+))?",
            capture: ["tableName", "tableContent", "collate", "engine", "autoIncrement"]
        }],
        description: "Extract SQL table definitions with options"
    },

    sqlColumnDefinition: {
        operation: "extract" as const,
        tools: ["grep_search"],
        patterns: [{
            find: "`(\\w+)`\\s+([\\w()]+)(?:\\((\\d+)\\))?\\s*((?:NOT\\s+NULL|NULL))?(?:\\s+DEFAULT\\s+([^,\\s]+))?(?:\\s+COMMENT\\s+'([^']+)')?(?:\\s+AS\\s+\\((.+?)\\)\\s+(STORED|VIRTUAL))?",
            capture: ["name", "type", "length", "nullable", "default", "comment", "generatedExpr", "generatedType"]
        }],
        description: "Extract detailed column definitions"
    },

    sqlIndexDefinition: {
        operation: "extract" as const,
        tools: ["grep_search"],
        patterns: [{
            find: "(?:INDEX|KEY)\\s+`([^`]+)`\\s+\\(([^)]+)\\)(?:\\s+USING\\s+(\\w+))?",
            capture: ["indexName", "columns", "type"]
        }],
        description: "Extract index definitions"
    },

    sqlForeignKeyDefinition: {
        operation: "extract" as const,
        tools: ["grep_search"],
        patterns: [{
            find: "CONSTRAINT\\s+`([^`]+)`\\s+FOREIGN\\s+KEY\\s+\\(`([^`]+)`\\)\\s+REFERENCES\\s+`([^`]+)`\\s+\\(`([^`]+)`\\)(?:\\s+ON\\s+DELETE\\s+(\\w+(?:\\s+\\w+)?))?(?:\\s+ON\\s+UPDATE\\s+(\\w+(?:\\s+\\w+)?))?",
            capture: ["name", "column", "refTable", "refColumn", "onDelete", "onUpdate"]
        }],
        description: "Extract foreign key definitions"
    },

    // Template Patterns
    zoneMarkers: {
        operation: "extract" as const,
        tools: ["grep_search"],
        patterns: [{
            find: "// BEGIN-GENERATED(.*?)// END-GENERATED",
            capture: ["content"]
        }],
        description: "Find template zone markers"
    },

    // Validation Patterns
    syntaxCheck: {
        operation: "validate" as const,
        tools: ["get_errors"],
        checks: [{
            type: "syntax",
            pattern: "error|warning"
        }],
        description: "Check for syntax errors"
    }
};
