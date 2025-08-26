#!/usr/bin/env node
/**
 * Agent Director - Task Orchestration System
 * Evaluates tasks and directs to appropriate agents
 * 
 * Usage:
 *   node .claude/routing/AgentDirector.js "analyze app infrastructure" 
 *   node .claude/routing/AgentDirector.js --help
 * 
 * Workflow:
 * 1. Kiro: "Next task is 2.1"
 * 2. You: Get task message
 * 3. AgentDirector: Evaluate & Route
 * 4. AgentDirector: "Use EventParser"  
 * 5. You: Invoke EventParser
 * 6. Agent: Complete task
 * 7. User/Claude: Review work quality
 * 8. User/Claude: "Task complete, move to next"
 * 9. Kiro: Mark 2.1 complete, suggest 2.2
 */

import AgentRouter from './AgentRouter.js';
import { readFileSync } from 'fs';

class AgentDirector {
  constructor() {
    this.agentRouter = new AgentRouter();
    this.confidenceThreshold = 0.6; // Minimum confidence for automatic routing
    this.taskHistory = [];
  }

  /**
   * Main orchestration method - evaluates task and provides direction
   * @param {string} taskDescription - Full task description from Kiro
   * @param {string} taskId - Task identifier (e.g., "2.1")
   * @returns {Object} Direction with agent assignment or recommendations
   */
  evaluateAndDirect(taskDescription, taskId) {
    console.log(`\n🎯 AgentDirector: Evaluating task ${taskId}`);
    console.log(`Task: "${taskDescription.substring(0, 100)}..."`);

    // Step 1: Parse task content to extract metadata
    const taskMetadata = this.agentRouter.inferTaskMetadata(taskDescription);
    taskMetadata.taskId = taskId;

    console.log(`📊 Inferred Domain: ${taskMetadata.domain || 'unknown'}`);
    console.log(`🔧 Inferred Capability: ${taskMetadata.capability || 'unknown'}`);
    
    // Step 2: Route to best agent
    const routing = this.agentRouter.routeTask(taskMetadata);
    
    console.log(`🤖 Suggested Agent: ${routing.agent}`);
    console.log(`📈 Confidence: ${(routing.confidence * 100).toFixed(1)}%`);
    console.log(`💭 Reasoning: ${routing.reasoning}`);

    // Step 3: Evaluate routing quality and provide direction
    const direction = this.createDirection(taskMetadata, routing);
    
    // Step 4: Track decision for learning
    this.trackDecision(taskId, taskMetadata, routing, direction);

    return direction;
  }

  /**
   * Create direction based on routing confidence and analysis
   */
  createDirection(taskMetadata, routing) {
    if (routing.confidence >= this.confidenceThreshold) {
      return {
        decision: 'EXECUTE',
        agent: routing.agent,
        model: routing.model,
        confidence: routing.confidence,
        reasoning: routing.reasoning,
        contextOptimization: routing.contextOptimization,
        instructions: `Invoke ${routing.agent} for this task. Context optimized to ${routing.contextOptimization.recommended} tokens.\n\n🔍 COMPLETION-DRIVE: Tag assumptions with // COMPLETION_DRIVE during analysis, verify systematically before completing.`
      };
    } 
    
    if (routing.confidence >= 0.3) {
      return {
        decision: 'EXECUTE_WITH_CAUTION',
        agent: routing.agent,
        model: routing.model,
        confidence: routing.confidence,
        reasoning: routing.reasoning,
        fallbackOptions: routing.fallbackOptions,
        instructions: `Low confidence routing. Invoke ${routing.agent} but monitor closely. Fallback options: ${routing.fallbackOptions.map(f => f.agent).join(', ')}\n\n🔍 COMPLETION-DRIVE: Tag assumptions with // COMPLETION_DRIVE during analysis, verify systematically before completing.`
      };
    }

    return {
      decision: 'SUGGEST_NEW_AGENT',
      confidence: routing.confidence,
      gapAnalysis: this.analyzeCapabilityGap(taskMetadata),
      instructions: `No suitable agent found. Consider creating new agent specialized in: ${taskMetadata.domain} with capabilities: ${taskMetadata.capability}\n\n🔍 COMPLETION-DRIVE: Tag assumptions with // COMPLETION_DRIVE during analysis, verify systematically before completing.`
    };
  }

