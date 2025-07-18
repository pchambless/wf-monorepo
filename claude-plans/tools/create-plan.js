#!/usr/bin/env node

/**
 * Plan Creation CLI Tool
 * Creates new plans with sequential IDs and consistent structure
 * 
 * Usage: node create-plan.js CLUSTER "Plan Name"
 * Example: node create-plan.js MAPPING "Batch Enhancement Features"
 */

const fs = require('fs');
const path = require('path');

// Valid clusters with their blast radius
const VALID_CLUSTERS = {
  // High Blast Radius
  'EVENTS': 'high',
  'API': 'high', 
  'SHARED': 'high',
  
  // Medium Blast Radius
  'DEVTOOLS': 'medium',
  'AUTH': 'medium',
  'NAVIGATION': 'medium',
  
  // Low Blast Radius
  'MAPPING': 'low',
  'CRUD': 'low',
  'RECIPES': 'low'
};

function getNextPlanId() {
  const registryPath = path.join(__dirname, '..', 'plan-registry.json');
  
  if (!fs.existsSync(registryPath)) {
    return '0001';
  }
  
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  // Get next ID from persistent counter
  const nextId = registry.metadata?.next_id || 1;
  return String(nextId).padStart(4, '0');
}

function incrementPlanCounter() {
  const registryPath = path.join(__dirname, '..', 'plan-registry.json');
  
  let registry;
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    // Increment the counter
    registry.metadata.next_id = (registry.metadata.next_id || 1) + 1;
  } else {
    // This shouldn't happen since updatePlanRegistry creates it first,
    // but just in case
    const today = new Date().toISOString().split('T')[0];
    registry = {
      metadata: {
        created: today,
        description: "Master registry of all development plans with ID-to-name mapping",
        version: "1.0",
        next_id: 2  // Next plan will be 0002
      },
      plans: []
    };
  }
  
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

function createPlanFile(planId, cluster, planName) {
  const fileName = `${planId}-${cluster}-${planName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')}.md`;
  const filePath = path.join(__dirname, '..', 'a-pending', fileName);
  const blastRadius = VALID_CLUSTERS[cluster];
  
  const template = `# ${cluster} - ${planName}

## User Idea
[Brief description of the feature/fix/enhancement]

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: ${planId}
- **Files**: TBD (see impact-tracking.json: plan_id="${planId}")
- **Complexity**: TBD (High|Medium|Low)
- **Packages**: TBD (package names and file counts)
- **Blast Radius**: ${cluster} (${blastRadius})

### Impact Tracking Status
- **Predicted**: TBD files
- **Actual**: TBD files (+X discovered)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in \`/claude-plans/impact-tracking.json\`

### Plan Dependencies
- **Blocks**: [List plans that can't proceed until this is done]
- **Blocked by**: [List plans that must complete first]
- **Related**: [List plans with overlapping scope]
- **File Conflicts**: [Specific files being modified by multiple plans]

## Implementation Strategy
[High-level approach and key phases]

## Next Steps
1. [First implementation phase]
2. [Second phase]
3. [Testing and validation]
`;

  fs.writeFileSync(filePath, template);
  return fileName;
}

function updatePlanRegistry(planId, cluster, planName, fileName) {
  const registryPath = path.join(__dirname, '..', 'plan-registry.json');
  const today = new Date().toISOString().split('T')[0];
  
  let registry;
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } else {
    registry = {
      metadata: {
        created: today,
        description: "Master registry of all development plans with ID-to-name mapping",
        version: "1.0",
        next_id: 1  // Will be incremented after this plan
      },
      plans: []
    };
  }
  
  // Add new plan entry
  const newPlan = {
    id: planId,
    name: planName,
    cluster: cluster,
    filename: fileName,
    status: "active",
    created: today
  };
  
  registry.plans.push(newPlan);
  
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

function updateImpactTracking(planId, cluster, planName) {
  const jsonPath = path.join(__dirname, '..', 'impact-tracking.json');
  const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd format
  
  let json;
  if (fs.existsSync(jsonPath)) {
    json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } else {
    json = {
      metadata: {
        created: today,
        description: "Unified impact tracking for all development plans",
        version: "1.0"
      },
      impacts: []
    };
  }
  
  // Add initial placeholder impact entry (using only ID now)
  const newImpact = {
    plan_id: planId,  // Only the ID, not the full name
    impact_id: `${planId}_001`,
    package: "TBD",
    file: "TBD",
    type: "ANALYZED",
    status: "pending",
    description: "Initial plan created - impacts to be determined",
    complexity: "medium",
    cluster: cluster,
    created: today,
    completed: null
  };
  
  json.impacts.push(newImpact);
  
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node create-plan.js CLUSTER "Plan Name"');
    console.error('');
    console.error('Valid clusters:');
    Object.entries(VALID_CLUSTERS).forEach(([cluster, risk]) => {
      console.error(`  ${cluster} (${risk} blast radius)`);
    });
    process.exit(1);
  }
  
  const [cluster, planName] = args;
  
  if (!VALID_CLUSTERS[cluster]) {
    console.error(`Invalid cluster: ${cluster}`);
    console.error('Valid clusters:', Object.keys(VALID_CLUSTERS).join(', '));
    process.exit(1);
  }
  
  if (!planName || planName.trim().length === 0) {
    console.error('Plan name cannot be empty');
    process.exit(1);
  }
  
  try {
    const planId = getNextPlanId();
    const fileName = createPlanFile(planId, cluster, planName.trim());
    updatePlanRegistry(planId, cluster, planName.trim(), fileName);
    updateImpactTracking(planId, cluster, planName.trim());
    incrementPlanCounter();  // Increment counter for next plan
    
    console.log(`✅ Plan created successfully!`);
    console.log(`📁 File: ${fileName}`);
    console.log(`🔢 Plan ID: ${planId}`);
    console.log(`🎯 Cluster: ${cluster} (${VALID_CLUSTERS[cluster]} blast radius)`);
    console.log(`📋 Registry updated: plan-registry.json`);
    console.log(`📊 Impacts updated: impact-tracking.json`);
    console.log('');
    console.log(`Next steps:`);
    console.log(`1. Edit the plan file to add details`);
    console.log(`2. Add specific impacts to impact-tracking.json (reference plan_id: "${planId}")`);
    console.log(`3. Update predicted file counts in the plan`);
    console.log('');
    console.log(`Query examples:`);
    console.log(`# Get plan name: jq '.plans[] | select(.id == "${planId}") | .name' plan-registry.json`);
    console.log(`# Get plan impacts: jq '.impacts[] | select(.plan_id == "${planId}")' impact-tracking.json`);
    
  } catch (error) {
    console.error('Error creating plan:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getNextPlanId, createPlanFile, updateImpactTracking };