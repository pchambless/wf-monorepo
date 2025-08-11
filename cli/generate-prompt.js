#!/usr/bin/env node

/**
 * Generate comprehensive prompts for AI model execution
 * Usage: ./cli/generate-prompt.js 0040 2.1
 */

import TaskRouter from "./TaskRouter.js";
import fs from "fs";
import path from "path";

class PromptGenerator {
  constructor() {
    this.router = new TaskRouter();
  }

  /**
   * Generate complete prompt for task execution
   */
  async generatePrompt(plan, taskId) {
    const routing = await this.router.routeTask(plan, taskId);
    const taskDescription = this.getTaskDescription(routing);
    const toolset = this.loadToolset(routing.complexity, routing.taskName + ' ' + taskDescription);
    const context = this.loadMonorepoContext(plan);

    return this.formatPrompt(routing, toolset, context);
  }

  /**
   * Load appropriate toolset based on complexity and task content
   */
  loadToolset(complexity, taskContent) {
    // Map complexity levels to toolset directory names
    const complexityMap = {
      'low': '1-simple',
      'medium': '2-structured', 
      'high': '4-architectural',
      '1-simple': '1-simple',
      '2-structured': '2-structured',
      '3-analytical': '3-analytical',
      '4-architectural': '4-architectural'
    };
    
    const toolsetDir = complexityMap[complexity] || complexity;
    const toolsetPath = path.join(process.cwd(), 'cli/toolsets', toolsetDir);

    if (!fs.existsSync(toolsetPath)) {
      return {
        available: false,
        reason: `Toolset not found: ${toolsetPath}`
      };
    }

    try {
      const patternsPath = path.join(toolsetPath, 'patterns.ts');
      const patterns = fs.existsSync(patternsPath) ? fs.readFileSync(patternsPath, 'utf8') : '';

      // Extract relevant patterns based on task content
      const relevantPatterns = this.filterRelevantPatterns(patterns, taskContent);

      return {
        available: true,
        complexity,
        relevantPatterns,
        path: toolsetPath,
        totalPatterns: this.countPatterns(patterns),
        includedPatterns: relevantPatterns.length
      };
    } catch (error) {
      return {
        available: false,
        reason: `Error loading toolset: ${error.message}`
      };
    }
  }

  /**
   * Filter patterns based on task content analysis
   */
  filterRelevantPatterns(patternsContent, taskContent) {
    const taskLower = taskContent.toLowerCase();
    const patterns = [];

    // SQL-related patterns
    if (taskLower.includes('sql') || taskLower.includes('database') || taskLower.includes('table') || taskLower.includes('schema')) {
      patterns.push({
        name: 'SQL Table Definition',
        code: this.extractPattern(patternsContent, 'sqlTableDefinition'),
        usage: 'Extract CREATE TABLE statements and structure'
      });
      patterns.push({
        name: 'SQL Column Definition',
        code: this.extractPattern(patternsContent, 'sqlColumnDefinition'),
        usage: 'Parse column types, constraints, defaults'
      });
    }

    // Template patterns
    if (taskLower.includes('template') || taskLower.includes('generate') || taskLower.includes('zone')) {
      patterns.push({
        name: 'Zone Markers',
        code: this.extractPattern(patternsContent, 'zoneMarkers'),
        usage: 'Find auto-generated vs manual zones in templates'
      });
    }

    // Validation patterns
    if (taskLower.includes('validate') || taskLower.includes('check') || taskLower.includes('test')) {
      patterns.push({
        name: 'Syntax Check',
        code: this.extractPattern(patternsContent, 'syntaxCheck'),
        usage: 'Validate file syntax and structure'
      });
    }

    // If no specific patterns found, include basic operations
    if (patterns.length === 0) {
      patterns.push({
        name: 'File Operations',
        code: 'Basic find, extract, generate, validate operations available',
        usage: 'Standard file processing patterns'
      });
    }

    return patterns;
  }

