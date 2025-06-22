export async function genAnyGraph(graphType, options = {}) {

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
  const sourceModule = await import(`./sources/gen${capitalize(graphType)}.js`);
  const graph = sourceModule.genGraph(options);

  if (options.writeToFile) {
    const outFile = path.resolve('docs/graph/out', `${graphType}.json`);
    await fs.writeFile(outFile, JSON.stringify(graph, null, 2));
  }
  console.log('Loaded module exports:', Object.keys(sourceModule));
  
  return graph;
}
