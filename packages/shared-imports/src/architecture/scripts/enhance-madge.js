#!/usr/bin/env node
/**
 * Enhanced Madge Analysis Script
 * Transforms raw Madge dependency data into architectural intelligence
 */

const fs = require('fs');
const path = require('path');

// Read raw madge data
const rawFile = path.join(__dirname, '../data/raw-madge.json');
const outputFile = path.join(__dirname, '../data/madge-analysis.json');
const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));

// Build reverse dependency map
const dependents = {};
Object.keys(rawData).forEach(file => {
    rawData[file].forEach(dep => {
        if (!dependents[dep]) dependents[dep] = [];
        dependents[dep].push(file);
    });
});

// Helper functions
const getPackage = (file) => {
    if (file.startsWith('apps/wf-client/')) return 'wf-client';
    if (file.startsWith('apps/wf-server/')) return 'wf-server';
    if (file.startsWith('packages/shared-imports/')) return 'shared-imports';
    return 'other';
};

const getBlastRadius = (count) => {
    if (count >= 8) return 'high';
    if (count >= 4) return 'medium';
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
    packages: { 'wf-client': 0, 'wf-server': 0, 'shared-imports': 0, 'other': 0 }
};

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