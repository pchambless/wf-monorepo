import { GraphNode, GraphEdge } from '../../graph/types.js';
import sharedEvents from '@whatsfresh/shared-events';

export function genGraph() {
  const events = sharedEvents.getClientSafeEventTypes?.() || [];

  const nodes = events.map(evt => new GraphNode({
    id: evt.eventType,
    label: evt.eventType,
    category: evt.category || 'uncategorized',
    meta: {
      dbTable: evt.dbTable,
      selWidget: evt.selWidget,
      method: evt.method,
      purpose: evt.purpose
    }
  }));

  const edges = [];
  events.forEach(evt => {
    const children = sharedEvents.getChildEntities?.(evt.eventType) || evt.children || [];
    children.forEach(childID => {
      edges.push(new GraphEdge({ from: evt.eventType, to: childID }));
    });
  });

  return { nodes, edges };
}