// Test script for targeted schema analysis
import { runTargetedAnalysis, findClientEventTypesUsingQry } from './apps/wf-studio/src/utils/targetedAnalysis.js';

// Get qry from command line argument
const targetQry = process.argv[2] || 'planDtl';
const app = 'plans'; // Could also be a parameter

async function testTargetedAnalysis() {
    console.log(`🧪 Testing Targeted Schema Analysis for qry: ${targetQry}\n`);

    // Test 1: Client eventType change using specified qry
    console.log(`Test 1: Client eventType change for qry: ${targetQry}`);
    try {
        const result1 = await runTargetedAnalysis({
            eventType: `form${targetQry.replace('Dtl', '').replace('List', '')}`, // Rough guess at eventType name
            qryName: targetQry,
            app: app,
            showJSON: false // Set to true to see schema details
        });
        console.log('✅ Test 1 Result:', result1.success ? 'PASSED' : 'FAILED');
        if (!result1.success) console.log('❌ Error:', result1.reason || result1.error);
        if (result1.success) {
            console.log('Updated schemas:', result1.updatedSchemas);
            console.log('Affected tables:', result1.affectedTables);
        }
    } catch (err) {
        console.log('❌ Test 1 FAILED:', err.message);
    }

    console.log('\n---\n');

    // Test 2: Find client eventTypes using the specified qry
    console.log(`Test 2: Find client eventTypes using ${targetQry} qry`);
    try {
        const result2 = await findClientEventTypesUsingQry(targetQry, app);
        console.log('✅ Test 2 Result:', result2.length > 0 ? 'PASSED' : 'FAILED');
        console.log('Found eventTypes:', result2.map(et => et.name));
        if (result2.length > 0) {
            console.log('Categories:', result2.map(et => et.category));
        }
    } catch (err) {
        console.log('❌ Test 2 FAILED:', err.message);
    }

    console.log('\n---\n');

    // Test 3: Server eventType change simulation
    console.log(`Test 3: Server eventType ${targetQry} change simulation`);
    try {
        const result3 = await runTargetedAnalysis({
            eventType: targetQry,
            qryName: targetQry,
            app: app,
            showJSON: false
        });
        console.log('✅ Test 3 Result:', result3.success ? 'PASSED' : 'FAILED');
        if (result3.success) {
            console.log('Updated schemas:', result3.updatedSchemas);
            console.log('Affected tables:', result3.affectedTables);
        }
    } catch (err) {
        console.log('❌ Test 3 FAILED:', err.message);
    }

    console.log(`\n🎯 Usage: node test-targeted-analysis.js [qryName]`);
    console.log(`   Examples: node test-targeted-analysis.js planList`);
    console.log(`            node test-targeted-analysis.js planDtl`);
}

testTargetedAnalysis().catch(console.error);
