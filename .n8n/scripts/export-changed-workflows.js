#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = '/home/node/.n8n/database.sqlite';
const outputDir = '/home/node/.n8n/workflows';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('\n📦 Checking for changed workflows...\n');

db.all(
  `SELECT 
    id, name, active, nodes, connections, settings, 
    staticData, pinData, versionId, createdAt, updatedAt,
    description, isArchived
   FROM workflow_entity 
   WHERE active = 1 AND isArchived = 0
   ORDER BY updatedAt DESC`,
  [],
  (err, workflows) => {
    if (err) {
      console.error('❌ Error querying workflows:', err.message);
      db.close();
      process.exit(1);
    }

    console.log(`Found ${workflows.length} active workflows\n`);

    let exportedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    workflows.forEach((workflow) => {
      try {
        const filename = `${workflow.id}.json`;
        const filePath = path.join(outputDir, filename);
        
        const dbUpdated = new Date(workflow.updatedAt);
        let fileModified = null;
        
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          fileModified = stats.mtime;
        }
        
        if (!fileModified || dbUpdated > fileModified) {
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

          fs.writeFileSync(filePath, JSON.stringify(workflowJson, null, 2), 'utf8');
          console.log(`✅ EXPORTED: ${workflow.name} (updated ${workflow.updatedAt})`);
          exportedCount++;
        } else {
          console.log(`⏭️  SKIPPED: ${workflow.name} (no changes)`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ ERROR: ${workflow.name} - ${error.message}`);
        errorCount++;
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Exported: ${exportedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);
    
    db.close();
  }
);
