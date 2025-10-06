export const pageConfigToFlow = (hierarchyData) => {
  // Handle both old pageConfig format and new flat hierarchy array
  let components = [];

  if (Array.isArray(hierarchyData)) {
    // New format: flat array from sp_hier_structure
    components = hierarchyData;
  } else if (hierarchyData?.components && Array.isArray(hierarchyData.components)) {
    // Old format: nested pageConfig (fallback)
    return legacyPageConfigToFlow(hierarchyData);
  } else {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];

  // Group components by parent_id
  const componentsByParent = {};
  components.forEach(comp => {
    const parentId = comp.parent_id || 'root';
    if (!componentsByParent[parentId]) {
      componentsByParent[parentId] = [];
    }
    componentsByParent[parentId].push(comp);
  });

  // Debug: Check if button is grouped under form
  console.log('🔍 Components by parent:', componentsByParent);
  console.log('🔍 Form children (59):', componentsByParent[59]);

  // Sort children within each parent by posOrder
  Object.keys(componentsByParent).forEach(parentId => {
    componentsByParent[parentId].sort((a, b) => (a.posOrder || 0) - (b.posOrder || 0));
  });

  // Calculate container dimensions based on children (recursive)
  const containerDimensionsCache = {};

  const getContainerDimensions = (componentId) => {
    // Return cached if already calculated
    if (containerDimensionsCache[componentId]) {
      return containerDimensionsCache[componentId];
    }

    const children = componentsByParent[componentId] || [];
    if (children.length === 0) {
      const leafDims = { width: 250, height: 100 };
      containerDimensionsCache[componentId] = leafDims;
      return leafDims;
    }

    // Parse children positions to calculate required space
    const childrenParsed = children.map(c => ({
      ...c,
      flexPos: parsePosOrder(c.posOrder)
    }));

    // Recursively calculate child dimensions first (bottom-up)
    const childDimensions = children.map(child =>
      getContainerDimensions(child.xref_id || child.id)
    );

    // Find max row to calculate height
    const maxRow = Math.max(...childrenParsed.map(c => c.flexPos?.row || 1));
    const rowHeight = 140; // Height per row
    const verticalPadding = 120; // Top/bottom padding for header + margins

    // Get max child height in any row
    const maxChildHeight = Math.max(...childDimensions.map(d => d.height), 100);
    const heightNeeded = Math.max(rowHeight, maxChildHeight + 40);
    const height = (maxRow * heightNeeded) + verticalPadding;

    // Debug: Log form dimensions
    if (componentId === 59 || componentId === '59') {
      console.log('📏 Form (59) dimensions:', {
        children: children.length,
        maxRow,
        height,
        childrenParsed
      });
    }

    // Width - get the component's level to determine size
    const component = components.find(c => (c.xref_id || c.id) === componentId);
    const componentLevel = component?.level || 0;

    // Parents (lower levels) are bigger
    const baseWidth = 1200;
    const widthReduction = Math.max(0, componentLevel) * 40;
    const width = Math.max(baseWidth - widthReduction, 600);

    const dims = { width, height };
    containerDimensionsCache[componentId] = dims;
    return dims;
  };

  // Parse posOrder format: "row,order,width,align"
  const parsePosOrder = (posOrder) => {
    if (!posOrder || posOrder === '0,0,auto' || posOrder === '00,00,00') return null;

    // Format: "row,order,width,align" (e.g., "1,1,50,right")
    const parts = posOrder.split(',').map(p => p.trim());

    if (parts.length >= 3) {
      // Parse width - add % if not present
      const widthValue = parts[2];
      const widthNum = parseInt(widthValue);

      // Treat "00" or 0 as "no positioning" (return null)
      if (widthNum === 0) return null;

      const width = widthValue.includes('%') ? widthValue : `${widthValue}%`;

      // Parse alignment (optional, defaults to 'left')
      const align = parts[3] || 'left';

      return {
        row: parseInt(parts[0]) || 0,
        order: parseInt(parts[1]) || 0,
        width,
        align
      };
    }

    return null;
  };

  // Store app-level info separately (not as a node)
  let appInfo = null;

  // Store final dimensions after percentage calculations
  const finalDimensions = {};

  // Sort components by level (parents first) so we calculate parent dimensions before children
  const sortedComponents = [...components].sort((a, b) => {
    const levelA = a.level || 0;
    const levelB = b.level || 0;
    return levelA - levelB; // Process lower levels (parents) first
  });

  // Create nodes with parent-child relationships
  sortedComponents.forEach((component) => {
    const nodeId = String(component.xref_id || component.id);
    const parentId = component.parent_id ? String(component.parent_id) : null;
    const level = component.level || 0;
    const flexPos = parsePosOrder(component.posOrder);

    // Skip level -1 (App) - we'll show it as a heading instead
    if (level === -1) {
      appInfo = {
        name: component.comp_name,
        title: component.title || component.comp_name
      };
      return; // Skip adding to nodes
    }

    // Position calculation
    let position;
    if (level === 0) {
      // Page - top level (App is just a heading now)
      position = { x: 50, y: 50 };
    } else if (parentId && flexPos) {
      // Use flex position (row/order/width) for layout within parent
      const rowHeight = 140; // pixels per row (increased for better spacing)

      // Get parent's FINAL dimensions (after percentage applied)
      const parentDims = finalDimensions[parentId] || getContainerDimensions(parentId);
      const containerWidth = parentDims.width - 100; // Usable width (minus padding)

      const headerHeight = 60; // Space for container header
      const leftPadding = 40; // Left margin inside container

      // Get siblings in the same row to calculate X offset
      const siblings = componentsByParent[parentId] || [];
      const siblingsParsed = siblings.map(s => ({
        ...s,
        flexPos: parsePosOrder(s.posOrder)
      }));

      // Filter siblings in same row, ordered before this component
      const sameRowBefore = siblingsParsed
        .filter(s => s.flexPos?.row === flexPos.row && s.flexPos?.order < flexPos.order)
        .sort((a, b) => a.flexPos.order - b.flexPos.order);

      // Calculate cumulative X offset from previous components
      let xOffset = 0;
      sameRowBefore.forEach(sibling => {
        const widthPercent = parseInt(sibling.flexPos.width) / 100;
        xOffset += (containerWidth * widthPercent) + 10; // Add gap between siblings
      });

      position = {
        x: leftPadding + xOffset,
        y: headerHeight + (flexPos.row - 1) * rowHeight,
      };
    } else if (parentId) {
      // Fallback: stack vertically by posOrder
      const siblings = componentsByParent[parentId] || [];
      const index = siblings.findIndex(s => (s.xref_id || s.id) === component.xref_id || s.id === component.id);
      position = {
        x: 20,
        y: 50 + (index * 120),
      };
    } else {
      // Fallback for orphaned nodes
      position = { x: 100, y: level * 150 };
    }

    // Calculate dimensions based on width or children
    let dimensions = getContainerDimensions(component.xref_id || component.id);

    // If component has width percentage, calculate based on parent's FINAL width
    if (flexPos && flexPos.width !== 'auto' && parentId) {
      // Use parent's final dimensions (after its percentage was applied)
      const parentFinalDims = finalDimensions[parentId] || getContainerDimensions(parentId);
      const containerWidth = parentFinalDims.width - 100; // Usable width inside parent
      const widthPercent = parseInt(flexPos.width) / 100;
      const calculatedWidth = containerWidth * widthPercent;

      dimensions = {
        width: calculatedWidth - 15, // Account for gap between components
        height: dimensions.height || 100, // Ensure minimum height
      };
    }

    // Store final dimensions for this component (children will use this)
    finalDimensions[component.xref_id || component.id] = dimensions;

    // Debug: Log Form node dimensions
    if ((component.xref_id || component.id) === 59) {
      console.log('🎯 Form node final dimensions:', dimensions);
    }

    const node = {
      id: nodeId,
      type: component.comp_type?.toLowerCase() || 'default',
      data: {
        label: component.title || component.comp_name,
        comp_type: component.comp_type,
        xref_id: component.xref_id || component.id,
        container: component.container,
        flexPosition: flexPos, // Store for debugging/display
      },
      position,
      style: {
        width: dimensions.width,
        height: dimensions.height,
      },
      zIndex: -level, // Higher level (parents) appear above lower levels
    };

    // Set parentNode for nested rendering
    if (parentId && level > 0) {
      node.parentNode = parentId;
      node.extent = 'parent'; // Constrains dragging to parent bounds
    }

    // Debug: Log button node
    if ((component.xref_id || component.id) === 63) {
      console.log('🔘 Button node:', {
        id: nodeId,
        parentNode: node.parentNode,
        position,
        dimensions,
        level
      });
    }

    nodes.push(node);

    // Create edge from parent (only for visual connection, not needed when using parentNode)
    // Skip edges for nested nodes to avoid visual duplication
    if (component.parent_id && level === 0) {
      const parentNodeId = String(component.parent_id);
      edges.push({
        id: `${parentNodeId}-${nodeId}`,
        source: parentNodeId,
        target: nodeId,
        type: 'smoothstep',
      });
    }
  });

  return { nodes, edges, appInfo };
};

// Legacy transformer for old pageConfig format (backward compatibility)
const legacyPageConfigToFlow = (pageConfig) => {
  const nodes = [];
  const edges = [];

  const processComponent = (component, parentId = null, level = 0, index = 0) => {
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

  pageConfig.components.forEach((component, index) => {
    processComponent(component, null, 0, index);
  });

  return { nodes, edges };
};
