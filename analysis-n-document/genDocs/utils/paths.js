import path from 'path';
import { fileURLToPath } from 'url';
import { getAppName, getAppDirectory } from '../../config/appNames.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getGeneratedPath(key, extension, fileName = key, outputSubDir = null) {
  const baseOutputDir = path.resolve(__dirname, '../output');

  // Determine app from key if not provided
  let appDir = outputSubDir;
  if (!appDir && key.includes('eventTypes-')) {
    const parts = key.split('-');
    if (parts.length > 1) {
      appDir = parts[1]; // Extract 'plans' from 'eventTypes-plans'
    }
  }

  // Convert logical app name to output directory name (which is the clean name)
  // For output directories, we use the clean names directly

  // Route files to app-specific subdirectories or monorepo level
  if (appDir && ['plans', 'client', 'admin'].includes(appDir)) {
    // App-specific files go to output/apps/appName/
    return path.join(baseOutputDir, 'apps', appDir, `${fileName}.${extension}`);
  } else {
    // Monorepo-level analysis files go to output/monorepo/
    return path.join(baseOutputDir, 'monorepo', `${fileName}.${extension}`);
  }
}