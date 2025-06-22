export function toMermaid(graph, options = {}) {
  const {
    layout = 'LR', // or 'TD'
    showParams = false, // optional: include params in labels
    classStyling = true // include class lines and classDefs
  } = options;

  const { nodes, edges } = graph;
  const lines = [];

  lines.push(`flowchart ${layout}`);
  lines.push('');

  // Generate nodes
  for (const node of nodes) {
    const label = showParams && node.meta?.params
      ? `${node.label}<br>(${node.meta.params.join(', ')})`
      : node.label;

    lines.push(`  ${node.id}["${label}"]`);
  }

  lines.push('');

  // Generate edges
  for (const edge of edges) {
    const line = edge.label
      ? `  ${edge.from} -->|${edge.label}| ${edge.to}`
      : `  ${edge.from} --> ${edge.to}`;
    lines.push(line);
  }

  // Add class lines
  if (classStyling) {
    const categoryMap = new Set(nodes.map(n => n.category).filter(Boolean));

    for (const node of nodes) {
      if (node.category) {
        lines.push(`  class ${node.id} ${node.category};`);
      }
    }

    // Sample category styles (customize as needed)
    categoryMap.forEach(category => {
      let color = '#f0f0f0';
      if (category === 'auth') color = '#d5f5e3';
      else if (category === 'crud') color = '#fcf3cf';
      else if (category === 'rcpe') color = '#f9ebea';
      else if (category === 'select') color = '#d6eaf8';

      lines.push(`  classDef ${category} fill:${color},stroke:#333,stroke-width:1px;`);
    });
  }

  return lines.join('\n');
}