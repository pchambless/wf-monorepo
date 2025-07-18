#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read impact tracking JSON
const impactFile = path.join(__dirname, '..', 'impact-tracking.json');
const data = JSON.parse(fs.readFileSync(impactFile, 'utf8'));

// Sort by file and display
const sortedImpacts = data.impacts
  .sort((a, b) => a.file.localeCompare(b.file))
  .map(impact => `${impact.file} - ${impact.description} (${impact.status})`);

console.log('Impact Summary (sorted by file):');
console.log('================================');
sortedImpacts.forEach(impact => console.log(impact));