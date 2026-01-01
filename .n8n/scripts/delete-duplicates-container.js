#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();

const dbPath = '/home/node/.n8n/database.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

const duplicateIds = [
  'WKbnUPbM51oqPxqT',
  'hcWLVergHncN9zwh',
  'j4bMIWzzMA4z6SoJ',
  'IwJDrTlU6eTPLdKP',
  'fvM38fuyrTOS75Qd',
  'TYLWkX77dz36XGDn',
  'CqkXbVOu2qqb0hzd',
  'eAWRs9idMuHgN1KF',
  'XPk2traMBYW6wxqX'
];

console.log(`\n🗑️  Deleting ${duplicateIds.length} duplicate workflows...\n`);

const placeholders = duplicateIds.map(() => '?').join(',');
const deleteQuery = `DELETE FROM workflow_entity WHERE id IN (${placeholders})`;

db.run(deleteQuery, duplicateIds, function(err) {
  if (err) {
    console.error('❌ Error deleting workflows:', err.message);
    db.close();
    process.exit(1);
  }

  console.log(`✅ Successfully deleted ${this.changes} workflows\n`);

  db.all(
    `SELECT id, name, active, updatedAt 
     FROM workflow_entity 
     WHERE name = 'Module Dependency Analysis'`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error verifying:', err.message);
      } else {
        console.log('Remaining "Module Dependency Analysis" workflows:');
        console.table(rows);
      }
      db.close();
    }
  );
});
