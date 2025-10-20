#!/usr/bin/env node
/**
 * Analyze dependencies for a specific app or folder
 * Usage: node analyze-app.js studio
 *        node analyze-app.js server
 *        node analyze-app.js packages/shared-imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targetPath = process.argv[2];
if (!targetPath) {
  console.error('❌ Usage: node analyze-app.js <app-name|folder-path>');
  console.error('   Examples:');
  console.error('     node analyze-app.js studio');
  console.error('     node analyze-app.js server');
  console.error('     node analyze-app.js packages/shared-imports');
  process.exit(1);
}

// Normalize path (handle both "studio" and "apps/studio")
const normalizedPath = targetPath.startsWith('apps/') || targetPath.startsWith('packages/')
  ? targetPath
  : `apps/${targetPath}`;

// Read full madge analysis
const madgeFile = path.join(__dirname, './output/monorepo/madge-analysis.json');
const fullAnalysis = JSON.parse(fs.readFileSync(madgeFile, 'utf8'));

// Filter to target app/folder
const scopedFiles = {};
const externalDeps = new Set();
const internalHotspots = [];

Object.entries(fullAnalysis.files).forEach(([file, data]) => {
  if (file.startsWith(normalizedPath)) {
    // Track dependencies
    const internal = data.dependencies.filter(dep => dep.startsWith(normalizedPath));
    const external = data.dependencies.filter(dep => !dep.startsWith(normalizedPath));
    
    external.forEach(dep => externalDeps.add(dep));
    
    scopedFiles[file] = {
      ...data,
      internal_dependencies: internal,
      external_dependencies: external,
      internal_dep_count: internal.length,
      external_dep_count: external.length
    };
    
    // Track internal hotspots
    if (data.dependent_count >= 3) {
      internalHotspots.push({
        file,
        dependents: data.dependent_count,
        blast_radius: data.blast_radius
      });
    }
  }
});

// Build scoped analysis
const scopedAnalysis = {
  metadata: {
    scope: normalizedPath,
    generated: new Date().toISOString(),
    total_files: Object.keys(scopedFiles).length,
    external_dependencies: externalDeps.size
  },
  files: scopedFiles,
  hotspots: internalHotspots.sort((a, b) => b.dependents - a.dependents),
  external_dependencies: Array.from(externalDeps).sort(),
  statistics: {
    total_files: Object.keys(scopedFiles).length,
    total_dependencies: Object.values(scopedFiles).reduce((sum, f) => sum + f.dependency_count, 0),
    internal_dependencies: Object.values(scopedFiles).reduce((sum, f) => sum + f.internal_dep_count, 0),
    external_dependencies: Object.values(scopedFiles).reduce((sum, f) => sum + f.external_dep_count, 0),
    hotspots: internalHotspots.length,
    high_blast_radius: Object.values(scopedFiles).filter(f => f.blast_radius === 'high').length,
    medium_blast_radius: Object.values(scopedFiles).filter(f => f.blast_radius === 'medium').length
  }
};

// Write output (always to same file for easy consumption by populate script)
const outputFile = path.join(__dirname, `./output/monorepo/analysis.json`);
fs.writeFileSync(outputFile, JSON.stringify(scopedAnalysis, null, 2));

console.log(`✅ Analysis written to ${outputFile}`);
console.log(`📊 Statistics for ${normalizedPath}:`);
console.log(`   📁 Files analyzed: ${scopedAnalysis.statistics.total_files}`);
console.log(`   🔗 Internal dependencies: ${scopedAnalysis.statistics.internal_dependencies}`);
console.log(`   🌐 External dependencies: ${scopedAnalysis.statistics.external_dependencies}`);
console.log(`   🔥 Hotspots (3+ dependents): ${scopedAnalysis.statistics.hotspots}`);
console.log(`   ⚠️  High blast radius: ${scopedAnalysis.statistics.high_blast_radius}`);
console.log(`\n📦 Key external dependencies:`);
externalDeps.forEach(dep => {
  if (dep.startsWith('packages/')) {
    console.log(`   - ${dep}`);
  }
});
