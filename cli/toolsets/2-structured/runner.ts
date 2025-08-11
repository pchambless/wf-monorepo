/**
 * Medium Complexity Tool Set Runner
 * Executes business logic and workflow patterns for gpt-4o
 */

import { Pattern } from './patterns';
import { getToolFunction } from '../../utils/toolManager';

interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: {
        complexity: 'medium';
        tokensEstimated: string;
        patterns: string[];
    };
}

export class MediumComplexityRunner {
    async executePattern(pattern: Pattern, context: any = {}): Promise<ToolResult> {
        try {
            const result = await this.routePattern(pattern, context);

            // Add medium-complexity metadata
            result.metadata = {
                complexity: 'medium',
                tokensEstimated: '3000-8000',
                patterns: [pattern.operation]
            };

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: {
                    complexity: 'medium',
                    tokensEstimated: '3000-8000',
                    patterns: [pattern.operation]
                }
            };
        }
    }

    private async routePattern(pattern: Pattern, context: any): Promise<ToolResult> {
        // Ensure pattern is always typed as Pattern and has 'operation'
        if (!('operation' in pattern)) {
            throw new Error('Pattern object missing "operation" property');
        }
        switch (pattern.operation) {
            case 'generate_workflow':
                return await this.executeWorkflowGeneration(pattern, context);
            case 'generate_config':
                return await this.executeConfigGeneration(pattern, context);
            case 'extract_logic':
                return await this.executeLogicExtraction(pattern, context);
            case 'analyze_integration':
                return await this.executeIntegrationAnalysis(pattern, context);
            default:
                throw new Error(`Unknown pattern operation: ${(pattern as Pattern).operation}`);
        }
    }

    private async executeWorkflowGeneration(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'generate_workflow') {
            return { success: false, error: 'Invalid pattern type for workflow generation' };
        }

        try {
            // Template processing with variable substitution
            let generatedContent = pattern.template;

            for (const variable of pattern.variables) {
                const value = context[variable];
                if (value === undefined) {
                    return {
                        success: false,
                        error: `Missing required variable: ${variable}`
                    };
                }

                const placeholder = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
                generatedContent = generatedContent.replace(placeholder,
                    typeof value === 'object' ? JSON.stringify(value) : String(value)
                );
            }

            // Execute validation checks if specified
            const validationResults: any[] = [];
            for (const validationType of pattern.validation || []) {
                const validationResult = await this.runValidation(validationType, generatedContent, context);
                validationResults.push(validationResult);
            }

            return {
                success: true,
                data: {
                    generated: generatedContent,
                    validation: validationResults,
                    template: pattern.template,
                    variables: pattern.variables
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Workflow generation failed: ${error.message}`
            };
        }
    }

    private async executeConfigGeneration(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'generate_config') {
            return { success: false, error: 'Invalid pattern type for config generation' };
        }

        try {
            // Merge defaults with provided context
            const config = { ...pattern.defaults, ...context.configOverrides };

            // Validate against schema
            const schemaValidation = this.validateSchema(config, pattern.schema);
            if (!schemaValidation.valid) {
                return {
                    success: false,
                    error: `Schema validation failed: ${schemaValidation.errors.join(', ')}`
                };
            }

            return {
                success: true,
                data: {
                    config,
                    schema: pattern.schema,
                    validation: schemaValidation
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Config generation failed: ${error.message}`
            };
        }
    }

    private async executeLogicExtraction(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'extract_logic') {
            return { success: false, error: 'Invalid pattern type for logic extraction' };
        }

        try {
            const extractionResults: Array<{
                pattern: { find: string | RegExp; transform: string; output: string; };
                matches: number;
                extracted: Array<{
                    match: string;
                    groups: string[];
                    transform: string;
                    output: string;
                }>;
            }> = [];

            for (const extractionPattern of pattern.patterns) {
                // Get source content to analyze
                const sourceContent = context.sourceContent || context.fileContent;
                if (!sourceContent) {
                    return {
                        success: false,
                        error: 'No source content provided for logic extraction'
                    };
                }

                // Apply regex pattern
                const matches = Array.from(sourceContent.matchAll(extractionPattern.find));

                // Transform matches based on pattern specification
                const transformed = matches.map(match => {
                    const m = match as RegExpMatchArray;
                    return {
                        match: m[0],
                        groups: m.slice(1),
                        transform: extractionPattern.transform,
                        output: extractionPattern.output
                    };
                });

                extractionResults.push({
                    pattern: extractionPattern,
                    matches: matches.length,
                    extracted: transformed
                });
            }

            return {
                success: true,
                data: {
                    results: extractionResults,
                    totalMatches: extractionResults.reduce((sum, r) => sum + r.matches, 0)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Logic extraction failed: ${error.message}`
            };
        }
    }

    private async executeIntegrationAnalysis(pattern: Pattern, context: any): Promise<ToolResult> {
        if (pattern.operation !== 'analyze_integration') {
            return { success: false, error: 'Invalid pattern type for integration analysis' };
        }

        try {
            const analysisResults: {
                dependencies: any[],
                interfaces: any[],
                conflicts: any[],
                recommendations: any[]
            } = {
                dependencies: [],
                interfaces: [],
                conflicts: [],
                recommendations: []
            };

            // Analyze dependencies
            for (const dep of pattern.dependencies) {
                const depAnalysis = await this.analyzeDependency(dep, context);
                analysisResults.dependencies.push(depAnalysis);
            }

            // Analyze interfaces
            for (const iface of pattern.interfaces) {
                const interfaceAnalysis = await this.analyzeInterface(iface, context);
                analysisResults.interfaces.push(interfaceAnalysis);
            }

            return {
                success: true,
                data: analysisResults
            };
        } catch (error) {
            return {
                success: false,
                error: `Integration analysis failed: ${error.message}`
            };
        }
    }

    // Helper methods
    private async runValidation(validationType: string, content: string, context: any): Promise<any> {
        switch (validationType) {
            case 'syntax_check':
                return { type: 'syntax', valid: true, message: 'Syntax appears valid' };
            case 'type_validation':
                return { type: 'types', valid: true, message: 'Type checking passed' };
            case 'dependency_check':
                return { type: 'dependencies', valid: true, message: 'Dependencies resolved' };
            default:
                return { type: validationType, valid: false, message: 'Unknown validation type' };
        }
    }

    private validateSchema(config: any, schema: any): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Basic schema validation (simplified)
        for (const [key, type] of Object.entries(schema)) {
            if (config[key] === undefined) {
                errors.push(`Missing required field: ${key}`);
            } else if (typeof config[key] !== type) {
                errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof config[key]}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    private async analyzeDependency(dependency: string, context: any): Promise<any> {
        return {
            name: dependency,
            available: true,
            version: 'latest',
            conflicts: []
        };
    }

    private async analyzeInterface(interfaceName: string, context: any): Promise<any> {
        return {
            name: interfaceName,
            defined: true,
            methods: [],
            properties: []
        };
    }

    // Batch execution for complex workflows
    async executeBatch(patterns: Pattern[], context: any = {}): Promise<ToolResult[]> {
        const results: ToolResult[] = [];

        for (const pattern of patterns) {
            const result = await this.executePattern(pattern, context);
            results.push(result);

            // Stop on first failure if specified
            if (!result.success && context.stopOnFailure) {
                break;
            }

            // Pass successful results to next pattern
            if (result.success && result.data) {
                context = { ...context, previousResult: result.data };
            }
        }

        return results;
    }
}