export function toDot(graph, options = {}) {
  const { nodes, edges } = graph;
  const lines = [];

  lines.push('digraph G {');
  lines.push('  rankdir=LR;'); // Left-to-right layout
  lines.push('  node [shape=box, style=filled, color=lightgray, fontname="Helvetica"];');
  lines.push('');

  for (const node of nodes) {
    const label = node.label.replace(/"/g, '\\"');
    lines.push(`  "${node.id}" [label="${label}"];`);
  }

  lines.push('');

  for (const edge of edges) {
    const label = edge.label ? ` [label="${edge.label}"]` : '';
    lines.push(`  "${edge.from}" -> "${edge.to}"${label};`);
  }

  lines.push('}');
  return lines.join('\n');
}