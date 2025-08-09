/**
 * Generate execution roadmap for plan tasks
 * Usage: node .kiro/workflows/createRoadmap.js 0040
 */

const fs = require('fs');
const path = require('path');

class RoadmapGenerator {
  constructor(planId) {
    this.planId = planId;
    this.planPath = path.join(process.cwd(), '.kiro', planId);
    this.tasksFile = path.join(this.planPath, 'tasks.md');
    this.templateFile = path.join(process.cwd(), '.kiro/templates/roadmap-template.md');
    
    this.modelMapping = {
      low: 'gemini-flash',
      medium: 'gpt-4o', 
      high: 'claude-sonnet'
    };

    this.tokenEstimates = {
      low: '1500-4000',
      medium: '3000-8000',
      high: '6000-15000'
    };
  }

  /**
   * Parse tasks.md file and extract task metadata
   */
  parseTasks() {
    if (!fs.existsSync(this.tasksFile)) {
      throw new Error(`Tasks file not found: ${this.tasksFile}`);
    }

    const content = fs.readFileSync(this.tasksFile, 'utf8');
    const tasks = [];

    // Enhanced regex to capture task structure
    const taskPattern = /- \[([ x])\] (\d+(?:\.\d+)?) (.+?)\n((?:\s{2,}- .+\n)*)/g;
    let match;

    while ((match = taskPattern.exec(content)) !== null) {
      const [, completedFlag, taskId, taskName, description] = match;
      const metadata = this.extractMetadata(description);
      
      tasks.push({
        id: taskId,
        name: taskName.trim(),
        description: description.trim(),
        completed: completedFlag === 'x',
        complexity: metadata.complexity || this.inferComplexity(taskName + ' ' + description),
        requirements: metadata.requirements,
        dependencies: this.parseDependencies(metadata.requirements),
        blocks: [], // Will be calculated
        model: metadata.model || this.modelMapping[metadata.complexity || 'medium'],
        tokenEstimate: metadata.estimatedTokens || this.tokenEstimates[metadata.complexity || 'medium']
      });
    }

    // Calculate blocking relationships
    this.calculateBlocks(tasks);
    
    return tasks;
  }

  /**
   * Extract metadata from task description
   */
  extractMetadata(description) {
    const metadata = {};
    
    const complexityMatch = description.match(/_Complexity: (low|medium|high)_/);
    if (complexityMatch) metadata.complexity = complexityMatch[1];
    
    const requirementsMatch = description.match(/_Requirements: ([^_\n]+)_/);
    if (requirementsMatch) metadata.requirements = requirementsMatch[1].trim();
    
    const modelMatch = description.match(/_Model: ([^_\n]+)_/);
    if (modelMatch) metadata.model = modelMatch[1].trim();
    
    const tokensMatch = description.match(/_EstimatedTokens: ([^_\n]+)_/);
    if (tokensMatch) metadata.estimatedTokens = tokensMatch[1].trim();
    
    return metadata;
  }

  /**
   * Infer complexity from task content if not specified
   */
  inferComplexity(content) {
    const lowerContent = content.toLowerCase();
    
    const highPatterns = ['architecture', 'integration', 'cross-app', 'ui integration', 'context', 'analyzer'];
    const lowPatterns = ['sql', 'database', 'template', 'parser', 'schema', 'file'];
    
    if (highPatterns.some(pattern => lowerContent.includes(pattern))) return 'high';
    if (lowPatterns.some(pattern => lowerContent.includes(pattern))) return 'low';
    
    return 'medium';
  }

  /**
   * Parse task dependencies from requirements
   */
  parseDependencies(requirements) {
    if (!requirements) return [];
    
    // Extract task IDs that look like dependencies (1.1, 2.3, etc.)
    const taskIdPattern = /\b\d+\.\d+\b/g;
    const matches = requirements.match(taskIdPattern) || [];
    
    return matches.filter(id => id !== '0.0'); // Filter out placeholder requirements
  }

