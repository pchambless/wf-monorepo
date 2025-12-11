import { execEvent, setVals } from './api';

/**
 * Fetch page structure using sp_pageStructure stored procedure
 * Returns components, props, and triggers in one call
 */
export const fetchPageStructure = async (pageID) => {
  try {
    console.log(`📦 Fetching page structure for pageID: ${pageID} (timestamp: ${Date.now()})`);

    // Call sp_pageStructure stored procedure via eventSQL
    await setVals([{ paramName: 'pageID', paramVal: pageID }]);
    const response = await execEvent('fetchPageStructure');

    if (response.data && response.data.length > 0) {
      console.log(`✅ Loaded ${response.data.length} components for page ${pageID}`);

      // Debug: Check Grid in raw data
      const gridData = response.data.find(c => c.comp_name === 'Grid');
      if (gridData) {
        console.log('📦 Raw Grid data from database:', {
          comp_name: gridData.comp_name,
          hasTriggers: !!gridData.triggers,
          triggers: gridData.triggers?.substring(0, 100) + '...'
        });
      }

      // Transform flat component list into hierarchical structure
      const components = buildComponentHierarchy(response.data);
      
      // Get page metadata from first component
      const firstComp = response.data[0];
      
      return {
        pageID: firstComp.pageID,
        pageName: firstComp.pageName,
        appName: firstComp.appName,
        template_type: firstComp.template_type,
        components: components,
        layout: 'flex'
      };
    }

    throw new Error(`Page structure not found for pageID: ${pageID}`);
  } catch (error) {
    console.error(`Error fetching page structure for pageID ${pageID}:`, error);
    throw error;
  }
};

/**
 * Build hierarchical component tree from flat list
 */
function buildComponentHierarchy(flatComponents) {
  console.log(`🏗️ buildComponentHierarchy: Processing ${flatComponents.length} components`);

  // Create lookup map
  const componentMap = new Map();
  flatComponents.forEach(comp => {
    try {
      const position = parsePosOrder(comp.posOrder);

      let override_styles = null;
      if (comp.override_styles) {
        try {
          override_styles = JSON.parse(comp.override_styles);
        } catch (e) {
          console.error(`Failed to parse override_styles for ${comp.comp_name}:`, comp.override_styles, e);
        }
      }

      let props = {};
      if (comp.props) {
        // Props is already parsed as JSON by MySQL stored procedure
        // Just use it directly (it's an object, not a string)
        if (typeof comp.props === 'string') {
          try {
            props = JSON.parse(comp.props);
          } catch (e) {
            console.error(`Failed to parse props for ${comp.comp_name}:`, comp.props, e);
          }
        } else {
          props = comp.props;
        }
      }

      let workflowTriggers = null;
      if (comp.triggers) {
        if (comp.comp_name === 'Grid') {
          console.log(`🔍 Grid triggers raw:`, comp.triggers);
        }
        try {
          workflowTriggers = parseTriggersToWorkflowFormat(comp.triggers);
          if (comp.comp_name === 'Grid') {
            console.log(`✅ Parsed Grid triggers result:`, workflowTriggers);
            console.log(`✅ Parsed Grid triggers keys:`, workflowTriggers ? Object.keys(workflowTriggers) : 'null');
          }
        } catch (e) {
          console.error(`❌ Failed to parse triggers for ${comp.comp_name}:`, comp.triggers, e);
        }
      } else if (comp.comp_name === 'Grid') {
        console.warn(`⚠️ Grid component has no triggers in database`);
      }

      componentMap.set(comp.xref_id, {
        id: comp.comp_name,
        xref_id: comp.xref_id,
        comp_type: comp.comp_type,
        comp_name: comp.comp_name,
        title: comp.title,
        description: comp.description,
        position: position,
        override_styles: override_styles,
        level: comp.level,
        parent_id: comp.parent_id,
        props: props,
        workflowTriggers: workflowTriggers,
        components: []
      });
    } catch (e) {
      console.error(`Failed to process component ${comp.comp_name}:`, e);
    }
  });

  // Build hierarchy
  const rootComponents = [];
  componentMap.forEach(comp => {
    if (comp.parent_id === comp.xref_id) {
      // Root component
      rootComponents.push(comp);
    } else {
      // Child component - add to parent
      const parent = componentMap.get(comp.parent_id);
      if (parent) {
        parent.components.push(comp);
      }
    }
  });

  // Debug: Check Grid component in hierarchy
  const checkGridInTree = (components, depth = 0) => {
    components.forEach(c => {
      if (c.id === 'Grid') {
        console.log(`${'  '.repeat(depth)}✅ Found Grid in tree:`, {
          id: c.id,
          comp_type: c.comp_type,
          hasWorkflowTriggers: !!c.workflowTriggers,
          workflowTriggers: c.workflowTriggers
        });
      }
      if (c.components) {
        checkGridInTree(c.components, depth + 1);
      }
    });
  };
  checkGridInTree(rootComponents);

  return rootComponents;
}

