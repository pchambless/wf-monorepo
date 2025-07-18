#!/usr/bin/env node

console.log('Claude Plans - Available Tools:');
console.log('===============================');
console.log('');
console.log('📋 Plan Management:');
console.log('  new-plan [CLUSTER] "Plan Name"    - Create new plan with auto-increment ID');
console.log('  complete-plan [ID] [status]       - Mark plan as completed/archived/active');
console.log('');
console.log('📊 Analysis & Reporting:');
console.log('  plan-impacts                      - Show all impacts sorted by file');
console.log('  plan-tools                        - Show this menu');
console.log('');
console.log('🔧 Usage Examples:');
console.log('  new-plan SHARED "Widget Enhancement"');
console.log('  complete-plan 0006');
console.log('  complete-plan 0007 archived');
console.log('  plan-impacts | grep "status.*pending"');
console.log('');
console.log('💡 Global Aliases (add to ~/.bashrc):');
console.log('  alias new-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/create-plan.js"');
console.log('  alias complete-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/complete-plan.js"');
console.log('  alias plan-impacts="cd /home/paul/wf-monorepo-new/claude-plans && node tools/plan-impacts.js"');
console.log('  alias plan-tools="cd /home/paul/wf-monorepo-new/claude-plans && node tools/plan-tools.js"');