  /**
   * Calculate which tasks are blocked by each task
   */
  calculateBlocks(tasks) {
    tasks.forEach(task => {
      task.blocks = tasks.filter(other => 
        other.dependencies.includes(task.id)
      ).map(other => other.id);
    });
  }

  /**
   * Group tasks into execution phases
   */
  groupIntoPhases(tasks) {
    const phases = [];
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);
    
    // Phase 1: No dependencies (foundation)
    const foundationTasks = pending.filter(t => t.dependencies.length === 0);
    if (foundationTasks.length > 0) {
      phases.push({
        number: 1,
        name: 'Foundation',
        description: 'Tasks with no dependencies - can start immediately',
        tasks: foundationTasks
      });
    }

    // Group remaining tasks by dependency depth
    const remaining = pending.filter(t => t.dependencies.length > 0);
    let phaseNum = foundationTasks.length > 0 ? 2 : 1;
    
    while (remaining.length > 0) {
      const available = remaining.filter(task => 
        task.dependencies.every(dep => 
          completed.some(c => c.id === dep) || 
          phases.some(p => p.tasks.some(t => t.id === dep))
        )
      );
      
      if (available.length === 0) {
        // Circular dependency or missing tasks
        phases.push({
          number: phaseNum,
          name: 'Blocked',
          description: 'Tasks with unresolved dependencies',
          tasks: remaining.splice(0)
        });
        break;
      }
      
      phases.push({
        number: phaseNum,
        name: `Phase ${phaseNum}`,
        description: `Dependent on previous phases`,
        tasks: available
      });
      
      // Remove processed tasks
      available.forEach(task => {
        const index = remaining.indexOf(task);
        if (index > -1) remaining.splice(index, 1);
      });
      
      phaseNum++;
    }

