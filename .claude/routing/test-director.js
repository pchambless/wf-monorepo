#!/usr/bin/env node
/**
 * Test AgentDirector - Validate orchestration workflow
 */

import AgentDirector from './AgentDirector.js';

console.log('🎬 Testing AgentDirector Orchestration System');
console.log('Workflow: Kiro → AgentDirector → You → Agent → Review → Kiro\n');

const director = new AgentDirector();

// Test scenarios from the actual tasks.md
const testTasks = [
  {
    id: "2.1",
    description: "Create Agent class with expertise matching logic - Write Agent class constructor with expertise, domains, and context limits"
  },
  {
    id: "3.1", 
    description: "Implement core routing logic - Write routeTask() method with domain-based agent selection"
  },
  {
    id: "6.1",
    description: "Create integration tests for end-to-end routing - Write tests for complete task submission to agent assignment flow"
  },
  {
    id: "9.1",
    description: "Configure EventTypes domain agents - Define layoutParser agent with layout eventTypes expertise"
  },
  {
    id: "unknown",
    description: "Build a quantum entanglement communication system with interdimensional protocols"
  }
];

console.log('Testing orchestration for Plan 0041 tasks:\n');

testTasks.forEach((task, index) => {
  console.log(`${'='.repeat(60)}`);
  console.log(`TEST ${index + 1}: Simulating Kiro message`);
  console.log(`Kiro: "Next task is ${task.id}"`);
  console.log(`Task: "${task.description}"`);
  
  const direction = director.evaluateAndDirect(task.description, task.id);
  
  console.log(`\n🎬 AgentDirector Decision: ${direction.decision}`);
  console.log(`📋 Instructions: ${direction.instructions}`);
  
  if (direction.agent) {
    console.log(`\n👤 Your next action: Invoke ${direction.agent}`);
    console.log(`📊 Routing confidence: ${(direction.confidence * 100).toFixed(1)}%`);
  }
  
  if (direction.gapAnalysis) {
    console.log(`\n💡 New Agent Recommendation:`);
    console.log(`   Agent: ${direction.gapAnalysis.suggestedAgent}`);
    console.log(`   Domains: ${direction.gapAnalysis.domains.join(', ')}`);
    console.log(`   Capabilities: ${direction.gapAnalysis.capabilities.join(', ')}`);
  }
  
  console.log(`\n🔄 After agent completes: Tell Kiro "Mark ${task.id} complete, next task"`);
  console.log('');
});

// Test pattern analysis
console.log(`${'='.repeat(60)}`);
console.log('📊 ROUTING PATTERN ANALYSIS');
const patterns = director.analyzeRoutingPatterns();
console.log(`Total tasks evaluated: ${patterns.totalTasks}`);
console.log(`Average confidence: ${(patterns.averageConfidence * 100).toFixed(1)}%`);
console.log(`Low confidence tasks: ${patterns.lowConfidenceTasks}`);

console.log('\nAgent usage distribution:');
Object.entries(patterns.agentUsage).forEach(([agent, count]) => {
  console.log(`  ${agent}: ${count} tasks`);
});

console.log('\nDomain distribution:');
Object.entries(patterns.domainDistribution).forEach(([domain, count]) => {
  console.log(`  ${domain}: ${count} tasks`);
});

// Test recommendations
const recommendations = director.generateRecommendations();
if (recommendations.length > 0) {
  console.log('\n💡 System Recommendations:');
  recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec.type}: ${rec.suggestion}`);
  });
}

console.log(`\n${'='.repeat(60)}`);
console.log('🎯 AgentDirector ready for orchestration workflow!');
console.log('Usage: node AgentDirector.js "task description" "taskId"');