  /**
   * Extract specific pattern from patterns file
   */
  extractPattern(content, patternName) {
    const regex = new RegExp(`${patternName}:\\s*\\{[\\s\\S]*?\\}`, 'm');
    const match = content.match(regex);
    return match ? match[0] : `// ${patternName} pattern available`;
  }

  /**
   * Count total patterns in file
   */
  countPatterns(content) {
    const matches = content.match(/\w+:\s*\{/g);
    return matches ? matches.length : 0;
  }

  /**
   * Load relevant monorepo context
   */
  loadMonorepoContext(plan) {
    const context = {
      plan,
      claudeMd: this.loadFile('CLAUDE.md'),
      steeringYaml: this.loadFile('.kiro/steering.yaml'),
      planDesign: this.loadFile(`.kiro/${plan}/design.md`),
      planRequirements: this.loadFile(`.kiro/${plan}/requirements.md`),
      roadmap: this.loadFile(`.kiro/${plan}/roadmap.md`),
      packageJson: this.loadFile('package.json')
    };

    // Add relevant paths from steering.yaml
    context.frequentPaths = this.extractFrequentPaths();

    return context;
  }

  /**
   * Load file if it exists
   */
  loadFile(relativePath) {
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      try {
        return fs.readFileSync(fullPath, 'utf8');
      } catch (error) {
        return `Error reading ${relativePath}: ${error.message}`;
      }
    }

    return null;
  }

  /**
   * Extract frequent paths from steering.yaml for context
   */
  extractFrequentPaths() {
    const steering = this.loadFile('.kiro/steering.yaml');
    if (!steering) return [];

    // Extract common paths mentioned in steering.yaml
    const pathPatterns = [
      /packages\/shared-imports\/src\/[^\s]*/g,
      /apps\/wf-[^\s]*/g,
      /\.kiro\/[^\s]*/g
    ];

    const paths = [];
    pathPatterns.forEach(pattern => {
      const matches = steering.match(pattern) || [];
      paths.push(...matches);
    });

    return [...new Set(paths)].slice(0, 10); // Unique, limit to 10
  }

  /**
   * Format the complete prompt
   */
  formatPrompt(routing, toolset, context) {
    const taskDesc = this.getTaskDescription(routing);

    const prompt = `# Task ${routing.taskId}: ${routing.taskName}
**Model**: ${routing.model} (${routing.estimatedTokens} tokens)
**Complexity**: ${routing.complexity.charAt(0).toUpperCase() + routing.complexity.slice(1)}

## Task Description
${taskDesc}

### Expected Interfaces:
\`\`\`typescript
interface TableSchema {
    name: string;
    fields: DatabaseField[];
}

interface DatabaseField {
    name: string;
    type: string;
    constraints?: string[];
    default?: string;
}
\`\`\`

## Available Tools
**Location**: \`/cli/toolsets/${routing.complexity}-complexity\`

${toolset.available ? this.formatStreamlinedToolset(toolset) : `⚠️ Toolset not available: ${toolset.reason}`}

## Context
**Project**: WhatsFresh monorepo (React + Node.js)
**Location**: \`/sql/database/api_wf/tables/\` for SQL files
**Dependencies**: ${routing.requirements || 'None'}

## Success Criteria
- ✅ Implement parser according to task description
- ✅ Use provided SQL patterns for extraction
- ✅ Create TypeScript interfaces as specified
- ✅ Test with sample SQL files

---
**Ready to implement**: Proceed with implementation using available tools.`;

    return prompt;
  }

  /**
   * Format toolset in streamlined format
   */
  formatStreamlinedToolset(toolset) {
    if (toolset.relevantPatterns.length === 0) {
      return `### Available Operations:
- find, extract, generate, validate
- See full toolset at location above`;
    }

    return toolset.relevantPatterns.map(pattern => `### ${pattern.name}:
\`\`\`typescript
${this.cleanPatternCode(pattern.code)}
\`\`\`
`).join('\n');
  }

