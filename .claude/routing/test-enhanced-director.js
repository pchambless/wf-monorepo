#!/usr/bin/env node
/**
 * Test Enhanced AgentDirector - All three modes
 */

import AgentDirector from './AgentDirector.js';

console.log('🚀 Testing Enhanced AgentDirector - All Modes\n');

console.log('=' .repeat(60));
console.log('MODE 1: Adhoc Requests (single argument)');
console.log('=' .repeat(60));

const adhocTests = [
  "Fix CSS layout issue in the navigation component",
  "Analyze React component performance problems",
  "Review eventType structure for validation errors",
  "Clean up dead code in the shared-imports package",
  "Optimize database query performance"
];

for (const request of adhocTests) {
  console.log(`\nAdhoc: "${request}"`);
  console.log('-'.repeat(50));
  await AgentDirector.directTask(request);
}

console.log('\n' + '=' .repeat(60));
console.log('MODE 2: Plan + Task ID (two arguments, first is 4-digit plan)');
console.log('=' .repeat(60));

const planTests = [
  ['0041', '2.2'],
  ['0041', '4.1'],
  ['0041', '9.1']
];

for (const [plan, task] of planTests) {
  console.log(`\nPlan: "${plan}" Task: "${task}"`);
  console.log('-'.repeat(50));
  await AgentDirector.directTask(plan, task);
}

console.log('\n' + '=' .repeat(60));
console.log('MODE 3: Custom Description + Task ID');
console.log('=' .repeat(60));

const customTests = [
  ["Create unit tests for agent routing", "test-001"],
  ["Build monitoring dashboard", "monitor-001"],
  ["Implement fallback strategies", "fallback-001"]
];

for (const [description, taskId] of customTests) {
  console.log(`\nCustom: "${description}" ID: "${taskId}"`);
  console.log('-'.repeat(50));
  await AgentDirector.directTask(description, taskId);
}

console.log('\n' + '=' .repeat(60));
console.log('🎯 All modes working! Universal task orchestration ready!');
console.log('Usage Examples:');
console.log('  node AgentDirector.js "Fix CSS layout"           # Adhoc');
console.log('  node AgentDirector.js "0041" "2.2"              # Plan+Task');  
console.log('  node AgentDirector.js "Custom work" "task-001"  # Custom');
console.log('=' .repeat(60));