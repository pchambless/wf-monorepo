/**
 * Build hierarchical tree from flat eventComp_xref array
 */
export function buildComponentTree(components) {
  if (!components || components.length === 0) {
    return [];
  }

  const map = new Map();
  const roots = [];

  // First pass: create nodes with children array
  components.forEach(comp => {
    map.set(comp.id, { 
      ...comp, 
      children: [],
      propCount: 0,
      triggerCount: 0
    });
  });

  // Second pass: build parent-child relationships
  components.forEach(comp => {
    const node = map.get(comp.id);
    
    if (comp.parent_id === comp.id) {
      // Root node (self-referencing Container)
      roots.push(node);
    } else {
      const parent = map.get(comp.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphaned node - add to roots
        roots.push(node);
      }
    }
  });

  // Sort children by posOrder for consistent display
  const sortChildren = (node) => {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => {
        const aOrder = a.posOrder || '';
        const bOrder = b.posOrder || '';
        return aOrder.localeCompare(bOrder);
      });
      node.children.forEach(sortChildren);
    }
  };

  roots.forEach(sortChildren);

  return roots;
}

/**
 * Get icon for component type
 */
export function getComponentIcon(compType) {
  const icons = {
    'Container': '📦',
    'Modal': '🪟',
    'Button': '🔘',
    'Grid': '📊',
    'Form': '📝',
    'H1': '📝',
    'H2': '📝',
    'H3': '📝',
    'H4': '📝',
    'H5': '📝',
    'H6': '📝',
    'Input': '✏️',
    'Textarea': '📄',
    'Select': '🔽',
    'Checkbox': '☑️',
    'Radio': '🔘',
    'Label': '🏷️',
    'Div': '📦',
    'Span': '📝',
  };

  return icons[compType] || '🔹';
}