    return phases;
  }

  /**
   * Generate dependency graph visualization
   */
  generateDependencyGraph(tasks) {
    const critical = tasks.filter(t => t.blocks.length > 2 || t.dependencies.length > 2);
    
    if (critical.length === 0) return 'No critical dependencies identified';
    
    // Simple text-based graph
    return critical.map(task => 
      `${task.id} → [${task.blocks.join(', ')}]`
    ).join('\n');
  }

  /**
   * Generate model distribution stats
   */
  generateModelStats(tasks) {
    const stats = {
      'gemini-flash': { count: 0, types: [] },
      'gpt-4o': { count: 0, types: [] },
      'claude-sonnet': { count: 0, types: [] }
    };

    tasks.forEach(task => {
      const model = task.model || this.modelMapping[task.complexity];
      if (stats[model]) {
        stats[model].count++;
        stats[model].types.push(task.complexity);
      }
    });

    // Summarize types
    Object.keys(stats).forEach(model => {
      const types = [...new Set(stats[model].types)];
      stats[model].typeSummary = types.join(', ') + ' complexity';
    });

    return stats;
  }

  /**
   * Generate the complete roadmap
   */
  generateRoadmap() {
    const tasks = this.parseTasks();
    const phases = this.groupIntoPhases(tasks);
    const modelStats = this.generateModelStats(tasks);
    const dependencyGraph = this.generateDependencyGraph(tasks);
    
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    // Build roadmap content
    const roadmapData = {
      planId: this.planId,
      date: new Date().toISOString().split('T')[0],
      completionStatus: `${completedTasks.length}/${tasks.length} tasks complete`,
      phases: phases.map(phase => ({
        number: phase.number,
        name: phase.name,
        description: phase.description,
        tasks: phase.tasks.map((task, index) => ({
          order: index + 1,
          id: task.id,
          name: task.name,
          model: task.model,
          complexity: task.complexity,
          tokenEstimate: task.tokenEstimate,
          dependencies: task.dependencies.join(', ') || null,
          blocks: task.blocks.join(', ') || null,
          isCritical: task.blocks.length > 2,
          description: this.summarizeTask(task.description)
        }))
      })),
      dependencyGraph,
      modelStats,
      nextActions: this.generateNextActions(tasks),
      mvpTaskCount: pendingTasks.length,
      mvpMilestone: 'core functionality working'
    };

    return this.renderTemplate(roadmapData);
  }

  /**
   * Summarize task description to key points
   */
  summarizeTask(description) {
    const lines = description.split('\n').filter(line => line.trim() && !line.includes('_Requirements'));
    return lines.length > 0 ? lines[0].replace(/^\s*- /, '') : 'Task implementation';
  }

  /**
   * Generate next immediate actions
   */
  generateNextActions(tasks) {
    const pending = tasks.filter(t => !t.completed);
    const available = pending.filter(t => 
      t.dependencies.length === 0 || 
      t.dependencies.every(dep => tasks.some(task => task.id === dep && task.completed))
    );

    return available.slice(0, 3).map((task, index) => ({
      order: index + 1,
      task: `${task.id} - ${task.name}`,
      description: this.summarizeTask(task.description),
      model: task.model
    }));
  }

  /**
   * Render template with data (simplified - no template engine)
   */
  renderTemplate(data) {
    let template = `# Plan ${data.planId} - Task Execution Roadmap

**Generated**: ${data.date}  
**Status**: ${data.completionStatus}

## Execution Strategy

This roadmap orders tasks by dependency requirements and optimal resource utilization across different AI models.

`;

    // Render phases
    data.phases.forEach(phase => {
      template += `## Phase ${phase.number}: ${phase.name}\n*${phase.description}*\n\n`;
      
      phase.tasks.forEach(task => {
        template += `### ${task.order}. Task ${task.id} - ${task.name}\n`;
        template += `\`\`\`bash\nnpm run route-task ${data.planId} ${task.id}\n\`\`\`\n`;
        template += `- **Model**: ${task.model} (${task.complexity} complexity)\n`;
        template += `- **Estimated**: ${task.tokenEstimate} tokens\n`;
        if (task.dependencies) template += `- **Depends**: ${task.dependencies}\n`;
        if (task.blocks) template += `- **Blocks**: ${task.blocks}\n`;
        if (task.isCritical) template += `- **⚠️ CRITICAL PATH**\n`;
        template += `- **Description**: ${task.description}\n\n`;
      });
    });

    // Add other sections
    template += `## Critical Path Summary\n\n\`\`\`\n${data.dependencyGraph}\n\`\`\`\n\n`;
    
    template += `## Model Distribution\n\n`;
    template += `- **gemini-flash**: ${data.modelStats['gemini-flash'].count} tasks (${data.modelStats['gemini-flash'].typeSummary})\n`;
    template += `- **gpt-4o**: ${data.modelStats['gpt-4o'].count} tasks (${data.modelStats['gpt-4o'].typeSummary})\n`;
    template += `- **claude-sonnet**: ${data.modelStats['claude-sonnet'].count} tasks (${data.modelStats['claude-sonnet'].typeSummary})\n\n`;
    
    template += `## Next Immediate Actions\n\n`;
    data.nextActions.forEach(action => {
      template += `${action.order}. **${action.task}**: ${action.description} (${action.model})\n`;
    });
    
    template += `\n**Estimated MVP Completion**: ${data.mvpTaskCount} tasks until ${data.mvpMilestone}.`;

    return template;
  }

  /**
   * Save roadmap to file
   */
  save() {
    const roadmapContent = this.generateRoadmap();
    const outputFile = path.join(this.planPath, 'roadmap.md');
    
    fs.writeFileSync(outputFile, roadmapContent, 'utf8');
    console.log(`Roadmap generated: ${outputFile}`);
    
    return outputFile;
  }
}

// CLI execution
if (require.main === module) {
  const planId = process.argv[2];
  
  if (!planId) {
    console.error('Usage: node createRoadmap.js <planId>');
    console.error('Example: node createRoadmap.js 0041');
    process.exit(1);
  }
  
  try {
    const generator = new RoadmapGenerator(planId);
    generator.save();
  } catch (error) {
    console.error('Error generating roadmap:', error.message);
    process.exit(1);
  }
}

module.exports = RoadmapGenerator;