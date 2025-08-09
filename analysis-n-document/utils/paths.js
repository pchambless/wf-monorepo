import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getGeneratedPath(key, extension, fileName = key) {
  const baseOutputDir = path.resolve(__dirname, '../output');
  
  // Route files to appropriate subdirectories
  if (extension === 'json') {
    return path.join(baseOutputDir, 'json', `${fileName}.${extension}`);
  } else if (extension === 'mmd') {
    return path.join(baseOutputDir, 'reports', `${fileName}.${extension}`);
  } else {
    // Legacy fallback for other extensions
    return path.join(baseOutputDir, `${fileName}.${extension}`);
  }
}