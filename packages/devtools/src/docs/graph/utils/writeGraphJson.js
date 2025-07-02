// graph/utils/writeGraphJson.js
import path from 'path';
import fs from 'fs/promises';

export async function writeGraphJson(graph, dirPath) {
  const outPath = path.join(dirPath, 'genGraph.json');
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(graph, null, 2));
  return outPath;
}