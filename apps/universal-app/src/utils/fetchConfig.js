import { execEvent, setVals } from './api';

/**
 * Fetch page structure using sp_pageStructure stored procedure
 * Returns components, props, and triggers in one call
 */
export const fetchPageStructure = async (pageID) => {
  try {
    console.log(`📦 Fetching page structure for pageID: ${pageID}`);
    
    // Call sp_pageStructure stored procedure via eventSQL
    await setVals([{ paramName: 'pageID', paramVal: pageID }]);
    const response = await execEvent('fetchPageStructure');

    if (response.data && response.data.length > 0) {
      console.log(`✅ Loaded ${response.data.length} components for page ${pageID}`);
      
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
  // Create lookup map
  const componentMap = new Map();
  flatComponents.forEach(comp => {
    componentMap.set(comp.xref_id, {
      id: comp.comp_name,
      xref_id: comp.xref_id,
      comp_type: comp.comp_type,
      comp_name: comp.comp_name,
      title: comp.title,
      description: comp.description,
      posOrder: comp.posOrder,
      override_styles: comp.override_styles ? JSON.parse(comp.override_styles) : null,
      level: comp.level,
      parent_id: comp.parent_id,
      props: comp.props ? JSON.parse(comp.props) : {},
      workflowTriggers: comp.triggers ? parseTriggersToWorkflowFormat(comp.triggers) : null,
      components: []
    });
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

  return rootComponents;
}

/**
 * Parse triggers JSON string into workflow format
 * Input: "[{\"ordr\":1,\"class\":\"onClick\",\"action\":\"setVals\",...}]"
 * Output: { onClick: [{action: "setVals", ...}], onLoad: [...] }
 */
function parseTriggersToWorkflowFormat(triggersJson) {
  if (!triggersJson) return null;
  
  const triggers = JSON.parse(triggersJson);
  if (!Array.isArray(triggers) || triggers.length === 0) return null;

  // Group by class (onClick, onLoad, etc.)
  const grouped = {};
  triggers.forEach(trigger => {
    const eventClass = trigger.class;
    if (!grouped[eventClass]) {
      grouped[eventClass] = [];
    }
    grouped[eventClass].push({
      action: trigger.action,
      content: trigger.content ? JSON.parse(trigger.content) : {},
      api_id: trigger.api_id,
      wrkFlow_id: trigger.wrkFlow_id,
      controller_id: trigger.controller_id,
      is_dom_event: trigger.is_dom_event
    });
  });

  return grouped;
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
