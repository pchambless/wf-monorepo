/**
 * TaskRouter - Core routing logic for task-to-model assignment
 * Parses tasks.md files and determines appropriate model based on complexity
 */

import fs from "fs";
import path from "path";

class TaskRouter {
  constructor() {
    this.modelMapping = {
      "1-simple": "gemini-flash",
      "2-structured": "gemini-flash",
      "3-analytical": "gpt-4o",
      "4-architectural": "claude-sonnet",
      // Legacy support for existing tasks
      low: "1-simple",
      medium: "3-analytical",
      high: "4-architectural",
    };

    this.fallbackComplexity = "3-analytical";
  }

  /**
   * Route a specific task to the appropriate model
   * @param {string} plan - Plan number (e.g., '0040')
   * @param {string} taskId - Task ID (e.g., '2.1')
   * @returns {Object} Routing decision with metadata
   */
  routeTask(plan, taskId) {
    const tasksFilePath = path.join(process.cwd(), ".kiro", plan, "tasks.md");

    if (!fs.existsSync(tasksFilePath)) {
      throw new Error(`Tasks file not found: ${tasksFilePath}`);
    }

    const tasksContent = fs.readFileSync(tasksFilePath, "utf8");
    const task = this.findTask(tasksContent, taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found in plan ${plan}`);
    }

    const routing = this.determineRouting(task);

    return {
      plan,
      taskId,
      taskName: task.name,
      model: routing.model,
      complexity: routing.complexity,
      estimatedTokens: routing.estimatedTokens,
      reasoning: routing.reasoning,
      completed: task.completed,
      requirements: task.requirements,
    };
  }

  /**
   * Find a specific task by ID in the tasks content
   * @param {string} content - Tasks.md file content
   * @param {string} taskId - Task ID to find (e.g., '2.1')
   * @returns {Object|null} Task object or null if not found
   */
  findTask(content, taskId) {
    // Match task patterns like "- [ ] 2.1 Task Name" or "- [x] 2.1 Task Name"
    const taskPattern = new RegExp(
      `- \\[([ x])\\] ${taskId.replace(
        ".",
        "\\."
      )} (.+?)\\n((?:\\s{2,}-.+\\n)*)`,
      "gms"
    );

    const match = taskPattern.exec(content);
    if (!match) return null;

    const [fullMatch, completedFlag, taskName, description] = match;

    // Extract metadata from the description
    const metadata = this.extractMetadata(description);

    return {
      id: taskId,
      name: taskName.trim(),
      description: description.trim(),
      completed: completedFlag === "x",
      ...metadata,
    };
  }

  /**
   * Extract metadata from task description
   * @param {string} description - Task description with metadata
   * @returns {Object} Extracted metadata
   */
  extractMetadata(description) {
    const metadata = {
      requirements: null,
      complexity: null,
      model: null,
      estimatedTokens: null,
    };

    // Extract Requirements
    const reqMatch = description.match(/_Requirements: ([^_\n]+)_/);
    if (reqMatch) {
      metadata.requirements = reqMatch[1].trim();
    }

    // Extract Complexity (support both new 4-tier and legacy 3-tier)
    const complexityMatch = description.match(
      /_Complexity: (1-simple|2-structured|3-analytical|4-architectural|low|medium|high)_/
    );
    if (complexityMatch) {
      metadata.complexity = complexityMatch[1];
    }

    // Extract Model
    const modelMatch = description.match(/_Model: ([^_\n]+)_/);
    if (modelMatch) {
      metadata.model = modelMatch[1].trim();
    }

    // Extract Estimated Tokens
    const tokensMatch = description.match(/_EstimatedTokens: ([^_\n]+)_/);
    if (tokensMatch) {
      metadata.estimatedTokens = tokensMatch[1].trim();
    }

    return metadata;
  }

  /**
   * Determine routing based on task metadata and fallback logic
   * @param {Object} task - Task object with metadata
   * @returns {Object} Routing decision
   */
  determineRouting(task) {
    let complexity = task.complexity;
    let model = task.model;
    let reasoning = "fallback logic";

    // Use explicit model if specified
    if (model) {
      reasoning = "explicit metadata";
      // Infer complexity from model if not specified
      if (!complexity) {
        complexity = this.inferComplexityFromModel(model);
      }
    }
    // Use complexity to determine model
    else if (complexity) {
      // Handle legacy complexity values by mapping them first
      const mappedComplexity = this.modelMapping[complexity] || complexity;
      model = this.getModelForComplexity(mappedComplexity);
      reasoning = "complexity metadata";
    }
    // Fallback: analyze task content
    else {
      complexity = this.inferComplexityFromContent(task);
      model = this.modelMapping[complexity];
      reasoning = "content analysis";
    }

    return {
      complexity: complexity || this.fallbackComplexity,
      model: model || this.modelMapping[this.fallbackComplexity],
      estimatedTokens: task.estimatedTokens || this.estimateTokens(complexity),
      reasoning,
    };
  }

  /**
   * Get model for complexity level
   * @param {string} complexity - Complexity level
   * @returns {string} Model name
   */
  getModelForComplexity(complexity) {
    // Direct mapping for new 4-tier system
    const directMapping = {
      "1-simple": "gemini-flash",
      "2-structured": "gemini-flash",
      "3-analytical": "gpt-4o",
      "4-architectural": "claude-sonnet",
    };

    return directMapping[complexity] || this.modelMapping[complexity];
  }

  /**
   * Infer complexity from model name
   * @param {string} model - Model name
   * @returns {string} Complexity level
   */
  inferComplexityFromModel(model) {
    if (model.includes("gemini-flash")) return "2-structured"; // Default to structured for gemini
    if (model.includes("gpt-4o")) return "3-analytical";
    if (model.includes("claude-sonnet")) return "4-architectural";
    return this.fallbackComplexity;
  }

  /**
   * Infer complexity from task content
   * @param {Object} task - Task object
   * @returns {string} Complexity level
   */
  inferComplexityFromContent(task) {
    const content = (task.name + " " + task.description).toLowerCase();

    // 4-architectural complexity indicators
    const architecturalPatterns = [
      "architecture",
      "integration",
      "cross-app",
      "ui integration",
      "plan context",
      "sophisticated reasoning",
      "system design",
      "error strategies",
    ];

    // 3-analytical complexity indicators
    const analyticalPatterns = [
      "business logic",
      "workflow design",
      "integration mapping",
      "analyzer",
      "context",
      "analysis",
      "reasoning",
    ];

    // 2-structured complexity indicators
    const structuredPatterns = [
      "config generation",
      "validation",
      "structured extraction",
      "pattern-based",
      "configuration",
      "mapping",
    ];

    // 1-simple complexity indicators
    const simplePatterns = [
      "sql parsing",
      "file i/o",
      "basic template",
      "parser",
      "schema",
      "create",
      "setup",
      "migration",
    ];

    if (architecturalPatterns.some((pattern) => content.includes(pattern))) {
      return "4-architectural";
    }

    if (analyticalPatterns.some((pattern) => content.includes(pattern))) {
      return "3-analytical";
    }

    if (structuredPatterns.some((pattern) => content.includes(pattern))) {
      return "2-structured";
    }

    if (simplePatterns.some((pattern) => content.includes(pattern))) {
      return "1-simple";
    }

    return "3-analytical"; // Default to analytical
  }

  /**
   * Estimate token usage based on complexity
   * @param {string} complexity - Complexity level
   * @returns {string} Token estimate range
   */
  estimateTokens(complexity) {
    const estimates = {
      "1-simple": "1500-3000",
      "2-structured": "2000-4000",
      "3-analytical": "3000-8000",
      "4-architectural": "6000-15000",
      // Legacy support
      low: "1500-3000",
      medium: "3000-8000",
      high: "6000-15000",
    };

    return estimates[complexity] || estimates["3-analytical"];
  }

  /**
   * Get all tasks from a plan
   * @param {string} plan - Plan number
   * @returns {Array} Array of all tasks
   */
  getAllTasks(plan) {
    const tasksFilePath = path.join(process.cwd(), ".kiro", plan, "tasks.md");

    if (!fs.existsSync(tasksFilePath)) {
      throw new Error(`Tasks file not found: ${tasksFilePath}`);
    }

    const content = fs.readFileSync(tasksFilePath, "utf8");
    const tasks = [];

    // Find all task patterns
    const taskPattern =
      /- \[([ x])\] (\d+(?:\.\d+)?) (.+?)\n((?:\s{2,}- .+\n)*)/g;
    let match;

    while ((match = taskPattern.exec(content)) !== null) {
      const [, completedFlag, taskId, taskName, description] = match;
      const metadata = this.extractMetadata(description);

      tasks.push({
        id: taskId,
        name: taskName.trim(),
        description: description.trim(),
        completed: completedFlag === "x",
        ...metadata,
      });
    }

    return tasks;
  }

  /**
   * Get next available task by complexity
   * @param {string} plan - Plan number
   * @param {string} complexity - Desired complexity level
   * @returns {Object|null} Next available task or null
   */
  getNextTask(plan, complexity = null) {
    const tasks = this.getAllTasks(plan);

    return tasks.find((task) => {
      if (task.completed) return false;
      if (!complexity) return true;

      const routing = this.determineRouting(task);
      return routing.complexity === complexity;
    });
  }
}

export default TaskRouter;
