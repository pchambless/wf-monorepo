const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get list of all utility files
const utilsDir = path.join(__dirname, 'apps/wf-client/src/utils');
const getAllFiles = (dir) => {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      files.push(fullPath);
    }
  });
  return files;
};

const allUtilFiles = getAllFiles(utilsDir);

// Find which files are imported
const results = {};
allUtilFiles.forEach(file => {
  const relativePath = path.relative(path.join(__dirname, 'apps/wf-client/src'), file)
    .replace(/\\/g, '/');
  
  const utilName = path.basename(file, path.extname(file));
  
  try {
    // Search for imports using this utility
    const grepCmd = `grep -r --include="*.js" --include="*.jsx" "from '@utils/${relativePath.replace(/^utils\//, '').replace(/\.js$/, '')}" apps/wf-client/src/`;
    const output = execSync(grepCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    
    results[relativePath] = {
      isUsed: output.trim().length > 0,
      usageCount: output.trim().split('\n').length,
      file: relativePath
    };
  } catch (e) {
    // grep returns non-zero exit code when no matches found
    results[relativePath] = {
      isUsed: false,
      usageCount: 0,
      file: relativePath
    };
  }
});

// Output results
console.log("=== UTILITY FILES ANALYSIS ===");
console.log("\nUNUSED FILES:");
Object.values(results)
  .filter(r => !r.isUsed)
  .forEach(r => console.log(`- ${r.file}`));

console.log("\nUSED FILES:");
Object.values(results)
  .filter(r => r.isUsed)
  .sort((a, b) => b.usageCount - a.usageCount)
  .forEach(r => console.log(`- ${r.file} (${r.usageCount} imports)`));