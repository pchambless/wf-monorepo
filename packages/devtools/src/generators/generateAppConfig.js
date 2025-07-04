/**
 * App Configuration Generator
 * Generates all app-specific configurations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRoutesFile } from './routeGenerator.js';
import { generateNavigationFile } from './navigationGenerator.js';
import { packagePaths, appPaths } from '@whatsfresh/shared-imports/paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate all configurations for a specific app
 * @param {string} appType - 'client' or 'admin'
 */
export async function generateAppConfig(appType = 'client') {
    console.log(`🔧 Generating ${appType} app configuration...`);

    // Determine output directory
    const outputDir = appPaths[appType]
        ? path.join(appPaths[appType], 'config')
        : path.join(process.cwd(), `generated/${appType}/config`);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate routes.js
    const routesContent = generateRoutesFile(appType);
    await fs.writeFile(path.join(outputDir, 'routes.js'), routesContent);
    console.log(`✅ Generated ${appType}/routes.js`);

    // Generate navigation.js
    const navigationContent = generateNavigationFile(appType);
    await fs.writeFile(path.join(outputDir, 'navigation.js'), navigationContent);
    console.log(`✅ Generated ${appType}/navigation.js`);

    console.log(`🎉 ${appType} configuration generation complete!`);
}

/**
 * Generate configurations for all apps
 */
export async function generateAllAppConfigs() {
    console.log('🚀 Generating configurations for all apps...');

    await generateAppConfig('client');
    await generateAppConfig('admin');

    console.log('🎉 All app configurations generated successfully!');
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
    const appType = process.argv[2];

    if (appType && ['client', 'admin'].includes(appType)) {
        generateAppConfig(appType);
    } else {
        generateAllAppConfigs();
    }
}
