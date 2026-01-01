#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const workflowsDir = path.join(__dirname, '../workflows');
const workflowName = process.argv[2];

if (!workflowName) {
  console.log('Usage: node inspect-workflow.js <workflow-name>');
  console.log('\nAvailable workflows:');
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
  files.forEach(f => console.log(`  - ${f.replace('.json', '')}`));
  process.exit(1);
}

const workflowPath = path.join(workflowsDir, `${workflowName}.json`);

if (!fs.existsSync(workflowPath)) {
  console.error(`Workflow not found: ${workflowName}`);
  process.exit(1);
}

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

console.log(JSON.stringify({
  id: workflow.id,
  name: workflow.name,
  active: workflow.active,
  nodes: workflow.nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    parameters: n.parameters
  })),
  connections: workflow.connections || {},
  settings: workflow.settings || {}
}, null, 2));
