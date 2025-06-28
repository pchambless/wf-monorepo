export async function getSampleData(entityName, pageMap) {
  const fs = require('fs').promises;
  const path = require('path');
  
  // First try to load real sample data
  const samplePath = path.join(__dirname, '../../samples', `${entityName}.json`);
  
  try {
    // Check if sample file exists
    const stats = await fs.stat(samplePath);
    if (stats.isFile()) {
      console.log(`Using real sample data from ${samplePath}`);
      const sampleContent = await fs.readFile(samplePath, 'utf8');
      const allSamples = JSON.parse(sampleContent);
      
      // Limit to first 3 rows for display purposes
      return allSamples.slice(0, 3);
    }
  } catch (err) {
    // File doesn't exist or other error, fall back to generated data
    console.log(`No sample file found at ${samplePath}, generating mock data`);
  }
  
}