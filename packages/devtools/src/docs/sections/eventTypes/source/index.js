import fs from 'fs/promises';
import  genGraphData  from './genCode/genEventTypes.js';

export async function genEventTypes() {
  const data = genGraphData();

  const outPath = new URL('../graphData.json', import.meta.url);


  const jsonData = JSON.stringify(data, null, 2);

  await Promise.all([
    fs.writeFile(graphDataPath, jsonData)
  ]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🛠 Running genEventTypes from source/index.js...');
  await genEventTypes();
  console.log('✅ graphData.json written.');
}