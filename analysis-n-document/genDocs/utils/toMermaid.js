export function toMermaid(graph, options = {}) {
  console.log('[toMermaid] Generating Mermaid format');
  const {
    layout = 'LR',
    showParams = false,
    classStyling = true
  } = options;

  const { nodes, edges, workflowEdges = [] } = graph;
  const lines = [];

  lines.push(`flowchart ${layout}`);
  lines.push('');

  // 🔹 Group nodes by cluster
  const clusterMap = {};
  for (const node of nodes) {
    const cluster = node.meta?.cluster || 'UNCATEGORIZED';
    if (!clusterMap[cluster]) clusterMap[cluster] = [];
    clusterMap[cluster].push(node);
  }

  // 🔹 Emit nodes grouped into subgraphs by cluster
  for (const [cluster, groupNodes] of Object.entries(clusterMap)) {
    lines.push(`  subgraph ${cluster}`);
    for (const node of groupNodes) {
      const label = showParams && node.meta?.params
        ? `${node.label}<br>(${node.meta.params.join(', ')})`
        : node.label;
      lines.push(`    ${node.id}["${label}"]`);
    }
    lines.push('  end');
    lines.push('');
  }

  // 🔹 Generate navigation edges
  for (const edge of edges) {
    const line = edge.label
      ? `  ${edge.from} -->|${edge.label}| ${edge.to}`
      : `  ${edge.from} --> ${edge.to}`;
    lines.push(line);
  }

  // 🔹 Generate workflow edges
  for (const edge of workflowEdges) {
    const line = edge.label
      ? `  ${edge.from} -.->|${edge.label}| ${edge.to}`
      : `  ${edge.from} -.-> ${edge.to}`;
    lines.push(line);
  }

  // 🔹 Add class lines
  if (classStyling) {
    const categoryMap = new Set(nodes.map(n => n.category).filter(Boolean));

    for (const node of nodes) {
      if (node.category) {
        lines.push(`  class ${node.id} ${node.category};`);
      }
    }

    categoryMap.forEach(category => {
      let color = '#f0f0f0';
      if (category === 'form') color = '#d5f5e3';
      else if (category === 'grid') color = '#fcf3cf';
      else if (category === 'tab') color = '#f9ebea';
      else if (category === 'select') color = '#d6eaf8';
      else if (category === 'page') color = '#959aceff';

      lines.push(`  classDef ${category} fill:${color},stroke:#333,stroke-width:1px,color:#000;`);
    });
  }

  return lines.join('\n');
}