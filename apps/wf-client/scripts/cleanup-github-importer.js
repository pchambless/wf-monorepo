/**
 * Script to cleanup GitHub Issue Importer files
 * 
 * This script helps organize files by:
 * 1. Moving any useful components to the standalone app
 * 2. Creating a backup of files being removed
 * 3. Removing the GitHub Issue Importer code from the main app
 */
const fs = require('fs');
const path = require('path');

// Paths
const CLIENT_ROOT = path.resolve(__dirname, '..');
const GITHUB_APP_ROOT = path.resolve(CLIENT_ROOT, '..', 'wf-github');
const BACKUP_DIR = path.resolve(CLIENT_ROOT, 'backup', 'github-importer-backup');

// Files to process
const filesToBackupAndRemove = [
  'src/admin/IssueImporter/index.js',
  'src/admin/IssueImporter/IssueList.js',
  'src/admin/IssueImporter/api.js',
  'src/admin/IssueImporter/formatter.js',
  'src/admin/IssueImporter/TokenInput.js',
  'src/admin/GitHubDownloader.js'
];

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Process each file
filesToBackupAndRemove.forEach(relPath => {
  const fullPath = path.join(CLIENT_ROOT, relPath);
  const backupPath = path.join(BACKUP_DIR, relPath);
  const backupDir = path.dirname(backupPath);
  
  // Skip if file doesn't exist
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent file: ${relPath}`);
    return;
  }
  
  try {
    // Create backup directory if needed
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy to backup
    fs.copyFileSync(fullPath, backupPath);
    console.log(`Backed up: ${relPath} to ${backupPath}`);
    
    // Delete original file
    fs.unlinkSync(fullPath);
    console.log(`Removed: ${relPath}`);
  } catch (error) {
    console.error(`Error processing ${relPath}:`, error);
  }
});

console.log('GitHub Issue Importer cleanup complete!');
console.log(`Backup files are stored in: ${BACKUP_DIR}`);
console.log('The standalone GitHub Issue Downloader app is available in:');
console.log(GITHUB_APP_ROOT);
