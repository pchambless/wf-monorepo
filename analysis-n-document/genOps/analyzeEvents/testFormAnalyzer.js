import { FormEventTypeAnalyzer } from './shared/formEventTypeAnalyzer.js';

async function testFormAnalyzer() {
    try {
        console.log('🚀 Testing FormEventTypeAnalyzer for plans app...');
        
        const analyzer = new FormEventTypeAnalyzer('plans');
        const fieldMappings = await analyzer.analyzeFormEventTypes();
        
        console.log('\n📊 Field Mappings Results:');
        for (const [entityName, mapping] of Object.entries(fieldMappings)) {
            console.log(`\n🔧 Entity: ${entityName}`);
            console.log(`   📄 EventType: ${mapping.eventType}`);
            console.log(`   🗃️  DB Table: ${mapping.dbTable}`);
            console.log(`   🔑 Primary Key: ${mapping.primaryKey}`);
            console.log(`   📋 Fields (${mapping.fields.length}): ${mapping.fields.join(', ')}`);
        }
        
        // Write output
        await analyzer.writeOutput();
        
        const summary = analyzer.generateSummary();
        console.log(`\n🎉 Analysis Complete:`);
        console.log(`   📄 Form EventTypes: ${summary.totalFormEventTypes}`);
        console.log(`   🗃️  Entities: ${summary.totalEntities}`);
        console.log(`   📋 Total Fields: ${summary.totalFieldsUsedInForms}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testFormAnalyzer();