  /**
   * Analyze what type of new agent might be needed
   */
  analyzeCapabilityGap(taskMetadata) {
    const { domain, capability } = taskMetadata;
    
    // Suggest specific agent types based on patterns
    if (domain === 'eventTypes' && capability === 'layout-parsing') {
      return {
        suggestedAgent: 'LayoutParser',
        domains: ['eventTypes', 'layout'],
        capabilities: ['layout-parsing', 'component-positioning', 'grid-validation'],
        reasoning: 'Current agents lack specialized layout parsing capabilities'
      };
    }
    
    if (domain === 'eventTypes' && capability === 'query-parsing') {
      return {
        suggestedAgent: 'QueryParser', 
        domains: ['eventTypes', 'query'],
        capabilities: ['query-parsing', 'sql-analysis', 'data-flow'],
        reasoning: 'Current agents lack specialized query parsing capabilities'
      };
    }

    return {
      suggestedAgent: `${domain}Specialist`,
      domains: [domain],
      capabilities: [capability],
      reasoning: `Gap identified in ${domain} domain for ${capability} capability`
    };
  }

  /**
   * Track decisions for learning and optimization
   */
  trackDecision(taskId, taskMetadata, routing, direction) {
    this.taskHistory.push({
      taskId,
      timestamp: new Date().toISOString(),
      domain: taskMetadata.domain,
      capability: taskMetadata.capability,
      selectedAgent: routing.agent,
      confidence: routing.confidence,
      decision: direction.decision,
      reasoning: routing.reasoning,
      type: taskId.startsWith('adhoc-') ? 'adhoc' : 'planned'
    });
  }

  /**
   * Analyze patterns in task routing for optimization
   */
  analyzeRoutingPatterns() {
    const patterns = {
      totalTasks: this.taskHistory.length,
      averageConfidence: this.taskHistory.reduce((sum, task) => sum + task.confidence, 0) / this.taskHistory.length,
      agentUsage: {},
      domainDistribution: {},
      taskTypeDistribution: { planned: 0, adhoc: 0 },
      lowConfidenceTasks: this.taskHistory.filter(task => task.confidence < this.confidenceThreshold).length
    };

    // Calculate usage patterns
    this.taskHistory.forEach(task => {
      patterns.agentUsage[task.selectedAgent] = (patterns.agentUsage[task.selectedAgent] || 0) + 1;
      patterns.domainDistribution[task.domain] = (patterns.domainDistribution[task.domain] || 0) + 1;
      patterns.taskTypeDistribution[task.type] += 1;
    });

    return patterns;
  }

  /**
   * Generate recommendations for system improvement
   */
  generateRecommendations() {
    const patterns = this.analyzeRoutingPatterns();
    const recommendations = [];

    // Check for agents that are underutilized or overutilized
    const avgUsage = patterns.totalTasks / Object.keys(patterns.agentUsage).length;
    
    Object.entries(patterns.agentUsage).forEach(([agent, usage]) => {
      if (usage > avgUsage * 2) {
        recommendations.push({
          type: 'OVERUSED_AGENT',
          agent,
          suggestion: `Consider creating specialized sub-agents to reduce load on ${agent}`
        });
      }
      if (usage < avgUsage * 0.5 && usage > 0) {
        recommendations.push({
          type: 'UNDERUSED_AGENT',
          agent,
          suggestion: `Agent ${agent} is underutilized. Review expertise domains.`
        });
      }
    });

    // Check for capability gaps
    if (patterns.lowConfidenceTasks > patterns.totalTasks * 0.2) {
      recommendations.push({
        type: 'CAPABILITY_GAP',
        suggestion: 'High number of low-confidence routings suggests missing agent specializations'
      });
    }

    return recommendations;
  }