  /**
   * Clean up pattern code for concise display
   */
  cleanPatternCode(code) {
    // Remove implementation details and format concisely
    return code
      .replace(/\s*as const/g, '') // Remove 'as const'
      .replace(/\s*operation:\s*["']([^"']+)["'][,\s]*/g, 'operation: "$1",\n    ')
      .replace(/\s*tools:\s*\[[^\]]+\][,\s]*/g, '') // Remove tools array
      .replace(/\s*description:\s*["'][^"']*["'][,\s]*/g, '') // Remove description
      .trim();
  }

  /**
   * Get detailed task description from tasks.md
   */
  getTaskDescription(routing) {
    try {
      const tasksPath = path.join(process.cwd(), '.kiro', routing.plan, 'tasks.md');
      const content = fs.readFileSync(tasksPath, 'utf8').replace(/\r\n/g, '\n');

      // Find the full task with description
      const taskPattern = new RegExp(
        `- \\[([ x])\\] ${routing.taskId.replace('.', '\\.')} (.+?)\\n\\n((?:\\s{2,}[^\\n]+\\n)*)`,
        'gms'
      );

      const match = taskPattern.exec(content);
      if (match) {
        return match[3].trim(); // Return the description part
      }

      return routing.taskName; // Fallback to just the name
    } catch (error) {
      return `${routing.taskName}\n(Error loading full description: ${error.message})`;
    }
  }

  /**
   * Format toolset information for prompt
   */
  formatToolset(toolset) {
    if (!toolset.available) {
      return `⚠️ Toolset not available: ${toolset.reason}`;
    }

    return `### ${toolset.complexity.toUpperCase()} Complexity Toolset

**Location**: \`${toolset.path}\` (${toolset.includedPatterns}/${toolset.totalPatterns} patterns included)

#### Relevant Patterns for this Task:
${toolset.relevantPatterns.map(pattern => `
**${pattern.name}**
\`\`\`typescript
${pattern.code}
\`\`\`
*Usage*: ${pattern.usage}
`).join('\n')}

**Note**: Only task-relevant patterns included. Full toolset available at location above.`;
  }

  /**
   * Get basic project structure
   */
  getProjectStructure() {
    return `wf-monorepo-new/
├── apps/
│   ├── wf-client/          # React frontend
│   ├── wf-server/          # Node.js backend  
│   └── wf-plan-management/ # Plan management app
├── packages/
│   └── shared-imports/     # Shared utilities & components
├── cli/                    # Task routing & toolsets
├── .kiro/                  # AI planning & coordination
└── sql/                    # Database schemas & migrations`;
  }

  /**
   * Extract key patterns from steering.yaml
   */
  extractKeyPatterns(steeringContent) {
    const lines = steeringContent.split('\n');
    const patterns = lines.filter(line =>
      line.includes('established_patterns') ||
      line.includes('- "') ||
      line.includes('skip_investigation') ||
      line.includes('deep_investigation')
    ).slice(0, 15); // Limit to most important patterns

    return patterns.join('\n');
  }

  /**
   * Truncate content to fit in prompt
   */
  truncateContent(content, maxLength) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '\n... (truncated)';
  }
}

async function main() {
  const [plan, taskId] = process.argv.slice(2);

  if (!plan || !taskId) {
    console.error('\nUsage: generate-prompt <plan> <taskId>');
    console.error('Example: generate-prompt 0040 2.1\n');
    process.exit(1);
  }

  try {
    const generator = new PromptGenerator();
    const prompt = await generator.generatePrompt(plan, taskId);

    console.log(prompt);

    console.error(`\n📋 Prompt ready to copy-paste to ${(new TaskRouter()).routeTask(plan, taskId).model}!`);
    console.error(`\n💡 Tip: Open https://gemini.google.com/app in your browser to start a new chat`);

  } catch (error) {
    console.error('\nError generating prompt:', error.message);
    process.exit(1);
  }
}

main();