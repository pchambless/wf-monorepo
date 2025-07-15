#!/usr/bin/env node

/**
 * Triggered Automation Runner
 * Runs supporting generators when SQL views change
 * Usage: node runTriggered.js [viewName]
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viewName = process.argv[2];

if (!viewName) {
  console.error('❌ Error: Please provide a view name');
  console.log('Usage: node runTriggered.js [viewName]');
  console.log('Example: node runTriggered.js ingrList');
  process.exit(1);
}

const triggeredGenerators = [
  'triggered/genDirectives.js',
  'triggered/genSampleData.js'
];

console.log(`🔄 Running triggered generators for view: ${viewName}`);

for (const generator of triggeredGenerators) {
  const generatorPath = path.join(__dirname, generator);
  
  console.log(`\n📋 Running ${generator} for ${viewName}...`);
  
  try {
    const result = spawn('node', [generatorPath, viewName], { 
      stdio: 'inherit',
      cwd: path.dirname(generatorPath)
    });
    
    await new Promise((resolve, reject) => {
      result.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${generator} completed successfully for ${viewName}`);
          resolve();
        } else {
          console.error(`❌ ${generator} failed with code ${code}`);
          reject(new Error(`Generator failed: ${generator}`));
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error running ${generator}:`, error.message);
    process.exit(1);
  }
}

console.log(`\n🎉 All triggered generators completed successfully for ${viewName}!`);