import fs from 'fs/promises';
import { toMermaid } from './toMermaid.js';
import { toDot } from './toDot.js';
import { getGeneratedPath } from './paths.js';

export async function genGraphArtifacts({
  key,
  graphData,
  graphName = key,
  graphTypes = ['json', 'mmd', 'md']
}) {
//  console.log(`[genGraphArtifacts] graphData: ${JSON.stringify(graphData, null, 2)}`);
  if (!graphData?.nodes || !graphData?.edges) {
    console.warn(`[genGraphArtifacts] No valid graph data found for "${key}"`);
    return;
  }

  const writes = [];

  if (graphTypes.includes('json')) {
    writes.push(fs.writeFile(
      getGeneratedPath(key, 'json', graphName),
      JSON.stringify(graphData, null, 2)
    ));
  }

  if (graphTypes.includes('mmd')) {
    const mmd = toMermaid(graphData);
    writes.push(fs.writeFile(
      getGeneratedPath(key, 'mmd', graphName),
      mmd
    ));
  }

  if (graphTypes.includes('md')) {
    const mmd = toMermaid(graphData);
    writes.push(fs.writeFile(
      getGeneratedPath(key, 'md', graphName),
      `\`\`\`mermaid\n${mmd}\n\`\`\``
    ));
  }

  await Promise.all(writes);
  console.log(`[genGraphArtifacts] ✅ Generated ${writes.length} artifacts for "${key}"`);
}