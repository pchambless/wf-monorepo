const query = require('../query');
const fs = require('fs');
const path = require('path');

async function migratePlans() {
    try {
        // Read plan registry
        const registryPath = path.join(__dirname, '../../../claude-plans/plan-registry.json');
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

        console.log(`Found ${registry.plans.length} plans to migrate...`);

        // Insert each plan
        for (const plan of registry.plans) {
            const sql = `
          INSERT INTO api_wf.plans (cluster, name, status, priority, description, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

            const result = await query(sql, [
                plan.cluster || 'UNKNOWN',
                plan.name,
                plan.status || 'pending',
                plan.priority || 'medium',
                plan.description || '',
                'migration'
            ]);

            console.log(`Inserted plan: ${plan.name} (ID: ${result.insertId})`);
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migratePlans();