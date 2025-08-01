/**
 * Represents a node in the graph—e.g. an event, a page, a widget.
 */
export class GraphNode {
  /** Unique identifier for this node (e.g. eventType or pageID) */
  id;

  /** Optional label to show in the diagram (defaults to id) */
  label;

  /** Optional category, used for styling/grouping (e.g. 'auth', 'crud', 'layout') */
  category;

  /** Optional metadata—can be used for links, tooltips, etc. */
  meta;

  constructor({ id, label = id, category = '', meta = {} }) {
    this.id = id;
    this.label = label;
    this.category = category;
    this.meta = meta;
  }
}

/**
 * Represents a directional edge from one node to another.
 */
export class GraphEdge {
  /** Source node ID */
  from;

  /** Target node ID */
  to;

  /** Optional label for the connection */
  label;

  /** Optional edge type (e.g. 'data', 'navigation', 'trigger') */
  type;

  constructor({ from, to, label = '', type = '' }) {
    this.from = from;
    this.to = to;
    this.label = label;
    this.type = type;
  }
}