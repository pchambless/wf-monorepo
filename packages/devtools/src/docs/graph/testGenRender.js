import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { genAnyGraph } from './genAnyGraph.js';
import { toMermaid } from './toMermaid.js';
import { toDot } from './toDot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, 'out');
await fs.mkdir(outDir, { recursive: true });

const graphTypes = ['eventGraph', 'pageGraph', 'widgetGraph'];

for (const type of graphTypes) {
  console.log(`📊 Generating: ${type}`);
  const graph = await genAnyGraph(type);

  const base = path.join(outDir, type);
  const mermaidCode = toMermaid(graph);
  const dotCode = toDot(graph);

  await fs.writeFile(`${base}.json`, JSON.stringify(graph, null, 2));
  await fs.writeFile(`${base}.mmd`, mermaidCode);               // for preview tools
  await fs.writeFile(`${base}.md`, `\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n`); // for docs
  await fs.writeFile(`${base}.dot`, dotCode);                  // for Graphviz rendering

  console.log(`✅ Wrote: ${type}.json, .mmd, .md, .dot`);
}

console.log('📁 All graph outputs generated in:', outDir);