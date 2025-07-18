#!/usr/bin/env node

/**
 * Plan Completion Tool
 * Updates plan status and renames files accordingly
 * 
 * Usage: node complete-plan.js PLAN_ID [STATUS]
 * Example: node complete-plan.js 0003 completed
 * Example: node complete-plan.js 0005 archived
 */

const fs = require('fs');
const path = require('path');

// Valid status transitions
const VALID_STATUSES = {
  'completed': 'DONE',
  'archived': 'ARCHIVED', 
  'on-hold': 'HOLD',
  'active': '' // Remove prefix, back to normal
};

function findPlanInRegistry(planId) {
  const registryPath = path.join(__dirname, '..', 'plan-registry.json');
  
  if (!fs.existsSync(registryPath)) {
    throw new Error('plan-registry.json not found');
  }
  
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const plan = registry.plans.find(p => p.id === planId);
  
  if (!plan) {
    throw new Error(`Plan ${planId} not found in registry`);
  }
  
  return { registry, plan };
}

function updatePlanStatus(planId, newStatus) {
  const { registry, plan } = findPlanInRegistry(planId);
  const registryPath = path.join(__dirname, '..', 'plan-registry.json');
  
  // Get current and new filenames
  const currentFilename = plan.filename;
  const currentPath = path.join(__dirname, '..', 'a-pending', currentFilename);
  
  // Determine new filename based on status
  let newFilename;
  const prefix = VALID_STATUSES[newStatus];
  
  if (newStatus === 'active') {
    // Remove any existing prefix
    newFilename = currentFilename.replace(/^(DONE|ARCHIVED|HOLD)-/, '');
  } else if (prefix) {
    // Add or replace prefix
    const baseFilename = currentFilename.replace(/^(DONE|ARCHIVED|HOLD)-/, '');
    newFilename = `${prefix}-${baseFilename}`;
  } else {
    throw new Error(`Invalid status: ${newStatus}. Valid options: ${Object.keys(VALID_STATUSES).join(', ')}`);
  }
  
  const newPath = path.join(__dirname, '..', 'a-pending', newFilename);
  
  // Rename file if it exists and names are different
  if (fs.existsSync(currentPath) && currentFilename !== newFilename) {
    fs.renameSync(currentPath, newPath);
    console.log(`📁 File renamed: ${currentFilename} → ${newFilename}`);
  } else if (!fs.existsSync(currentPath)) {
    console.log(`⚠️  File not found: ${currentPath}`);
    console.log(`   Registry will be updated anyway`);
  } else {
    console.log(`📁 Filename unchanged: ${currentFilename}`);
  }
  
  // Update registry
  plan.status = newStatus;
  plan.filename = newFilename;
  
  // Add completed date if marking as completed
  if (newStatus === 'completed' && !plan.completed) {
    plan.completed = new Date().toISOString().split('T')[0];
  }
  
  // Save registry
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  
  return { oldFilename: currentFilename, newFilename, plan };
}

function updateImpactTracking(planId, newStatus) {
  const impactPath = path.join(__dirname, '..', 'impact-tracking.json');
  
  if (!fs.existsSync(impactPath)) {
    console.log('⚠️  impact-tracking.json not found - skipping impact updates');
    return;
  }
  
  const impacts = JSON.parse(fs.readFileSync(impactPath, 'utf8'));
  const today = new Date().toISOString().split('T')[0];
  let updatedCount = 0;
  
  // Update all impacts for this plan
  impacts.impacts.forEach(impact => {
    if (impact.plan_id === planId) {
      if (newStatus === 'completed' && impact.status !== 'completed') {
        impact.status = 'completed';
        impact.completed = today;
        updatedCount++;
      } else if (newStatus === 'active' && impact.status === 'completed') {
        impact.status = 'pending';
        impact.completed = null;
        updatedCount++;
      }
    }
  });
  
  if (updatedCount > 0) {
    fs.writeFileSync(impactPath, JSON.stringify(impacts, null, 2));
    console.log(`📊 Updated ${updatedCount} impact entries`);
  } else {
    console.log(`📊 No impact entries needed updating`);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1 || args.length > 2) {
    console.error('Usage: node complete-plan.js PLAN_ID [STATUS]');
    console.error('');
    console.error('Valid statuses:');
    Object.entries(VALID_STATUSES).forEach(([status, prefix]) => {
      const example = prefix ? `${prefix}-0001-...` : '0001-...';
      console.error(`  ${status.padEnd(10)} → ${example}`);
    });
    console.error('');
    console.error('Examples:');
    console.error('  node complete-plan.js 0003 completed');
    console.error('  node complete-plan.js 0005 archived');
    console.error('  node complete-plan.js 0007 active     # Remove prefix');
    process.exit(1);
  }
  
  const [planId, newStatus = 'completed'] = args;
  
  if (!VALID_STATUSES.hasOwnProperty(newStatus)) {
    console.error(`Invalid status: ${newStatus}`);
    console.error(`Valid options: ${Object.keys(VALID_STATUSES).join(', ')}`);
    process.exit(1);
  }
  
  try {
    console.log(`Updating plan ${planId} to status: ${newStatus}`);
    console.log('');
    
    const result = updatePlanStatus(planId, newStatus);
    updateImpactTracking(planId, newStatus);
    
    console.log('');
    console.log(`✅ Plan ${planId} updated successfully!`);
    console.log(`🔢 Plan ID: ${planId}`);
    console.log(`📋 Status: ${newStatus}`);
    console.log(`📁 Filename: ${result.newFilename}`);
    
    if (result.plan.completed) {
      console.log(`📅 Completed: ${result.plan.completed}`);
    }
    
    console.log('');
    console.log('Query examples:');
    console.log(`# See plan details: jq '.plans[] | select(.id == "${planId}")' plan-registry.json`);
    console.log(`# See all ${newStatus} plans: jq '.plans[] | select(.status == "${newStatus}")' plan-registry.json`);
    
  } catch (error) {
    console.error('❌ Error updating plan:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updatePlanStatus, updateImpactTracking };