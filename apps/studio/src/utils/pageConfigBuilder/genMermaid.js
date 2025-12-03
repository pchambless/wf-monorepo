/**
 * Generate Structure Mermaid diagram from pageConfig
 * Shows component hierarchy and nesting
 */

export const generateMermaid = (pageConfig) => {
  return generateStructureDiagram(pageConfig);
};

export const generateStructureDiagram = (pageConfig) => {
  const lines = ['graph TD'];
  const nodes = new Set();
  const edges = [];

  // Sanitize IDs for mermaid (no spaces, special chars)
  const sanitizeId = (id) => String(id).replace(/[^a-zA-Z0-9_]/g, '_');

  // Add page node
  const pageId = sanitizeId(pageConfig.pageName || 'Page');
  nodes.add(`${pageId}["${pageConfig.props?.title || pageConfig.pageName}"]`);

  // Add page-level triggers
  if (pageConfig.workflowTriggers) {
    Object.entries(pageConfig.workflowTriggers).forEach(([triggerClass, actions]) => {
      const triggerId = sanitizeId(`page_${triggerClass}`);
      nodes.add(`${triggerId}("${triggerClass}")`);
      edges.push(`${pageId} --> ${triggerId}`);

      actions.forEach((action, idx) => {
        const actionId = sanitizeId(`page_${triggerClass}_${action.action}_${idx}`);
        const paramsPreview = formatParamsPreview(action.params);
        const label = paramsPreview ? `${action.action}<br/>${paramsPreview}` : action.action;
        nodes.add(`${actionId}["${label}"]`);
        edges.push(`${triggerId} --> ${actionId}`);
      });
    });
  }

  // Recursively process components
  const processComponent = (component, parentId, level = 0) => {
    // Skip HTML structure nodes (table, div, label, input, etc.)
    const htmlTypes = ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'label', 'input', 'textarea', 'span'];
    if (!component.comp_type || htmlTypes.includes(component.comp_type.toLowerCase())) {
      // Still process children of HTML nodes
      if (component.components && component.components.length > 0) {
        component.components.forEach(child => {
          processComponent(child, parentId, level);
        });
      }
      return;
    }

    const compId = sanitizeId(component.id);
    const label = buildComponentLabel(component);
    const nodeShape = getNodeShape(component.comp_type);

    nodes.add(`${compId}${nodeShape[0]}"${label}"${nodeShape[1]}`);
    edges.push(`${parentId} --> ${compId}`);

    // Add component triggers
    if (component.workflowTriggers) {
      Object.entries(component.workflowTriggers).forEach(([triggerClass, actions]) => {
        const triggerId = sanitizeId(`${component.id}_${triggerClass}`);
        nodes.add(`${triggerId}("${triggerClass}")`);
        edges.push(`${compId} -.-> ${triggerId}`);

        actions.forEach((action, idx) => {
          const actionId = sanitizeId(`${component.id}_${triggerClass}_${action.action}_${idx}`);
          const paramsPreview = formatParamsPreview(action.params);
          const label = paramsPreview ? `${action.action}#10;${paramsPreview}` : action.action;
          nodes.add(`${actionId}["${label}"]`);
          edges.push(`${triggerId} --> ${actionId}`);
        });
      });
    }

    // Process children (but skip HTML structure)
    if (component.components && component.components.length > 0) {
      component.components.forEach(child => {
        processComponent(child, compId, level + 1);
      });
    }
  };

  // Process all top-level components
  if (pageConfig.components && pageConfig.components.length > 0) {
    pageConfig.components.forEach(comp => {
      processComponent(comp, pageId, 1);
    });
  }

  // Build final mermaid text
  lines.push('');
  lines.push('  %% Page and Components');
  nodes.forEach(node => lines.push(`  ${node}`));

  lines.push('');
  lines.push('  %% Relationships');
  edges.forEach(edge => lines.push(`  ${edge}`));

  lines.push('');
  lines.push('  %% Styling');
  lines.push('  classDef pageNode fill:#3b82f6,stroke:#1e40af,color:#fff');
  lines.push('  classDef triggerNode fill:#10b981,stroke:#059669,color:#fff');
  lines.push('  classDef actionNode fill:#f59e0b,stroke:#d97706,color:#fff');
  lines.push(`  class ${pageId} pageNode`);

  return lines.join('\n');
};

/**
 * Build component label with columns/fields inline
 */
const buildComponentLabel = (component) => {
  const baseLabel = `${component.comp_type}: ${component.props?.label || component.id}`;

  // For Grid/Form, show columns/fields
  if ((component.comp_type === 'Grid' || component.comp_type === 'Form') && component.props?.columns) {
    const columns = component.props.columns
      .filter(col => !col.hidden)
      .map(col => col.name)
      .join(', ');
    return columns ? `${baseLabel}#10;${columns}` : baseLabel;
  }

  return baseLabel;
};

