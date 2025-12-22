// generate-workflow-registry.js
// Scans .n8n/workflows and generates n8n-workflows/workflows.json

const fs = require('fs');
const path = require('path');

const workflowsDir = path.resolve(__dirname, '../workflows');
const outputDir = path.resolve(__dirname, '../../.agentTask/n8n-workflows');
const outputFile = path.join(outputDir, 'workflows.json');
const baseUrl = 'http://localhost:5678/webhook/';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
const registry = {};

files.forEach(file => {
  const name = path.basename(file, '.json');
  let description = '';
  try {
    const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
    const parsed = JSON.parse(content);
    // Try to extract a description from the workflow JSON (if present)
    if (parsed && parsed.description) {
      description = parsed.description;
    }
  } catch (e) {
    // Ignore parse errors, leave description blank
  }
  registry[name] = {
    url: baseUrl + name,
    description
  };
});

fs.writeFileSync(outputFile, JSON.stringify(registry, null, 2));
console.log('n8n workflow registry generated at', outputFile);
