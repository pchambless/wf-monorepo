#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('\n=== Workflow Entity Table Schema ===\n');
db.all(`PRAGMA table_info(workflow_entity)`, [], (err, columns) => {
  if (err) {
    console.error('Error getting schema:', err.message);
  } else {
    console.table(columns);
  }

  console.log('\n=== Sample Workflow Data ===\n');
  db.all(`SELECT * FROM workflow_entity WHERE active = 1 LIMIT 2`, [], (err, rows) => {
    if (err) {
      console.error('Error querying:', err.message);
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }

    console.log('\n=== Workflow Count by Status ===\n');
    db.all(`
      SELECT 
        active,
        COUNT(*) as count,
        GROUP_CONCAT(name, ', ') as workflow_names
      FROM workflow_entity 
      GROUP BY active
    `, [], (err, rows) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.table(rows);
      }
      db.close();
    });
  });
});
