import fs from 'fs/promises';
import path from 'path';
import { toMermaid } from './toMermaid.js';
import { toDot } from './toDot.js';
import { getGeneratedPath } from './paths.js';

export async function genGraphArtifacts({
  key,
  graphData,
  graphName = key,
  graphTypes = ['json', 'mmd', 'md'],
  outputSubDir = null
}) {
  //  console.log(`[genGraphArtifacts] graphData: ${JSON.stringify(graphData, null, 2)}`);
  if (!graphData?.nodes || !graphData?.edges) {
    console.warn(`[genGraphArtifacts] No valid graph data found for "${key}"`);
    return;
  }

  const writes = [];

  if (graphTypes.includes('json')) {
    const jsonPath = getGeneratedPath(key, 'json', graphName, outputSubDir);
    await fs.mkdir(path.dirname(jsonPath), { recursive: true });
    writes.push(fs.writeFile(
      jsonPath,
      JSON.stringify(graphData, null, 2)
    ));
  }

  if (graphTypes.includes('mmd')) {
    const mmd = toMermaid(graphData);
    const mmdPath = getGeneratedPath(key, 'mmd', graphName, outputSubDir);
    await fs.mkdir(path.dirname(mmdPath), { recursive: true });
    writes.push(fs.writeFile(
      mmdPath,
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