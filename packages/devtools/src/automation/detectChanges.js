#!/usr/bin/env node

/**
 * Change Detection for SQL Views
 * Detects modified SQL views and suggests appropriate generator commands
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const sqlViewsPath = path.resolve(__dirname, '../../../sql/views/client');
const cacheFile = path.resolve(__dirname, 'data/.view-hashes.json');

/**
 * Calculate file hash for change detection
 */
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Load previous hashes from cache
 */
function loadPreviousHashes() {
  try {
    const cacheContent = fs.readFileSync(cacheFile, 'utf8');
    return JSON.parse(cacheContent);
  } catch (error) {
    return {};
  }
}

/**
 * Save current hashes to cache
 */
function savePreviousHashes(hashes) {
  const cacheDir = path.dirname(cacheFile);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(cacheFile, JSON.stringify(hashes, null, 2));
}

/**
 * Get all SQL view files
 */
function getSqlViewFiles() {
  if (!fs.existsSync(sqlViewsPath)) {
    console.warn(`⚠️  SQL views directory not found: ${sqlViewsPath}`);
    return [];
  }
  
  return fs.readdirSync(sqlViewsPath)
    .filter(file => file.endsWith('.sql'))
    .map(file => ({
      name: file.replace('.sql', ''),
      path: path.join(sqlViewsPath, file)
    }));
}

/**
 * Main change detection function
 */
async function detectChanges() {
  console.log('🔍 Detecting SQL view changes...');
  
  const sqlFiles = getSqlViewFiles();
  const previousHashes = loadPreviousHashes();
  const currentHashes = {};
  const changedViews = [];
  
  // Check each SQL file for changes
  for (const { name, path: filePath } of sqlFiles) {
    const currentHash = getFileHash(filePath);
    currentHashes[name] = currentHash;
    
    const previousHash = previousHashes[name];
    
    if (previousHash !== currentHash) {
      changedViews.push(name);
      console.log(`🔄 Changed: ${name}`);
    }
  }
  
  // Save current hashes
  savePreviousHashes(currentHashes);
  
  // Report results
  if (changedViews.length === 0) {
    console.log('✅ No SQL view changes detected');
    return;
  }
  
  console.log(`\\n📋 ${changedViews.length} view(s) changed:`);
  
  // Generate suggested commands
  console.log('\\n🚀 Suggested commands:');
  
  for (const viewName of changedViews) {
    console.log(`node src/automation/runTriggered.js ${viewName}`);
  }
  
  console.log('\\n💡 Or run all triggered generators at once:');
  console.log('node src/automation/runCore.js');
  
  return changedViews;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  detectChanges().catch(console.error);
}

export { detectChanges };