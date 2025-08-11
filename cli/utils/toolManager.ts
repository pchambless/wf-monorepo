/**
 * Tool Manager for CLI tools
 * Manages VS Code tool functions for the low-complexity tool set
 */

type ToolFunction = (...args: any[]) => Promise<any>;

interface ToolRegistry {
    [key: string]: ToolFunction;
}

const toolRegistry: ToolRegistry = {};

export function registerTool(name: string, fn: ToolFunction) {
    toolRegistry[name] = fn;
}

export function getToolFunction(name: string): ToolFunction | undefined {
    return toolRegistry[name];
}

export function clearToolRegistry() {
    Object.keys(toolRegistry).forEach(key => delete toolRegistry[key]);
}
