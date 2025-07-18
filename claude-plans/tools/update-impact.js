#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const IMPACT_FILE = path.join(__dirname, '..', 'impact-tracking.json');

function loadImpacts() {
  try {
    return JSON.parse(fs.readFileSync(IMPACT_FILE, 'utf8'));
  } catch (error) {
    console.error('Failed to load impact-tracking.json:', error.message);
    process.exit(1);
  }
}

function saveImpacts(data) {
  try {
    fs.writeFileSync(IMPACT_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Impact tracking updated');
  } catch (error) {
    console.error('Failed to save impact-tracking.json:', error.message);
    process.exit(1);
  }
}

function findImpactByFile(impacts, planId, filePath) {
  return impacts.find(impact => 
    impact.plan_id === planId && 
    impact.file === filePath
  );
}

function findImpactById(impacts, impactId) {
  return impacts.find(impact => impact.impact_id == impactId);
}

function getNextImpactId(impacts) {
  // Find highest impact_id across ALL plans
  const maxId = Math.max(0, ...impacts.map(impact => {
    const id = parseInt(impact.impact_id);
    return isNaN(id) ? 0 : id;
  }));
  return maxId + 1;
}

function addImpact(planId, filePath, description, options = {}) {
  const data = loadImpacts();
  
  // Check if impact already exists for this plan+file
  const existing = findImpactByFile(data.impacts, planId, filePath);
  if (existing) {
    console.log(`📝 Impact already exists: ${existing.impact_id} (${planId} -> ${filePath})`);
    return existing.impact_id;
  }

  // Auto-detect package from file path
  let packageName = 'TBD';
  if (filePath.startsWith('apps/wf-client/')) packageName = 'wf-client';
  else if (filePath.startsWith('apps/wf-admin/')) packageName = 'wf-admin';
  else if (filePath.startsWith('apps/wf-server/')) packageName = 'wf-server';
  else if (filePath.startsWith('packages/shared-imports/')) packageName = 'shared-imports';
  else if (filePath.startsWith('packages/devtools/')) packageName = 'devtools';
  else if (filePath.startsWith('packages/db-connect/')) packageName = 'db-connect';
  else if (filePath.startsWith('sql/')) packageName = 'sql';
  else if (filePath.startsWith('claude-plans/')) packageName = 'claude-plans';

  // Auto-detect cluster from file path
  let cluster = options.cluster || 'SHARED';
  if (filePath.includes('/crud/') || filePath.includes('CrudLayout')) cluster = 'CRUD';
  else if (filePath.includes('/navigation/') || filePath.includes('navigation.js')) cluster = 'NAVIGATION';
  else if (filePath.includes('/mapping/') || filePath.includes('Mapping') || filePath.includes('btchMapping')) cluster = 'MAPPING';
  else if (filePath.includes('/auth/') || filePath.includes('Login')) cluster = 'AUTH';
  else if (packageName === 'devtools') cluster = 'DEVTOOLS';
  else if (packageName === 'wf-server' || filePath.includes('/api/')) cluster = 'API';
  else if (filePath.includes('events.js') || filePath.includes('EventType')) cluster = 'EVENTS';

  const newImpact = {
    plan_id: planId,
    impact_id: getNextImpactId(data.impacts),
    package: packageName,
    file: filePath,
    type: options.type || 'DISCOVERED',
    status: options.status || 'completed',
    description: description,
    complexity: options.complexity || 'medium',
    cluster: cluster,
    created: new Date().toISOString().split('T')[0],
    completed: options.status === 'completed' ? new Date().toISOString().split('T')[0] : null
  };

  data.impacts.push(newImpact);
  saveImpacts(data);
  
  console.log(`✅ Added impact ${newImpact.impact_id}: Plan ${planId} -> ${filePath}`);
  return newImpact.impact_id;
}

function updateStatus(identifier, filePath, status) {
  const data = loadImpacts();
  let impact;
  
  // Try to find by impact ID first, then by plan+file
  if (!filePath) {
    impact = findImpactById(data.impacts, identifier);
  } else {
    impact = findImpactByFile(data.impacts, identifier, filePath);
  }
  
  if (!impact) {
    console.error(`❌ Impact not found: ${identifier}${filePath ? ' -> ' + filePath : ''}`);
    return;
  }

  impact.status = status;
  if (status === 'completed' && !impact.completed) {
    impact.completed = new Date().toISOString().split('T')[0];
  } else if (status !== 'completed') {
    impact.completed = null;
  }

  saveImpacts(data);
  console.log(`✅ Updated impact ${impact.impact_id}: ${status}`);
}

function listImpacts(planId) {
  const data = loadImpacts();
  const planImpacts = data.impacts.filter(impact => impact.plan_id === planId);
  
  if (planImpacts.length === 0) {
    console.log(`No impacts found for plan ${planId}`);
    return;
  }

  console.log(`\n📋 Plan ${planId} Impacts (${planImpacts.length} total):\n`);
  planImpacts.forEach(impact => {
    const status = impact.status === 'completed' ? '✅' : 
                  impact.status === 'in_progress' ? '🔄' : '⏳';
    console.log(`${status} Impact ${impact.impact_id} [${impact.cluster}] ${impact.file}`);
    console.log(`   ${impact.description}`);
  });
}

function batchAdd(planId, impactList) {
  console.log(`\n🔄 Processing ${impactList.length} impacts for Plan ${planId}...\n`);
  
  impactList.forEach((item, index) => {
    const [filePath, description, status = 'completed'] = item;
    console.log(`[${index + 1}/${impactList.length}]`);
    addImpact(planId, filePath, description, { status });
  });
  
  console.log(`\n🎉 Batch complete: ${impactList.length} impacts processed for Plan ${planId}`);
}

// CLI Interface
const [,, command, ...args] = process.argv;

switch (command) {
  case 'add':
    const [planId, filePath, description] = args;
    if (!planId || !filePath || !description) {
      console.error('Usage: update-impact.js add <planId> <filePath> <description>');
      console.error('Example: update-impact.js add 0006 "packages/shared-imports/src/stores/contextStore.js" "Added setEvent method"');
      process.exit(1);
    }
    addImpact(planId, filePath, description);
    break;

  case 'complete':
    const [identifier, filePathForComplete] = args;
    if (!identifier) {
      console.error('Usage: update-impact.js complete <impactId> OR <planId> <filePath>');
      console.error('Examples:');
      console.error('  update-impact.js complete 147');
      console.error('  update-impact.js complete 0006 "packages/shared-imports/src/stores/contextStore.js"');
      process.exit(1);
    }
    updateStatus(identifier, filePathForComplete, 'completed');
    break;

  case 'progress':
    const [id2, filePath2] = args;
    if (!id2) {
      console.error('Usage: update-impact.js progress <impactId> OR <planId> <filePath>');
      process.exit(1);
    }
    updateStatus(id2, filePath2, 'in_progress');
    break;

  case 'list':
    const [listPlanId] = args;
    if (!listPlanId) {
      console.error('Usage: update-impact.js list <planId>');
      process.exit(1);
    }
    listImpacts(listPlanId);
    break;

  case 'batch':
    console.log('Batch mode: Paste your impact list, end with empty line:');
    console.log('Format: planId|filePath|description|status(optional)');
    console.log('Example: 0006|packages/shared-imports/src/stores/contextStore.js|Added setEvent method|completed');
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const impacts = [];
    rl.prompt();
    
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        rl.close();
        return;
      }
      
      const parts = trimmed.split('|');
      if (parts.length >= 3) {
        const [planId, filePath, description, status] = parts;
        impacts.push({ planId, filePath, description, status: status || 'completed' });
      } else {
        console.log('Invalid format, skipping:', line);
      }
      rl.prompt();
    });
    
    rl.on('close', () => {
      if (impacts.length === 0) {
        console.log('No impacts to process');
        return;
      }
      
      // Group by plan ID
      const byPlan = {};
      impacts.forEach(impact => {
        if (!byPlan[impact.planId]) byPlan[impact.planId] = [];
        byPlan[impact.planId].push([impact.filePath, impact.description, impact.status]);
      });
      
      // Process each plan
      Object.entries(byPlan).forEach(([planId, impactList]) => {
        batchAdd(planId, impactList);
      });
    });
    break;

  default:
    console.log('Impact Tracking CLI - Sequential Impact IDs');
    console.log('');
    console.log('Commands:');
    console.log('  add <planId> <filePath> <description>  - Add new impact');
    console.log('  complete <impactId>                    - Mark impact as completed (by ID)');
    console.log('  complete <planId> <filePath>           - Mark impact as completed (by plan+file)');
    console.log('  progress <impactId>                    - Mark impact as in-progress');
    console.log('  list <planId>                          - List all impacts for plan');
    console.log('  batch                                  - Interactive batch mode');
    console.log('');
    console.log('Examples:');
    console.log('  update-impact.js add 0006 "packages/shared-imports/src/stores/contextStore.js" "Added setEvent method"');
    console.log('  update-impact.js complete 147');
    console.log('  update-impact.js complete 0006 "packages/shared-imports/src/stores/contextStore.js"');
    console.log('  update-impact.js list 0006');
}