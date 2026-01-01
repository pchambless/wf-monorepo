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

console.log('\n=== Active Workflows ===\n');
db.all('SELECT id, name, active FROM workflow_entity WHERE active = 1', [], (err, rows) => {
  if (err) {
    console.error('Error querying active workflows:', err.message);
  } else {
    console.table(rows);
  }

  console.log('\n=== Module Dependency Analysis Workflows ===\n');
  db.all(
    `SELECT id, name, active, createdAt, updatedAt 
     FROM workflow_entity 
     WHERE name = 'Module Dependency Analysis' 
     ORDER BY updatedAt DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error querying duplicates:', err.message);
      } else {
        console.table(rows);
      }
      db.close();
    }
  );
});
