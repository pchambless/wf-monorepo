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
    dead_code: [],
    orphans: [],
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

    // Initial dead code detection (0 dependents, not entry points)
    if (fileDependents.length === 0 && !isEntryPoint(file)) {
        enhanced.files[file].is_dead = true;
        enhanced.dead_code.push({
            file,
            package: pkg,
            dependencies: dependencies.length,
            reason: 'No dependents - potentially unused'
        });
    } else {
        enhanced.files[file].is_dead = false;
    }

    // Track orphans (0 dependencies, 0 dependents)
    if (dependencies.length === 0 && fileDependents.length === 0) {
        enhanced.orphans.push({
            file,
            package: pkg,
            reason: 'No dependencies or dependents - isolated file'
        });
    }
});

// Helper to identify entry points (files that should have 0 dependents)
function isEntryPoint(file) {
    const entryPatterns = [
        /\/index\.(js|jsx|ts|tsx)$/,
        /\/App\.(js|jsx|ts|tsx)$/,
        /\/main\.(js|jsx|ts|tsx)$/,
        /\.config\.(js|ts)$/,
        /\.test\.(js|jsx|ts|tsx)$/,
        /\.spec\.(js|jsx|ts|tsx)$/,
        /craco\.config\.js$/,
        /tailwind\.config\.js$/,
        /postcss\.config\.js$/,
        /babel\.config\.js$/,
        /server\.js$/,
        /app\.js$/,
        /\.(css|scss|less)$/
    ];
    
    return entryPatterns.some(pattern => pattern.test(file));
}

// Transitive dead code detection
function findTransitiveDeadCode() {
    let foundNewDead = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops
    
    while (foundNewDead && iterations < maxIterations) {
        foundNewDead = false;
        iterations++;
        
        Object.keys(enhanced.files).forEach(file => {
            const fileData = enhanced.files[file];
            
            // Skip if already marked as dead or is entry point
            if (fileData.is_dead || isEntryPoint(file)) return;
            
            // Check if all dependents are dead
            const allDependentsDead = fileData.dependents.length > 0 && 
                fileData.dependents.every(dependent => enhanced.files[dependent]?.is_dead);
            
            if (allDependentsDead) {
                fileData.is_dead = true;
                foundNewDead = true;
                
                enhanced.dead_code.push({
                    file,
                    package: fileData.package,
                    dependencies: fileData.dependencies.length,
                    reason: `Transitive dead code - only used by dead files (iteration ${iterations})`
                });
            }
        });
    }
    
    return iterations;
}

// Run transitive dead code detection
const iterations = findTransitiveDeadCode();

// Sort hotspots by dependent count
enhanced.hotspots.sort((a, b) => b.dependents - a.dependents);

// Add summary statistics
enhanced.summary = {
    hotspots: enhanced.hotspots.length,
    dead_code_candidates: enhanced.dead_code.length,
    orphan_files: enhanced.orphans.length,
    high_blast_radius: Object.values(enhanced.files).filter(f => f.blast_radius === 'high').length,
    medium_blast_radius: Object.values(enhanced.files).filter(f => f.blast_radius === 'medium').length,
    low_blast_radius: Object.values(enhanced.files).filter(f => f.blast_radius === 'low').length
};

// Write enhanced analysis
fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2));
console.log(`✅ Enhanced analysis written to ${outputFile}`);
console.log(`📊 Analyzed ${enhanced.metadata.total_files} files`);
console.log(`🔥 Found ${enhanced.hotspots.length} hotspots`);
console.log(`💀 Found ${enhanced.dead_code.length} dead code candidates`);
console.log(`🏝️  Found ${enhanced.orphans.length} orphan files`);