const query = require('../query');
const fs = require('fs');
const path = require('path');

async function migratePlanImpacts() {
    try {
        // Read impact tracking
        const impactPath = path.join(__dirname, '../../../claude-plans/impact-tracking.json');
        const impactData = JSON.parse(fs.readFileSync(impactPath, 'utf8'));

        console.log(`Found ${impactData.impacts.length} impacts to migrate...`);

        // Map plan_id strings to database IDs
        const planMapping = {
            '0011': 11, '0012': 12, '0013': 13, '0016': 16,
            // Add others as needed
        };

        // Insert each impact
        for (const impact of impactData.impacts) {
            let planId = planMapping[impact.plan_id] || 0; // Default to orphans

            const sql = `
                  INSERT INTO api_wf.plan_impacts
                  (plan_id, file_path, change_type, status, description, created_at, created_by)
                  VALUES (?, ?, ?, ?, ?, NOW(), ?)
              `;

            const result = await query(sql, [
                planId,
                impact.file || 'Unknown',
                impact.type || 'modify',
                impact.status || 'pending',
                impact.description || '',
                'migration'
            ]);

            console.log(`Inserted impact: ${impact.file} (ID: ${result.insertId}) -> Plan ${planId}`);
        }

        console.log('Plan impacts migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migratePlanImpacts();