  /**
   * Look up task description from tasks.md file
   */
  static lookupTaskDescription(taskId, planId = '0041') {
    try {
      const tasksPath = `.kiro/${planId}/tasks.md`;
      const tasksContent = readFileSync(tasksPath, 'utf8');
      
      // Match task patterns like "- [ ] 2.1 Task Name" or "- [x] 2.1 Task Name"
      const taskPattern = new RegExp(
        `- \\[([ x])\\] ${taskId.replace('.', '\\.')} (.+?)\\n((?:\\s{2,}-.+\\n)*)`,
        'gms'
      );
      
      const match = taskPattern.exec(tasksContent);
      if (match) {
        const [, , taskName, description] = match;
        return `${taskName.trim()} ${description.trim()}`;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * CLI interface for manual task direction
   */
  static async directTask(arg1, arg2 = null, arg3 = null) {
    const director = new AgentDirector();
    
    let taskDescription, taskId, planId;
    
    // Parse arguments: single = adhoc, two = plan+task OR description+task
    if (!arg2) {
      // Single argument = adhoc request
      taskDescription = arg1;
      taskId = `adhoc-${Date.now()}`;
      console.log(`🎯 Adhoc Request: ${taskDescription.substring(0, 100)}...`);
      console.log(`📝 Generated ID: ${taskId}`);
    } else if (arg2 && !arg3) {
      // Two args: could be "planId taskId" or "description taskId"
      if (arg1.match(/^\d{4}$/)) {
        // First arg looks like plan ID (4 digits)
        planId = arg1;
        taskId = arg2;
        taskDescription = AgentDirector.lookupTaskDescription(taskId, planId);
        
        if (!taskDescription) {
          console.log(`❌ Could not find task ${taskId} in plan ${planId}`);
          return;
        }
        
        console.log(`📋 Plan ${planId} Task ${taskId}: ${taskDescription.substring(0, 100)}...`);
      } else {
        // Treat as "description taskId"
        taskDescription = arg1;
        taskId = arg2;
        console.log(`📝 Custom Task ${taskId}: ${taskDescription.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Invalid arguments');
      console.log('Usage:');
      console.log('  node AgentDirector.js "Fix CSS layout issue"      # Adhoc request');
      console.log('  node AgentDirector.js "0041" "2.2"               # Plan + Task ID');
      console.log('  node AgentDirector.js "description" "2.2"        # Description + Task ID');
      return;
    }
    
    const direction = director.evaluateAndDirect(taskDescription, taskId);
    
    console.log('\n🎬 DIRECTION:');
    console.log('='.repeat(50));
    console.log(`Decision: ${direction.decision}`);
    console.log(`Instructions: ${direction.instructions}`);
    
    if (direction.agent) {
      console.log(`\n🤖 Agent: ${direction.agent}`);
      console.log(`📊 Confidence: ${(direction.confidence * 100).toFixed(1)}%`);
    }
    
    if (direction.gapAnalysis) {
      console.log(`\n💡 Gap Analysis:`);
      console.log(`Suggested Agent: ${direction.gapAnalysis.suggestedAgent}`);
      console.log(`Domains: ${direction.gapAnalysis.domains.join(', ')}`);
      console.log(`Capabilities: ${direction.gapAnalysis.capabilities.join(', ')}`);
    }
    
    return direction;
  }
}

/**
 * Show help and keyword reference
 */
function showHelp() {
  console.log('🤖 AgentDirector - Intelligent Task Routing\n');
  console.log('USAGE:');
  console.log('  node .claude/routing/AgentDirector.js "analyze app infrastructure"');
  console.log('  node .claude/routing/AgentDirector.js "0041" "2.2"  # Plan + Task');
  console.log('  node .claude/routing/AgentDirector.js --help\n');
  
  console.log('🎯 ROUTING KEYWORDS:');
  console.log('──────────────────────────────────────────────────────────');
  console.log('AppAnalyzer:       infrastructure, app structure, routing config');
  console.log('ComponentAnalyzer: react components, patterns, performance');  
  console.log('EventParser:       eventTypes, workflow orchestration');
  console.log('WorkflowAnalyzer:  workflow triggers, integration');
  console.log('DeadCodeParser:    dead code, cleanup, dependencies');
  console.log('SchemaParser:      sql schema, database validation');
  console.log('UXAnalyzer:        ui layout, accessibility, design\n');
  
  console.log('💡 EXAMPLES:');
  console.log('  "analyze the infrastructure of wf-plan-management"  → AppAnalyzer');
  console.log('  "review component patterns in shared-imports"       → ComponentAnalyzer');
  console.log('  "validate eventTypes structure"                     → EventParser');
  console.log('  "clean up dead code in utils folder"                → DeadCodeParser');
  console.log('  "analyze sql schema for validation rules"           → SchemaParser');
  console.log('  "check ui layout accessibility compliance"          → UXAnalyzer\n');
  
  console.log('🔄 CONFIDENCE LEVELS:');
  console.log('  90%+ = High confidence, execute immediately');
  console.log('  60%+ = Medium confidence, suggested agent');  
  console.log('  <60% = Low confidence, fallback to EventParser with caution');
}

// CLI usage: node AgentDirector.js "adhoc request" OR "0041" "2.2" OR "description" "2.2"
if (process.argv.length >= 3) {
  const arg1 = process.argv[2];
  const arg2 = process.argv[3];
  
  if (arg1 === '--help' || arg1 === '-h') {
    showHelp();
  } else {
    AgentDirector.directTask(arg1, arg2);
  }
}

export default AgentDirector;