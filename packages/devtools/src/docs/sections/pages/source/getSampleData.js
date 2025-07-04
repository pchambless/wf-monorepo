import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getSampleData(entityName, pageMap) {

  // First try to load real sample data from the devtools samples directory
  const samplePath = path.resolve(__dirname, '../../../../../samples', `${entityName}.json`);

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

  // Generate mock data based on table configuration
  if (pageMap.tableConfig && pageMap.tableConfig.columns && pageMap.tableConfig.columns.length > 0) {
    return generateMockData(pageMap.tableConfig.columns);
  }

  // If no table configuration, return empty array
  return [];
}

/**
 * Generate mock data based on column configuration
 */
function generateMockData(columns) {
  const mockRows = [];

  for (let i = 1; i <= 3; i++) {
    const row = {};

    columns.forEach(col => {
      switch (col.type) {
        case 'number':
          row[col.field] = Math.floor(Math.random() * 1000) + i;
          break;
        case 'text':
          row[col.field] = `Sample ${col.label || col.field} ${i}`;
          break;
        case 'select':
          row[col.field] = `Option ${i}`;
          break;
        case 'date':
          const date = new Date();
          date.setDate(date.getDate() - i);
          row[col.field] = date.toISOString().split('T')[0];
          break;
        case 'boolean':
          row[col.field] = i % 2 === 0;
          break;
        default:
          row[col.field] = `Value ${i}`;
      }
    });

    mockRows.push(row);
  }

  return mockRows;
}

export default getSampleData;