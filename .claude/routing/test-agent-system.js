#!/usr/bin/env node
/**
 * Test Agent System - Validate the new .claude/ agent routing system
 * Run with: node .claude/routing/test-agent-system.js
 */

import AgentRouter from './AgentRouter.js';

console.log('=== Agent-Based Task Assignment System Test ===');
console.log('Location: .claude/ (co-located with agent definitions)');
console.log('Philosophy: Clean slate - no backwards compatibility\n');

const router = new AgentRouter();

// Test 1: Registry access
console.log('1. Registry Access:');
console.log(`   Total agents: ${Object.keys(router.getAgentRegistry()).length}`);
console.log(`   EventTypes domain agents: ${router.getAgentsByDomain('eventTypes').map(a => a.name).join(', ')}`);
console.log(`   Best for eventTypes: ${router.getBestAgentForDomain('eventTypes')?.name}\n`);

// Test 2: Agent-based routing (replaces complexity-based)
console.log('2. Agent-Based Task Routing:');

const testTasks = [
  {
    name: "Analyze eventType structure for validation errors",
    domain: "eventTypes",
    capability: "structure-validation",
    contextSize: 8000
  },
  {
    name: "Review React component performance patterns", 
    domain: "react",
    capability: "performance-optimization",
    contextSize: 6000
  },
  {
    name: "Validate workflow triggers and integration",
    domain: "workflows", 
    capability: "workflow-validation",
    contextSize: 7000
  },
  {
    name: "Analyze UI layout for accessibility compliance",
    domain: "ui",
    capability: "accessibility-analysis", 
    contextSize: 5000
  },
  {
    name: "Find dead code and unused imports",
    domain: "codeAnalysis",
    capability: "dead-code-detection",
    contextSize: 4000
  }
];

testTasks.forEach((task, index) => {
  console.log(`\n   Test ${index + 1}: ${task.name}`);
  const routing = router.routeTask(task);
  console.log(`     → Agent: ${routing.agent}`);
  console.log(`     → Model: ${routing.model}`);
  console.log(`     → Reasoning: ${routing.reasoning}`);
  console.log(`     → Confidence: ${(routing.confidence * 100).toFixed(1)}%`);
  console.log(`     → Context: ${routing.contextOptimization.recommended} tokens (${routing.contextOptimization.strategy})`);
});

// Test 3: Content inference (replaces complexity inference)
console.log('\n\n3. Content Inference (Domain/Capability vs Complexity):');

const inferenceTests = [
  "Analyze eventType component array structure and validate workflow triggers",
  "Review React component performance and identify re-rendering issues", 
  "Clean up dead code and unused imports using dependency analysis",
  "Validate SQL schema and generate field-level validation metadata",
  "Design UI layout for accessibility and responsive behavior"
];

inferenceTests.forEach((content, index) => {
  console.log(`\n   Content ${index + 1}: "${content}"`);
  const metadata = router.inferTaskMetadata(content);
  console.log(`     → Domain: ${metadata.domain || 'unknown'}`);
  console.log(`     → Capability: ${metadata.capability || 'unknown'}`);
  console.log(`     → Context Size: ${metadata.contextSize}`);
  console.log(`     → Confidence: ${(metadata.confidence * 100).toFixed(1)}%`);
  
  if (metadata.domain) {
    const routing = router.routeTask(metadata);
    console.log(`     → Suggested Agent: ${routing.agent}`);
  }
});

// Test 4: Fallback scenarios (no more complexity fallbacks)
console.log('\n\n4. Fallback Scenarios:');

const fallbackTests = [
  { domain: "unknown", capability: "unknown", name: "Unknown task type" },
  { domain: "eventTypes", capability: "unknown", name: "EventTypes domain, unknown capability" },
  { domain: null, capability: "structure-validation", name: "No domain, but has capability" }
];

fallbackTests.forEach((task, index) => {
  console.log(`\n   Fallback ${index + 1}: ${task.name}`);
  const routing = router.routeTask(task);
  console.log(`     → Agent: ${routing.agent}`);
  console.log(`     → Reasoning: ${routing.reasoning}`);
  console.log(`     → Confidence: ${(routing.confidence * 100).toFixed(1)}%`);
  console.log(`     → Fallback Options: ${routing.fallbackOptions.map(f => f.agent).join(', ')}`);
});

// Test 5: Context optimization per agent
console.log('\n\n5. Context Optimization by Agent:');

const contextTests = [
  { agent: 'EventParser', requestedContext: 12000 },
  { agent: 'ComponentAnalyzer', requestedContext: 15000 }, // Over limit
  { agent: 'SchemaParser', requestedContext: 3000 }, // Under optimal
];

contextTests.forEach(test => {
  const agent = router.getAgentRegistry()[test.agent];
  const agentWithName = { name: test.agent, ...agent };
  const optimization = router.optimizeContext(agentWithName, test.requestedContext);
  
  console.log(`\n   ${test.agent} (requested: ${test.requestedContext})`);
  console.log(`     → Optimal: ${agent.contextLimits.optimal}, Maximum: ${agent.contextLimits.maximum}`);
  console.log(`     → Recommended: ${optimization.recommended}, Strategy: ${optimization.strategy}`);
  if (optimization.trimAmount) {
    console.log(`     → Trim Amount: ${optimization.trimAmount} tokens`);
  }
});

console.log('\n\n=== Agent System Test Complete ===');
console.log('🎯 Ready to replace complexity-based routing with expertise-based routing!');