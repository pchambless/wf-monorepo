import genEventTypes from './source/genCode/genEventTypes.js';
import { genGraphArtifacts } from '../../graph/utils/genGraphArtifacts.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const graphDataPath = path.resolve(__dirname, './generated/graphData.json');

export async function genSourceOut() {
  console.log('🛠 Generating section Artifacts...');
  await genEventTypes();
}

export const sectionConfig = {
  key: 'eventTypes',
  title: 'Event Types',
  description: 'Documents the WhatsFresh event types and their relationships.',
  active: true,
  graphName: 'eventTypes',
  graphTypes: ['mmd'],
  graphData: null, // gets set at build time
  buildDocs: async () => {
    console.log(`[indexBuildDocs] Building "${sectionConfig.key}" section...`);
    await genSourceOut();

    const file = await readFile(graphDataPath, 'utf8');
    sectionConfig.graphData = JSON.parse(file);

    await genGraphArtifacts(sectionConfig);
  }
};