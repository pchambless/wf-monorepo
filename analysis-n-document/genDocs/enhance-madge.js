#!/usr/bin/env node
/**
 * Enhanced Madge Analysis Script
 * Transforms raw Madge dependency data into architectural intelligence
 * Also generates a Claude-optimized project.index.json for AI agents
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const rawFile = path.join(__dirname, './output/monorepo/raw-madge.json');
const outputFile = path.join(__dirname, './output/monorepo/madge-analysis.json');
const indexOutputFile = path.join(__dirname, './output/monorepo/project.index.json');

// Read raw madge data
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
  if (file.startsWith('apps/whatsfresh/')) return 'whatsfresh';
  if (file.startsWith('apps/server/')) return 'server';
  if (file.startsWith('apps/api-gateway/')) return 'api-gateway';
  if (file.startsWith('apps/admin/')) return 'admin';
  if (file.startsWith('apps/studio/')) return 'studio';
  if (file.startsWith('apps/wf-studio/')) return 'wf-studio'; // Legacy
  if (file.startsWith('apps/login/')) return 'login';
  if (file.startsWith('apps/planner/')) return 'planner';
  if (file.startsWith('packages/shared-imports/')) return 'shared-imports';
  if (file.startsWith('packages/db-connect/')) return 'db-connect';
  return 'other';
};

const getBlastRadius = (count) => {
  if (count >= 8) return 'high';
  if (count >= 4) return 'medium';
  return 'low';
};

// Enhanced analysis structure
const enhanced = {
  metadata: {
    generated: new Date().toISOString(),
    total_files: Object.keys(rawData).length
  },
  files: {},
  hotspots: [],
  packages: {}
};

// Initialize package breakdown
const knownPackages = [
  'whatsfresh', 'server', 'admin', 'studio', 'wf-studio',
  'login', 'planner', 'shared-imports', 'db-connect', 'other'
];
knownPackages.forEach(pkg => {
  enhanced.packages[pkg] = 0;
});

// Project index structure
const projectIndex = {
  project: {
    name: "wf-monorepo-new",
    description: "Modular orchestration system with enhanced dependency and dead code analysis.",
    agentRole: "Assist with pruning, tagging, and orchestrating modular flows for cockpit visibility."
  },
  modules: []
};

// Analyze each file
Object.keys(rawData).forEach(file => {
  const dependencies = rawData[file] || [];
  const fileDependents = dependents[file] || [];
  const pkg = getPackage(file);
  const blast = getBlastRadius(fileDependents.length);

  enhanced.packages[pkg]++;

  const fileData = {
    dependencies,
    dependents: fileDependents,
    dependency_count: dependencies.length,
    dependent_count: fileDependents.length,
    blast_radius: blast,
    package: pkg
  };

  enhanced.files[file] = fileData;

  // Track hotspots (5+ dependents)
  if (fileDependents.length >= 5) {
    enhanced.hotspots.push({
      file,
      dependents: fileDependents.length,
      blast_radius: blast,
      package: pkg
    });
  }

  // Build project index entry
  const tags = [pkg];
  if (file.includes('controller')) tags.push('controller');
  if (file.includes('utils')) tags.push('utility');
  if (file.includes('routes')) tags.push('routing');

  const critical = blast !== 'low' || fileDependents.length >= 3;

  projectIndex.modules.push({
    file,
    purpose: `Auto-inferred from dependency graph. ${fileDependents.length} dependents.`,
    tags,
    critical,
    blastRadius: blast,
    contextHint: `Use when an AI agent is orchestrating flows involving ${pkg}.`
  });
});

// Sort hotspots by dependent count
enhanced.hotspots.sort((a, b) => b.dependents - a.dependents);

// Write outputs
fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2));
fs.writeFileSync(indexOutputFile, JSON.stringify(projectIndex, null, 2));

console.log(`✅ Enhanced analysis written to ${outputFile}`);
console.log(`📁 Project index written to ${indexOutputFile}`);
console.log(`📊 Analyzed ${enhanced.metadata.total_files} files`);
console.log(`🔥 Found ${enhanced.hotspots.length} hotspots`);
