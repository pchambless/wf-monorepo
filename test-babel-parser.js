import { parseEventTypeFile, scanEventTypesWithBabel } from './analysis-n-document/genDocs/utils/parseEventType.js';

async function testBabelParser() {
  console.log('🧪 Testing Babel parser with known eventType files...\n');
  
  // Test single file parsing
  console.log('=== Testing pagePlanManager.js ===');
  const pagePlanManagerResult = await parseEventTypeFile('/home/paul/wf-monorepo-new/apps/wf-plan-management/src/pages/PlanManager/page/pagePlanManager.js');
  console.log('Result:', JSON.stringify(pagePlanManagerResult, null, 2));
  
  console.log('\n=== Testing formPlan.js ===');
  const formPlanResult = await parseEventTypeFile('/home/paul/wf-monorepo-new/apps/wf-plan-management/src/pages/PlanManager/forms/formPlan.js');
  console.log('Result:', JSON.stringify(formPlanResult, null, 2));
  
  // Test directory scanning
  console.log('\n=== Testing directory scan ===');
  const pagesDir = '/home/paul/wf-monorepo-new/apps/wf-plan-management/src/pages';
  const allEventTypes = await scanEventTypesWithBabel(pagesDir);
  
  console.log(`\n📊 Found ${allEventTypes.length} eventTypes:`);
  allEventTypes.forEach(evt => {
    console.log(`  - ${evt.eventType} (${evt.category || 'uncategorized'}) - ${evt.componentType}/${evt.fileName}`);
    if (evt.componentReferences?.length > 0) {
      console.log(`    └─ Components: ${evt.componentReferences.map(c => `${c.id}${c.container ? `(${c.container})` : ''}`).join(', ')}`);
    }
    if (evt.workflowTriggers) {
      console.log(`    └─ Workflows: ${Object.entries(evt.workflowTriggers).map(([trigger, workflows]) => `${trigger}:[${workflows.join(',')}]`).join(' ')}`);
    }
  });
  
  console.log('\n✅ Babel parser test complete!');
}

testBabelParser().catch(console.error);