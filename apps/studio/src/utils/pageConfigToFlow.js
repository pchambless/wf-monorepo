export const pageConfigToFlow = (pageConfig) => {
  if (!pageConfig?.components || !Array.isArray(pageConfig.components)) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];

  const processComponent = (component, parentId = null, level = 0, index = 0) => {
    // Skip components without xref_id (like expanded form fields)
    if (!component.xref_id) {
      console.warn('Skipping component without xref_id:', component.id);
      return;
    }

    const nodeId = String(component.xref_id);

    const node = {
      id: nodeId,
      type: component.comp_type?.toLowerCase() || 'default',
      data: {
        label: component.title || component.id,
        comp_type: component.comp_type,
        xref_id: component.xref_id,
        container: component.container,
        eventProps: component.props,
      },
      position: {
        x: index * 250,
        y: level * 150,
      },
    };

    nodes.push(node);

    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
      });
    }

    if (component.components && Array.isArray(component.components)) {
      component.components.forEach((child, childIndex) => {
        processComponent(child, nodeId, level + 1, childIndex);
      });
    }
  };

  // Process all root components
  pageConfig.components.forEach((component, index) => {
    processComponent(component, null, 0, index);
  });

  return { nodes, edges };
};
