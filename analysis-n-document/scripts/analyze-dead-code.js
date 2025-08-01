#!/usr/bin/env node
/**
 * Dead Code Analysis for AI Documentation
 * Enhanced version of madge analysis optimized for Claude/Kiro consumption
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '../../');
const OUTPUT_DIR = path.join(ROOT_DIR, 'analysis-n-document/output');
const PUBLIC_DIR = path.join(ROOT_DIR, 'apps/wf-client/public/analysis-data');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

/**
 * Enhanced madge analysis with AI-friendly structure
 */
function enhanceMadgeData(rawData) {
  console.log('📊 Enhancing madge data for AI consumption...');
  
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

  const isEntryPoint = (file) => {
    const entryPatterns = [
      /\/index\.(js|jsx|ts|tsx)$/,
      /\/App\.(js|jsx|ts|tsx)$/,
      /\/main\.(js|jsx|ts|tsx)$/,
      /\.config\.(js|ts)$/,
      /\.test\.(js|jsx|ts|tsx)$/,
      /server\.js$/,
      /app\.js$/
    ];
    return entryPatterns.some(pattern => pattern.test(file));
  };

  // Enhanced analysis structure optimized for AI
  const enhanced = {
    metadata: {
      generated: new Date().toISOString(),
      total_files: Object.keys(rawData).length,
      analysis_type: 'dead_code_detection',
      ai_optimized: true
    },
    ai_summary: {
      purpose: "Dead code detection and blast radius analysis for AI agents",
      high_priority_removals: [],
      risky_removals: [],
      safe_removals: []
    },
    files: {},
    dead_code_candidates: [],
    critical_dependencies: [],
    package_breakdown: { 'wf-client': 0, 'wf-server': 0, 'shared-imports': 0, 'other': 0 }
  };

  // Analyze each file
  Object.keys(rawData).forEach(file => {
    const dependencies = rawData[file] || [];
    const fileDependents = dependents[file] || [];
    const pkg = getPackage(file);
    
    enhanced.package_breakdown[pkg]++;
    
    const fileAnalysis = {
      dependencies,
      dependents: fileDependents,
      dependency_count: dependencies.length,
      dependent_count: fileDependents.length,
      blast_radius: getBlastRadius(fileDependents.length),
      package: pkg,
      is_entry_point: isEntryPoint(file),
      is_dead: fileDependents.length === 0 && !isEntryPoint(file),
      ai_notes: []
    };

    // Add AI-helpful notes
    if (fileAnalysis.is_dead) {
      if (file.includes('test') || file.includes('spec')) {
        fileAnalysis.ai_notes.push("Test file - safe to remove if unused");
      } else if (file.includes('config')) {
        fileAnalysis.ai_notes.push("Config file - verify not used at runtime");
      } else if (pkg === 'wf-client' && file.includes('/pages/')) {
        fileAnalysis.ai_notes.push("Page component - check if used by routing");
      }
    }

    enhanced.files[file] = fileAnalysis;

    // Categorize for AI summary
    if (fileAnalysis.is_dead) {
      const candidate = {
        file,
        package: pkg,
        reason: "No dependents found",
        ai_safety_level: "unknown"
      };

      if (file.includes('test') || file.includes('.test.')) {
        candidate.ai_safety_level = "safe";
        enhanced.ai_summary.safe_removals.push(candidate);
      } else if (fileAnalysis.blast_radius === 'high') {
        candidate.ai_safety_level = "risky";
        enhanced.ai_summary.risky_removals.push(candidate);
      } else {
        candidate.ai_safety_level = "medium";
        enhanced.ai_summary.high_priority_removals.push(candidate);
      }

      enhanced.dead_code_candidates.push(candidate);
    }

    // Track critical dependencies
    if (fileDependents.length >= 5) {
      enhanced.critical_dependencies.push({
        file,
        dependent_count: fileDependents.length,
        blast_radius: fileAnalysis.blast_radius,
        package: pkg,
        ai_impact: fileDependents.length >= 10 ? "BREAKING_CHANGE_RISK" : "HIGH_IMPACT"
      });
    }
  });

  // Sort for AI prioritization
  enhanced.critical_dependencies.sort((a, b) => b.dependent_count - a.dependent_count);
  enhanced.ai_summary.high_priority_removals.sort((a, b) => a.file.localeCompare(b.file));

  return enhanced;
}

async function analyzeDeadCode() {
  console.log('🔍 Starting dead code analysis...');
  
  try {
    // Generate raw madge data
    console.log('📊 Generating dependency graph...');
    const rawMadgeOutput = path.join(OUTPUT_DIR, 'raw-madge.json');
    execSync(`madge . --json > "${rawMadgeOutput}"`, { cwd: ROOT_DIR });
    
    // Read and enhance the data
    const rawData = JSON.parse(fs.readFileSync(rawMadgeOutput, 'utf8'));
    const enhanced = enhanceMadgeData(rawData);
    
    // Write AI-optimized analysis
    const outputFile = path.join(OUTPUT_DIR, 'dead-code-analysis.json');
    fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2));
    
    // Copy to public for dashboard
    const publicFile = path.join(PUBLIC_DIR, 'madge-analysis.json');
    fs.writeFileSync(publicFile, JSON.stringify(enhanced, null, 2));
    
    console.log(`✅ Dead code analysis complete!`);
    console.log(`📁 AI-optimized output: ${outputFile}`);
    console.log(`🌐 Dashboard copy: ${publicFile}`);
    console.log(`📊 Summary:`);
    console.log(`   💀 Dead code candidates: ${enhanced.dead_code_candidates.length}`);
    console.log(`   🔥 Critical dependencies: ${enhanced.critical_dependencies.length}`);
    console.log(`   ✅ Safe removals: ${enhanced.ai_summary.safe_removals.length}`);
    console.log(`   ⚠️  Risky removals: ${enhanced.ai_summary.risky_removals.length}`);
    
  } catch (error) {
    console.error('❌ Dead code analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeDeadCode();
}

export { analyzeDeadCode };