import genBatchMapping from './source/genCode/genBatchMapping.js';
import { genGraphArtifacts } from '../../graph/utils/genGraphArtifacts.js';

export async function genSourceOut() {
  console.log('🛠 Generating batchMapping artifacts...');
  await genBatchMapping();
}

export const sectionConfig = {
  key: 'batchMapping',
  title: 'Batch Mapping',
  description: 'Describes the steps for batch mapping.',
  active: true,
  graph: async () => {
    try {
      const { default: data } = await import('./output/graphData.json');
      return data || { nodes: [], edges: [] };
    } catch {
      return { nodes: [], edges: [] };
    }
  },
  buildDocs: async () => {
    await genSourceOut();
    await genGraphArtifacts('batchMapping', sectionConfig.graph);
  }
};

// Run standalone
if (process.argv[1] === new URL(import.meta.url).pathname) {
  sectionConfig.buildDocs().catch(err => {
    console.error('[buildDocs] Failed:', err.message);
    process.exit(1);
  });
}
