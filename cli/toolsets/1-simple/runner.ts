/**
 * Tool Set Runner
 * Executes tool patterns in a low-complexity environment
 */

import { Pattern as ImportedPattern } from './patterns';

type Pattern = ImportedPattern & {
    operation: string;
};
import { getToolFunction } from '../../utils/toolManager';

interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}

export class ToolRunner {
    async executePattern(pattern: Pattern, context: any = {}): Promise<ToolResult> {
        try {
            if (!('operation' in pattern)) {
                throw new Error('Pattern object missing "operation" property');
            }
            switch (pattern.operation) {
                case 'find':
                    return await this.executeFindPattern(pattern, context);
                case 'extract':
                    return await this.executeExtractPattern(pattern, context);
                case 'generate':
                    return await this.executeGeneratePattern(pattern, context);
                case 'validate':
                    return await this.executeValidatePattern(pattern, context);
                default:
                    // Type guard to satisfy TypeScript
                    const op: string = (pattern as Pattern).operation;
                    throw new Error(`Unknown pattern operation: ${op}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    private async executeFindPattern(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'find') return { success: false, error: 'Invalid pattern type' };

        // Get search tool function
        const search = getToolFunction('file_search');
        if (!search) return { success: false, error: 'Search tool not available' };

        // Execute search
        try {
            const results = await search({ query: pattern.pattern });
            return {
                success: true,
                data: results
            };
        } catch (error) {
            return {
                success: false,
                error: `Search failed: ${error.message}`
            };
        }
    }

    private async executeExtractPattern(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'extract') return { success: false, error: 'Invalid pattern type' };

        // Get grep tool function
        const grep = getToolFunction('grep_search');
        if (!grep) return { success: false, error: 'Grep tool not available' };

        // Execute extraction for each pattern
        try {
            const results = await Promise.all(
                pattern.patterns.map(async p => {
                    const grepResult = await grep({
                        query: p.find.toString(),
                        isRegexp: true
                    });
                    return {
                        pattern: p,
                        matches: grepResult
                    };
                })
            );

            return {
                success: true,
                data: results
            };
        } catch (error) {
            return {
                success: false,
                error: `Extraction failed: ${error.message}`
            };
        }
    }

    private async executeGeneratePattern(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'generate') return { success: false, error: 'Invalid pattern type' };

        // Get file creation tool function
        const createFile = getToolFunction('create_file');
        if (!createFile) return { success: false, error: 'File creation tool not available' };

        try {
            // Replace variables in template
            let content = pattern.template;
            for (const variable of pattern.variables) {
                const value = context[variable];
                if (!value) {
                    return {
                        success: false,
                        error: `Missing variable value: ${variable}`
                    };
                }
                content = content.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
            }

            // Create file with generated content
            if (!context.filePath) {
                return {
                    success: false,
                    error: 'Missing filePath in context'
                };
            }

            await createFile({
                filePath: context.filePath,
                content
            });

            return {
                success: true,
                data: { filePath: context.filePath }
            };
        } catch (error) {
            return {
                success: false,
                error: `Generation failed: ${error.message}`
            };
        }
    }

    private async executeValidatePattern(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'validate') return { success: false, error: 'Invalid pattern type' };

        // Get validation tools
        const getErrors = getToolFunction('get_errors');
        if (!getErrors) return { success: false, error: 'Error checking tool not available' };

        try {
            const results: Array<{ type: string; valid: boolean; errors?: any; matches?: any }> = [];

            for (const check of pattern.checks) {
                switch (check.type) {
                    case 'syntax':
                        if (!context.filePath) {
                            return {
                                success: false,
                                error: 'Missing filePath in context'
                            };
                        }
                        const errors = await getErrors({ filePaths: [context.filePath] });
                        results.push({
                            type: check.type,
                            valid: errors.length === 0,
                            errors
                        });
                        break;

                    case 'structure':
                    case 'content':
                        // Use grep_search for pattern validation
                        const grep = getToolFunction('grep_search');
                        if (!grep) return { success: false, error: 'Grep tool not available' };

                        const matches = await grep({
                            query: check.pattern.toString(),
                            isRegexp: true
                        });

                        results.push({
                            type: check.type,
                            valid: matches.length > 0,
                            matches
                        });
                        break;
                }
            }

            return {
                success: true,
                data: results
            };
        } catch (error) {
            return {
                success: false,
                error: `Validation failed: ${error.message}`
            };
        }
    }
}
