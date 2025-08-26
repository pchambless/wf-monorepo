#!/usr/bin/env node
/**
 * Enhanced Madge Analysis Script
 * Transforms raw Madge dependency data into architectural intelligence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAppDirectory } from '../config/appNames.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read raw madge data
const rawFile = path.join(__dirname, './output/monorepo/raw-madge.json');
const outputFile = path.join(__dirname, './output/monorepo/madge-analysis.json');
const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));

// Build reverse dependency map
const dependents = {};
Object.keys(rawData).forEach(file => {
  rawData[file].forEach(dep => {
    if (!dependents[dep]) {
      dependents[dep] = [];
    }
    dependents[dep].push(file);
  });
});

// Helper functions
const getPackage = (file) => {
  const clientDir = getAppDirectory('client');
  const serverDir = getAppDirectory('server');

  if (file.startsWith(`apps/${clientDir}/`)) {
    return clientDir;
  }
  if (file.startsWith(`apps/${serverDir}/`)) {
    return serverDir;
  }
  if (file.startsWith('packages/shared-imports/')) {
    return 'shared-imports';
  }
  return 'other';
};

const getBlastRadius = (count) => {
  if (count >= 8) {
    return 'high';
  }
  if (count >= 4) {
    return 'medium';
  }
  return 'low';
};

// Enhanced analysis
const enhanced = {
  metadata: {
    generated: new Date().toISOString(),
    total_files: Object.keys(rawData).length
  },
  files: {},
  hotspots: [],
  packages: {}
};

// Initialize package breakdown with dynamic names
const clientDir = getAppDirectory('client');
const serverDir = getAppDirectory('server');
enhanced.packages[clientDir] = 0;
enhanced.packages[serverDir] = 0;
enhanced.packages['shared-imports'] = 0;
enhanced.packages['other'] = 0;

// Analyze each file
Object.keys(rawData).forEach(file => {
  const dependencies = rawData[file] || [];
  const fileDependents = dependents[file] || [];
  const pkg = getPackage(file);

  enhanced.packages[pkg]++;

  const fileData = {
    dependencies,
    dependents: fileDependents,
    dependency_count: dependencies.length,
    dependent_count: fileDependents.length,
    blast_radius: getBlastRadius(fileDependents.length),
    package: pkg
  };

  enhanced.files[file] = fileData;

  // Track hotspots (5+ dependents)
  if (fileDependents.length >= 5) {
    enhanced.hotspots.push({
      file,
      dependents: fileDependents.length,
      blast_radius: fileData.blast_radius,
      package: pkg
    });
  }
});

// Sort hotspots by dependent count
enhanced.hotspots.sort((a, b) => b.dependents - a.dependents);

// Write enhanced analysis
fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2));
console.log(`✅ Enhanced analysis written to ${outputFile}`);
console.log(`📊 Analyzed ${enhanced.metadata.total_files} files`);
console.log(`🔥 Found ${enhanced.hotspots.length} hotspots`);