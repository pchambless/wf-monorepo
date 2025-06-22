import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { genEntityHtml } from './genEntityHtml.js';
import { getSampleData } from './getSampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function genPageHtmlPreviews() {
  console.log('📘 Generating HTML previews for pages...');

  const outputDir = path.resolve(__dirname, '../../../Docs/pagePreviews');
  await fs.mkdir(outputDir, { recursive: true });

  const registryModulePath = pathToFileURL(
    path.resolve(__dirname, '../../../packages/shared-config/src/pageMapRegistry.js')
  ).href;

  const { entityRegistry } = await import(registryModulePath);
  console.log(`🔎 Loaded ${Object.keys(entityRegistry).length} entities`);

  for (const [entityName] of Object.entries(entityRegistry)) {
    try {
      const mapModulePath = pathToFileURL(
        path.resolve(__dirname, `../../../packages/shared-config/src/pageMap/${entityName}.js`)
      ).href;

      const { default: pageMap } = await import(mapModulePath);
      const sampleData = await getSampleData(entityName, pageMap) || [];

      const html = genEntityHtml(entityName, pageMap, sampleData);
      const outputPath = path.join(outputDir, `${entityName}.html`);
      await fs.writeFile(outputPath, html);

      console.log(`✅ ${entityName}.html`);
    } catch (err) {
      console.warn(`⚠️  Skipping ${entityName}: ${err.message}`);
    }
  }

  console.log('🎉 Finished HTML preview generation.');
}