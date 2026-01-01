#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const workflowId = process.argv[2];

if (!workflowId) {
  console.error('Usage: node export-single-workflow.js <workflow-id>');
  process.exit(1);
}

const dbPath = '/home/node/.n8n/database.sqlite';
const outputDir = '/home/node/.n8n/workflows';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log(`\n📦 Exporting workflow: ${workflowId}\n`);

db.get(
  `SELECT 
    id, name, active, nodes, connections, settings, 
    staticData, pinData, versionId, createdAt, updatedAt,
    description, isArchived
   FROM workflow_entity 
   WHERE id = ?`,
  [workflowId],
  (err, workflow) => {
    if (err) {
      console.error('❌ Error querying workflow:', err.message);
      db.close();
      process.exit(1);
    }

    if (!workflow) {
      console.error(`❌ Workflow not found: ${workflowId}`);
      db.close();
      process.exit(1);
    }

    try {
      const workflowJson = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        active: workflow.active === 1,
        isArchived: workflow.isArchived === 1,
        nodes: JSON.parse(workflow.nodes || '[]'),
        connections: JSON.parse(workflow.connections || '{}'),
        settings: JSON.parse(workflow.settings || '{}'),
        staticData: workflow.staticData ? JSON.parse(workflow.staticData) : null,
        pinData: workflow.pinData ? JSON.parse(workflow.pinData) : null,
        versionId: workflow.versionId,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      };

      const filename = `${workflow.id}.json`;
      const filePath = path.join(outputDir, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(workflowJson, null, 2), 'utf8');
      console.log(`✅ Exported: ${workflow.name} → ${filename}`);
      console.log(`   Updated: ${workflow.updatedAt}\n`);
      
      db.close();
    } catch (error) {
      console.error(`❌ Error exporting workflow:`, error.message);
      db.close();
      process.exit(1);
    }
  }
);
