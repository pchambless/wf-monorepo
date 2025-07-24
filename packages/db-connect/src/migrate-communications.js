const query = require('../query');
const fs = require('fs');
const path = require('path');

async function migrateCommunications() {
    try {
        // Read coordination log
        const coordLogPath = path.join(__dirname, '../../../.kiro/communication/coordination-log.json');
        const coordLog = JSON.parse(fs.readFileSync(coordLogPath, 'utf8'));

        console.log(`Found ${coordLog.communications.length} communications to migrate...`);

        // Plan mapping from coordination log references to database IDs
        const planMapping = {
            '0011': 11,  // Complete DML Process
            '0012': 12,  // React-PDF Worksheet System
            '0013': 13,  // Server Log Enhancements
            '0016': 16,  // User Communication Interface
            // Add others as needed
        };

        // Insert each communication
        for (const comm of coordLog.communications) {
            // Extract plan ID
            let planId = 0;
            if (comm.affects_plan) {
                planId = planMapping[comm.affects_plan] || 0;
            } else if (comm.related_plan) {
                planId = planMapping[comm.related_plan] || 0;
            }

            const sql = `
                  INSERT INTO api_wf.plan_communications
                  (plan_id, from_agent, to_agent, type, subject, message, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
              `;

            // Convert ISO timestamp to MySQL format
            //        const mysqlTimestamp = new Date(comm.timestamp).toISOString().slice(0, 19).replace('T', ' ');

            const result = await query(sql, [
                planId,
                comm.from || 'unknown',
                comm.to || 'unknown',
                comm.type || 'general',
                comm.subject || 'No Subject',
                comm.description || comm.message || '',
                comm.status || 'pending'
            ]);

            console.log(`Inserted communication: ${comm.subject} (ID: ${result.insertId}) -> Plan ${planId || 0}`);
        }

        console.log('Communications migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateCommunications();