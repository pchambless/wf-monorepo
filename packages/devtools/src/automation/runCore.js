#!/usr/bin/env node

/**
 * Core Automation Runner
 * Runs operational generators that should always be executed
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const coreGenerators = [
  'core/genPageMaps.js'
];

console.log('🚀 Running core operational generators...');

for (const generator of coreGenerators) {
  const generatorPath = path.join(__dirname, generator);
  
  console.log(`\n📋 Running ${generator}...`);
  
  try {
    const result = spawn('node', [generatorPath], { 
      stdio: 'inherit',
      cwd: path.dirname(generatorPath)
    });
    
    await new Promise((resolve, reject) => {
      result.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${generator} completed successfully`);
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

console.log('\n🎉 All core generators completed successfully!');