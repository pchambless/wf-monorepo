import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the function directly from shared-events to avoid loading UI components
import { getClientSafeEventTypes } from '@whatsfresh/shared-events';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../../../eventTypes/generated/graphData.json');

export default async function genEventTypes() {
  console.log('[genEventTypes] 🛠 Generating eventTypes graph data...');

  // Get events directly - no more parsing needed!
  const events = getClientSafeEventTypes();
  console.log(`📊 Processing ${events.length} event types...`);

  // Build graph structure
  const nodes = events.map(evt => ({
    id: evt.eventType,
    label: `${evt.category}<br>${evt.eventType}<br>[:${Array.isArray(evt.params) ? evt.params.join(', :') : evt.params || ''}]`,
    category: evt.category || 'uncategorized',
    meta: {
      cluster: evt.cluster || 'UNGROUPED',
      dbTable: evt.dbTable,
      selWidget: evt.selWidget,
      method: evt.method,
      purpose: evt.purpose,
      primaryKey: evt.primaryKey || null
    }
  }));

  const edges = [];

  events.forEach(evt => {
    const children = evt.children || [];
    children.forEach(childID => {
      const child = events.find(e => e.eventType === childID);
      if (child) {
        edges.push({
          from: evt.eventType,
          to: childID,
          label: evt.primaryKey || '',
          type: child.category || ''
        });
      }
    });
  });

  const output = JSON.stringify({ nodes, edges }, null, 2);
  await fs.writeFile(outputPath, output);
  console.log(`✅ graphData.json written to ${outputPath} with ${nodes.length} nodes and ${edges.length} edges`);
}