/**
 * Parse posOrder string into position object
 * Input: "01,01,98,left"
 * Output: { row: 1, order: 1, width: "98", align: "left" }
 */
function parsePosOrder(posOrderStr) {
  if (!posOrderStr) return { row: 0, order: 0, width: "100", align: "left" };

  const parts = posOrderStr.split(',');
  return {
    row: parseInt(parts[0]) || 0,
    order: parseInt(parts[1]) || 0,
    width: parts[2] || "100",
    align: parts[3] || "left"
  };
}

/**
 * Parse triggers JSON string into workflow format
 * Input: "[{\"ordr\":1,\"class\":\"onClick\",\"action\":\"setVals\",...}]"
 * Output: { onClick: [{action: "setVals", ...}], onLoad: [...] }
 */
function parseTriggersToWorkflowFormat(triggersJson) {
  if (!triggersJson) return null;

  try {
    console.log('🔍 parseTriggersToWorkflowFormat: Raw JSON string (first 500 chars):',
      typeof triggersJson === 'string' ? triggersJson.substring(0, 500) : 'NOT A STRING - already parsed!');

    const triggers = JSON.parse(triggersJson);
    if (!Array.isArray(triggers) || triggers.length === 0) {
      console.warn('⚠️ Triggers not an array or empty:', triggers);
      return null;
    }

    console.log('🔍 parseTriggersToWorkflowFormat: Input array (FULL objects):', triggers);

    // Group by class (onClick, onLoad, etc.)
    const grouped = {};
    triggers.forEach((trigger, idx) => {
      try {
        const eventClass = trigger.class;
        if (!grouped[eventClass]) {
          grouped[eventClass] = [];
        }

        let content = trigger.content || null;
        if (trigger.content && typeof trigger.content === 'string') {
          // Only parse if content looks like JSON (starts with [ or {)
          if (trigger.content.trim().startsWith('[') || trigger.content.trim().startsWith('{')) {
            try {
              content = JSON.parse(trigger.content);
            } catch (e) {
              console.warn(`⚠️ Failed to parse content as JSON for ${trigger.action}, keeping as string:`, trigger.content);
            }
          }
        }

        grouped[eventClass].push({
          action: trigger.action,
          content: content,
          api_id: trigger.api_id,
          wrkFlow_id: trigger.wrkFlow_id,
          controller_id: trigger.controller_id,
          is_dom_event: trigger.is_dom_event
        });
      } catch (innerE) {
        console.error(`❌ Failed to parse trigger[${idx}]:`, innerE, trigger);
      }
    });

    console.log('🔍 parseTriggersToWorkflowFormat: Grouped result:', Object.keys(grouped).map(k => ({ class: k, count: grouped[k].length, actions: grouped[k].map(t => t.action) })));

    return Object.keys(grouped).length > 0 ? grouped : null;
  } catch (e) {
    console.error('❌ parseTriggersToWorkflowFormat failed:', e.message, 'Input:', triggersJson?.substring(0, 200));
    return null;
  }
}

export const fetchLayoutConfig = async (appName) => {
  try {
    await setVals([{ paramName: 'appName', paramVal: appName }]);
    const response = await execEvent('getLayoutConfig');

    if (response.data && response.data.length > 0) {
      const app = response.data[0];
      return {
        appbar: app.appbarConfig ? JSON.parse(app.appbarConfig) : null,
        sidebar: app.sidebarConfig ? JSON.parse(app.sidebarConfig) : null,
        footer: app.footerConfig ? JSON.parse(app.footerConfig) : null,
      };
    }

    throw new Error(`Layout config not found for app: ${appName}`);
  } catch (error) {
    console.error(`Error fetching layout config for ${appName}:`, error);
    throw error;
  }
};

export const fetchEventTypeConfig = async () => {
  try {
    const response = await execEvent('fetchEventTypeConfig');
    console.log('📦 fetchEventTypeConfig response:', response);

    if (response.data && response.data.length > 0) {
      // Convert array to lookup object: { Modal: {styles, config}, Button: {styles, config} }
      const eventTypeMap = {};
      response.data.forEach(row => {
        console.log(`📦 Processing eventType: ${row.eventType}`, row);
        eventTypeMap[row.eventType] = {
          styles: row.styles ? JSON.parse(row.styles) : {},
          config: row.config ? JSON.parse(row.config) : {}
        };
      });
      console.log('📦 Final eventTypeMap:', eventTypeMap);
      return eventTypeMap;
    }

    console.warn('⚠️ No eventType data returned');
    return {}; // Return empty object if no eventTypes found
  } catch (error) {
    console.error('❌ Error fetching eventType config:', error);
    return {}; // Return empty object on error to prevent app crash
  }
};
