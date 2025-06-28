import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '../../../../../../wf-monorepo-new'); // adjust depth as needed

export async function scaffoldSection(key, title, description) {
  const root = path.resolve('packages/devtools/src/docs/sections', key);
  const outputDir = path.join(root, 'generated');
  const sourceDir = path.join(root, 'source', 'genCode');

  await Promise.all([
    fs.mkdir(outputDir, { recursive: true }),
    fs.mkdir(sourceDir, { recursive: true })
  ]);

  await Promise.all([
    fs.writeFile(path.join(root, 'index.js'), generateIndexJs(key, title, description)),
    fs.writeFile(path.join(sourceDir, `gen${capitalize(key)}.js`), `export default async function gen${capitalize(key)}() {\n  // Generate artifacts here\n}\n`),
    await fs.mkdir(path.join(MONOREPO_ROOT, 'Docs/sections', key), { recursive: true }),
    fs.writeFile(path.join('Docs/sections', key, 'README.md'), generateReadmeMarkdown(key, title, description))
  ]);

  console.log(`✅ Section scaffolded: ${key}`);
}

function generateIndexJs(key, title, description) {
  return `import gen${capitalize(key)} from './source/genCode/gen${capitalize(key)}.js';
import { genGraphArtifacts } from '../../graph/utils/genGraphArtifacts.js';

export async function genSourceOut() {
  console.log('🛠 Generating ${key} artifacts...');
  await gen${capitalize(key)}();
}

export const sectionConfig = {
  key: '${key}',
  title: '${title}',
  description: '${description}',
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
    await genGraphArtifacts('${key}', sectionConfig.graph);
  }
};

// Run standalone
if (process.argv[1] === new URL(import.meta.url).pathname) {
  sectionConfig.buildDocs().catch(err => {
    console.error('[buildDocs] Failed:', err.message);
    process.exit(1);
  });
}
`;
}

function generateReadmeMarkdown(key, title, description) {
  return `# ${title}

${description}

## 📁 Artifact Source

Artifacts are generated from:

- \`packages/devtools/src/docs/sections/${key}/source/genCode/gen${capitalize(key)}.js\`

To rebuild this section:

\`\`\`bash
yarn workspace @whatsfresh/devtools gen${capitalize(key)}
\`\`\`

## 📄 Artifacts

- [graphData.json](./output/graphData.json) — Metadata used for relationships
- [graph.mmd](./output/graph.mmd) — Mermaid graph
- [graph.dot](./output/graph.dot) — Graphviz format
`;
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}