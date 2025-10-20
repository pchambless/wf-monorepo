#!/usr/bin/env node
/**
 * Create database load files from full madge-analysis.json
 * Transforms complete monorepo dependency graph into modules/dependencies format
 * Usage: node create-load-files.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const madgeFile = path.join(__dirname, './output/monorepo/madge-analysis.json');
const outputFile = path.join(__dirname, './output/monorepo/analysis.json');

console.log('📊 Reading full madge analysis...');
const madgeAnalysis = JSON.parse(fs.readFileSync(madgeFile, 'utf8'));

console.log(`📁 Total files: ${Object.keys(madgeAnalysis.files).length}`);

// Transform to analysis.json format
const analysis = {
  metadata: {
    scope: 'monorepo',
    generated: new Date().toISOString(),
    total_files: Object.keys(madgeAnalysis.files).length
  },
  files: madgeAnalysis.files
};

fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

console.log(`✅ Load file created: ${outputFile}`);
console.log(`📦 Ready for: npm run analyze:populate-db`);