/**
 * Escape special characters for mermaid labels
 */
const escapeMermaid = (str) => {
  return String(str)
    .replace(/"/g, '#quot;')
    .replace(/'/g, '#apos;')
    .replace(/</g, '#lt;')
    .replace(/>/g, '#gt;')
    .replace(/\{/g, '#123;')
    .replace(/\}/g, '#125;')
    .replace(/\[/g, '#91;')
    .replace(/\]/g, '#93;')
    .replace(/\(/g, '#40;')
    .replace(/\)/g, '#41;');
};

/**
 * Format params for compact display in diagram
 */
const formatParamsPreview = (params) => {
  if (!params) return '';

  if (Array.isArray(params)) {
    if (params.length === 0) return '';
    // Show first few items
    const items = params.slice(0, 2).map(p =>
      typeof p === 'string' ? escapeMermaid(p) : escapeMermaid(JSON.stringify(p))
    );
    const preview = items.join(', ');
    return params.length > 2 ? `#91;${preview}, ...#93;` : `#91;${preview}#93;`;
  }

  if (typeof params === 'object') {
    const keys = Object.keys(params);
    if (keys.length === 0) return '';
    // Show key-value pairs compactly
    const preview = keys.slice(0, 2).map(k => {
      const v = params[k];
      let val = typeof v === 'string' ? v : JSON.stringify(v);
      if (val.length > 15) val = val.substring(0, 12) + '...';
      return `${k}: ${escapeMermaid(val)}`;
    }).join('#10;'); // Use newline code
    return preview;
  }

  if (typeof params === 'string') {
    const str = params.length > 20 ? params.substring(0, 17) + '...' : params;
    return escapeMermaid(str);
  }

  return escapeMermaid(JSON.stringify(params));
};

/**
 * Get mermaid node shape based on component type
 */
const getNodeShape = (compType) => {
  const shapes = {
    'Form': ['[/', '/]'],        // Trapezoid
    'Grid': ['[(', ')]'],         // Cylinder
    'Button': ['([', '])'],       // Stadium
    'Container': ['[', ']'],      // Rectangle
    'Modal': ['[[', ']]'],        // Subroutine
    'default': ['[', ']']         // Rectangle
  };
  return shapes[compType] || shapes.default;
};

/**
 * Generate Workflow Mermaid diagram from pageConfig
 * Shows trigger actions and data flow between components
 */
export const generateWorkflowDiagram = (pageConfig) => {
  const lines = ['graph LR'];
  const nodes = new Set();
  const edges = [];
  const sanitizeId = (id) => String(id).replace(/[^a-zA-Z0-9_]/g, '_');

  const componentMap = new Map();

  const collectComponents = (component) => {
    if (component.id) {
      componentMap.set(component.id, component);
    }
    if (component.components && component.components.length > 0) {
      component.components.forEach(child => collectComponents(child));
    }
  };

  if (pageConfig.components) {
    pageConfig.components.forEach(comp => collectComponents(comp));
  }

  const processedModals = new Set(); // Track which modals we've already processed

  const processModalWorkflow = (modalId) => {
    if (processedModals.has(modalId)) return; // Already processed
    processedModals.add(modalId);

    if (componentMap.has(modalId)) {
      const modal = componentMap.get(modalId);
      const modalNode = sanitizeId(modalId);
      
      // Process modal's onLoad triggers
      if (modal.workflowTriggers?.onLoad) {
        modal.workflowTriggers.onLoad.forEach((modalAction) => {
          if (modalAction.action === 'refresh' && modalAction.params && Array.isArray(modalAction.params)) {
            modalAction.params.forEach(refreshTarget => {
              const refreshId = sanitizeId(refreshTarget);
              if (componentMap.has(refreshTarget)) {
                const target = componentMap.get(refreshTarget);
                const targetLabel = `${target.comp_type}: ${target.id}`;
                nodes.add(`${refreshId}["${targetLabel}"]`);
                edges.push(`${modalNode} -->|onLoad:refresh| ${refreshId}`);
              }
            });
          }
        });
      }
    }
  };

  const processWorkflowTriggers = (component) => {
    const compId = sanitizeId(component.id);
    const compLabel = `${component.comp_type || 'Component'}: ${component.props?.label || component.id}`;

    let hasAnyTriggers = false;

    if (component.workflowTriggers) {
      hasAnyTriggers = true;
    }

    if (component.props?.rowActions && Array.isArray(component.props.rowActions)) {
      hasAnyTriggers = true;
    }

    if (!hasAnyTriggers) {
      if (component.components && component.components.length > 0) {
        component.components.forEach(child => processWorkflowTriggers(child));
      }
      return;
    }

    nodes.add(`${compId}["${compLabel}"]`);

    if (component.workflowTriggers) {
      Object.entries(component.workflowTriggers).forEach(([triggerClass, actions]) => {
      actions.forEach((action, idx) => {
        const actionId = sanitizeId(`${component.id}_${triggerClass}_${action.action}_${idx}`);

        if (action.action === 'openModal' && action.params && action.params[0]) {
          const modalId = action.params[0];
          const targetNode = sanitizeId(modalId);
          if (componentMap.has(modalId)) {
            const modal = componentMap.get(modalId);
            const modalLabel = `${modal.comp_type}: ${modal.id}`;
            nodes.add(`${targetNode}[["${modalLabel}"]]`);
            processModalWorkflow(modalId); // Process modal workflow once
          }
          edges.push(`${compId} -->|openModal| ${targetNode}`);
        } else if (action.action === 'closeModal') {
          const actionLabel = 'closeModal';
          nodes.add(`${actionId}{{"${actionLabel}"}}`);
          edges.push(`${compId} -->|${triggerClass}| ${actionId}`);
        } else if (action.action === 'refresh' && action.params && Array.isArray(action.params)) {
          action.params.forEach(targetName => {
            const targetId = sanitizeId(targetName);
            if (componentMap.has(targetName)) {
              const target = componentMap.get(targetName);
              const targetLabel = `${target.comp_type}: ${target.id}`;
              nodes.add(`${targetId}["${targetLabel}"]`);
            }
            edges.push(`${compId} -->|refresh| ${targetId}`);
          });
        } else {
          const actionLabel = formatActionLabel(action);
          nodes.add(`${actionId}{{"${actionLabel}"}}`);
          edges.push(`${compId} -->|${triggerClass}| ${actionId}`);
        }
      });
    });
    }

    if (component.props?.rowActions && Array.isArray(component.props.rowActions)) {
      component.props.rowActions.forEach((rowAction) => {
        const rowActionId = sanitizeId(`${component.id}_rowAction_${rowAction.id}`);
        const rowActionLabel = `Row: ${rowAction.id}`;
        nodes.add(`${rowActionId}(("${rowActionLabel}"))`);
        edges.push(`${compId} -.->|rowAction| ${rowActionId}`);

        if (rowAction.trigger && Array.isArray(rowAction.trigger)) {
          rowAction.trigger.forEach((action, idx) => {
            const actionId = sanitizeId(`${component.id}_${rowAction.id}_${action.action}_${idx}`);

            if (action.action === 'openModal' && action.params?.modalId) {
              const modalId = action.params.modalId;
              const targetNode = sanitizeId(modalId);
              if (componentMap.has(modalId)) {
                const modal = componentMap.get(modalId);
                const modalLabel = `${modal.comp_type}: ${modal.id}`;
                nodes.add(`${targetNode}[["${modalLabel}"]]`);
              }
              edges.push(`${rowActionId} -->|openModal| ${targetNode}`);
            } else if (action.action === 'refresh' && action.params && Array.isArray(action.params)) {
              action.params.forEach(targetName => {
                const targetId = sanitizeId(targetName);
                if (componentMap.has(targetName)) {
                  const target = componentMap.get(targetName);
                  const targetLabel = `${target.comp_type}: ${target.id}`;
                  nodes.add(`${targetId}["${targetLabel}"]`);
                }
                edges.push(`${rowActionId} -->|refresh| ${targetId}`);
              });
            } else {
              const actionLabel = formatActionLabel(action);
              nodes.add(`${actionId}{{"${actionLabel}"}}`);
              edges.push(`${rowActionId} --> ${actionId}`);
            }
          });
        }
      });
    }

    if (component.components && component.components.length > 0) {
      component.components.forEach(child => processWorkflowTriggers(child));
    }
  };

  if (pageConfig.components) {
    pageConfig.components.forEach(comp => processWorkflowTriggers(comp));
  }

  lines.push('');
  lines.push('  %% Components and Actions');
  nodes.forEach(node => lines.push(`  ${node}`));

  lines.push('');
  lines.push('  %% Workflow Flows');
  edges.forEach(edge => lines.push(`  ${edge}`));

  lines.push('');
  lines.push('  %% Styling');
  lines.push('  classDef actionNode fill:#f59e0b,stroke:#d97706,color:#fff');
  lines.push('  classDef modalNode fill:#8b5cf6,stroke:#6d28d9,color:#fff');

  return lines.join('\n');
};

const formatActionLabel = (action) => {
  const paramStr = formatParamsPreview(action.params);
  return paramStr ? `${action.action}#10;${paramStr}` : action.action;
};
