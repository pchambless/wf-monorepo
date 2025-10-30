/**
 * Test script for clone session manager
 * Run: node apps/server/server/utils/cloneTemplate/testSession.js
 */

import * as sessionManager from './sessionManager.js';

async function testSessionWorkflow() {
  console.log('\n🧪 Testing Clone Session Workflow\n');

  try {
    // Step 1: Create session
    console.log('Step 1: Creating session...');
    const sessionID = await sessionManager.createSession(
      11, // template_id (CRUD template)
      1,  // target_id (ingrType page)
      'Paul'
    );
    console.log(`  Session ID: ${sessionID}\n`);

    // Step 2: Load template hierarchy (mock data for now)
    console.log('Step 2: Updating with template hierarchy...');
    const mockHierarchy = [
      { xref_id: 65, comp_name: 'Container', comp_type: 'Container', level: 0, parent_id: 65 },
      { xref_id: 77, comp_name: 'Title', comp_type: 'H3', level: 1, parent_id: 65 },
      { xref_id: 66, comp_name: 'AddNew', comp_type: 'Button', level: 1, parent_id: 65 },
      { xref_id: 67, comp_name: 'Grid', comp_type: 'Grid', level: 1, parent_id: 65 },
      { xref_id: 68, comp_name: 'Form', comp_type: 'Form', level: 1, parent_id: 65 },
      { xref_id: 69, comp_name: 'Submit', comp_type: 'Button', level: 2, parent_id: 68 }
    ];

    await sessionManager.updateSession(sessionID, {
      current_step: 'hierarchy',
      template_hierarchy: mockHierarchy
    }, 'Paul');
    console.log('  ✓ Hierarchy loaded\n');

    // Step 3: Stage components with ID mapping
    console.log('Step 3: Staging components...');
    const idMapping = {
      65: 103, 66: 104, 67: 105, 68: 106, 69: 107, 77: 108
    };

    const stagedComponents = [
      {
        xref_id: 103,
        comp_name: 'Container',
        comp_type: 'Container',
        parent_id: 103,
        pageID: 1,
        pageName: 'ingrType',
        level: 0,
        posOrder: '01,01,98,left',
        active: 1
      },
      {
        xref_id: 108,
        comp_name: 'Title',
        comp_type: 'H3',
        parent_id: 103,
        pageID: 1,
        pageName: 'ingrType',
        level: 1,
        posOrder: '01,01,50,left',
        active: 1
      },
      {
        xref_id: 104,
        comp_name: 'AddNew',
        comp_type: 'Button',
        parent_id: 103,
        pageID: 1,
        pageName: 'ingrType',
        level: 1,
        posOrder: '02,01,25,left',
        active: 1
      },
      {
        xref_id: 105,
        comp_name: 'Grid',
        comp_type: 'Grid',
        parent_id: 103,
        pageID: 1,
        pageName: 'ingrType',
        level: 1,
        posOrder: '03,01,50,left',
        active: 1
      },
      {
        xref_id: 106,
        comp_name: 'Form',
        comp_type: 'Form',
        parent_id: 103,
        pageID: 1,
        pageName: 'ingrType',
        level: 1,
        posOrder: '03,02,50,right',
        active: 1
      },
      {
        xref_id: 107,
        comp_name: 'Submit',
        comp_type: 'Button',
        parent_id: 106,
        pageID: 1,
        pageName: 'ingrType',
        level: 2,
        posOrder: '03,01,20,right',
        active: 1
      }
    ];

    await sessionManager.updateSession(sessionID, {
      current_step: 'components',
      staged_components: stagedComponents,
      id_mapping: idMapping
    }, 'Paul');
    console.log(`  ✓ Staged ${stagedComponents.length} components\n`);

    // Step 4: Stage props
    console.log('Step 4: Staging props...');
    const stagedProps = [
      {
        xref_id: 103,
        paramName: 'tableName',
        paramVal: 'whatsfresh.ingredient_types'
      },
      {
        xref_id: 108,
        paramName: 'text',
        paramVal: '{{pageConfig.props.title}}'
      },
      {
        xref_id: 104,
        paramName: 'label',
        paramVal: 'Add New'
      },
      {
        xref_id: 105,
        paramName: 'rowActions',
        paramVal: JSON.stringify([{
          id: 'delete',
          trigger: [{
            action: 'setVals',
            params: [{ method: 'DELETE', ingredient_type_id: '{{row.id}}' }]
          }, {
            action: 'execDML',
            content: {}
          }]
        }])
      }
    ];

    await sessionManager.updateSession(sessionID, {
      current_step: 'props',
      staged_props: stagedProps
    }, 'Paul');
    console.log(`  ✓ Staged ${stagedProps.length} props\n`);

    // Step 5: Stage triggers
    console.log('Step 5: Staging triggers...');
    const stagedTriggers = [
      {
        xref_id: 103,
        class: 'onLoad',
        action: 'setVals',
        ordr: 1,
        content: JSON.stringify([{ tableName: '{{pageConfig.props.tableName}}' }])
      },
      {
        xref_id: 103,
        class: 'onLoad',
        action: 'refresh',
        ordr: 2,
        content: JSON.stringify(['Grid'])
      },
      {
        xref_id: 104,
        class: 'onClick',
        action: 'setVals',
        ordr: 1,
        content: JSON.stringify([{ method: 'INSERT', ingredient_type_id: null }])
      },
      {
        xref_id: 107,
        class: 'onClick',
        action: 'execDML',
        ordr: 1,
        content: '{}'
      }
    ];

    await sessionManager.updateSession(sessionID, {
      current_step: 'triggers',
      staged_triggers: stagedTriggers
    }, 'Paul');
    console.log(`  ✓ Staged ${stagedTriggers.length} triggers\n`);

    // Step 6: Stage EventSQL
    console.log('Step 6: Staging EventSQL...');
    const stagedEventSQL = [
      {
        qryName: 'ingrTypeList',
        qrySQL: null,
        description: 'Grid query for ingredient_types list'
      },
      {
        qryName: 'ingrTypeDtl',
        qrySQL: null,
        description: 'Form query for ingredient_types detail'
      }
    ];

    await sessionManager.updateSession(sessionID, {
      current_step: 'eventSQL',
      staged_eventsql: stagedEventSQL,
      status: 'ready_to_commit'
    }, 'Paul');
    console.log(`  ✓ Staged ${stagedEventSQL.length} eventSQL entries\n`);

    // Load and display final session
    console.log('Final Session State:');
    const finalSession = await sessionManager.loadSession(sessionID);
    console.log('  Session ID:', finalSession.session_id);
    console.log('  Status:', finalSession.status);
    console.log('  Current Step:', finalSession.current_step);
    console.log('  Components:', finalSession.staged_components?.length || 0);
    console.log('  Props:', finalSession.staged_props?.length || 0);
    console.log('  Triggers:', finalSession.staged_triggers?.length || 0);
    console.log('  EventSQL:', finalSession.staged_eventsql?.length || 0);
    console.log('  ID Mapping:', Object.keys(finalSession.id_mapping).length, 'mappings');

    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

// Run the test
testSessionWorkflow();
