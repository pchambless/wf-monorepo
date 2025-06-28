import genAutomation from './source/genCode/genAutomation.js';
import { genGraphArtifacts } from '../../graph/utils/genGraphArtifacts.js';

export async function genSourceOut() {
  console.log('🛠 Generating automation artifacts...');
  await genAutomation();
}

export const sectionConfig = {
  key: 'automation',
  title: 'Automation',
  description: 'Generates reusable app artifacts like pageMaps and route configs.',
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
    await genGraphArtifacts('automation', sectionConfig.graph);
  }
};

// Run standalone
if (process.argv[1] === new URL(import.meta.url).pathname) {
  sectionConfig.buildDocs().catch(err => {
    console.error('[buildDocs] Failed:', err.message);
    process.exit(1);
  });
}
