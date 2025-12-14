import { execEvent, setVals } from './api';
import { createLogger } from './logger.js';
import { navigationEfficiency } from '../rendering/utils/NavigationEfficiency.js';

const log = createLogger('FetchConfig', 'info');

/**
 * Fetch page structure using sp_pageStructure stored procedure
 * Returns components, props, and triggers in one call
 * NavigationEfficiency LUOW: Moved setVals call out to eliminate redundant context updates
 */
export const fetchPageStructure = async (pageID) => {
  try {
    log.info(`Fetching page structure for pageID: ${pageID} (timestamp: ${Date.now()})`);

    // NavigationEfficiency: pageID should already be set by navigation LUOW
    // Only set if not already set (defensive check for direct calls)
    const response = await execEvent('fetchPageStructure');

    if (response.data && response.data.length > 0) {
      log.info(`Loaded ${response.data.length} components for page ${pageID}`);

      // Debug: Check Grid in raw data
      const gridData = response.data.find(c => c.comp_name === 'Grid');
      if (gridData) {
        log.debug('Raw Grid data from database:', {
          comp_name: gridData.comp_name,
          hasTriggers: !!gridData.triggers,
          triggers: gridData.triggers?.substring(0, 100) + '...'
        });
      }

      // Transform flat component list into hierarchical structure
      const components = buildComponentHierarchy(response.data);

      // Get page metadata from first component
      const firstComp = response.data[0];

      // Get page props from cached page registry (no database call needed!)
      const { getPageByID } = await import('./pageRegistry.js');
      const pageData = getPageByID(pageID);

      // Build props object from cached page registry data
      const pageProps = {
        tableName: pageData?.tableName,
        tableID: pageData?.tableID || 'id',
        contextKey: pageData?.contextKey,
        parentID: pageData?.parentID,
        pageTitle: pageData?.pageTitle,
        formHeadCol: pageData?.formHeadCol
      };

      log.info('Loaded page props:', pageProps);

      return {
        pageID: firstComp.pageID,
        pageName: firstComp.pageName,
        appName: firstComp.appName,
        template_type: firstComp.template_type,
        components: components,
        layout: 'flex',
        props: pageProps  // Use the full props object from page_registry
      };
    }

    throw new Error(`Page structure not found for pageID: ${pageID}`);
  } catch (error) {
    log.error(`Error fetching page structure for pageID ${pageID}:`, error);
    throw error;
  }
};

/**
 * Build hierarchical component tree from flat list
 */
function buildComponentHierarchy(flatComponents) {
  log.debug(`buildComponentHierarchy: Processing ${flatComponents.length} components`);

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
          log.error(`Failed to parse override_styles for ${comp.comp_name}:`, comp.override_styles, e);
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
            log.error(`Failed to parse props for ${comp.comp_name}:`, comp.props, e);
          }
        } else {
          props = comp.props;
        }
      }

      let workflowTriggers = null;
      if (comp.triggers) {
        if (comp.comp_name === 'Grid') {
          log.debug(`Grid triggers raw:`, comp.triggers);
        }
        try {
          workflowTriggers = parseTriggersToWorkflowFormat(comp.triggers);
          if (comp.comp_name === 'Grid') {
            log.debug(`Parsed Grid triggers result:`, workflowTriggers);
            log.debug(`Parsed Grid triggers keys:`, workflowTriggers ? Object.keys(workflowTriggers) : 'null');
          }
        } catch (e) {
          log.error(`Failed to parse triggers for ${comp.comp_name}:`, comp.triggers, e);
        }
      } else if (comp.comp_name === 'Grid') {
        log.warn(`Grid component has no triggers in database`);
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
      log.error(`Failed to process component ${comp.comp_name}:`, e);
    }
  });

  // Build hierarchy
  const rootComponents = [];
  componentMap.forEach(comp => {
    // Root components: parent_id === xref_id OR level === 0 (for Modals)
    if (comp.parent_id === comp.xref_id || comp.level === 0) {
      // Root component
      log.debug(`Root component: ${comp.id} (level=${comp.level}, parent_id=${comp.parent_id})`);
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
        log.debug(`${'  '.repeat(depth)}Found Grid in tree:`, {
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
      log.warn('Triggers not an array or empty:', triggers);
      return null;
    }

    log.debug('parseTriggersToWorkflowFormat: Input array (FULL objects):', triggers);

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
              log.warn(`Failed to parse content as JSON for ${trigger.action}, keeping as string:`, trigger.content);
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
        log.error(`Failed to parse trigger[${idx}]:`, innerE, trigger);
      }
    });

    log.debug('parseTriggersToWorkflowFormat: Grouped result:', Object.keys(grouped).map(k => ({ class: k, count: grouped[k].length, actions: grouped[k].map(t => t.action) })));

    return Object.keys(grouped).length > 0 ? grouped : null;
  } catch (e) {
    log.error('parseTriggersToWorkflowFormat failed:', e.message, 'Input:', triggersJson?.substring(0, 200));
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
    log.error(`Error fetching layout config for ${appName}:`, error);
    throw error;
  }
};

export const fetchEventTypeConfig = async () => {
  try {
    const response = await execEvent('fetchEventTypeConfig');
    log.debug('fetchEventTypeConfig response:', response);

    if (response.data && response.data.length > 0) {
      // Convert array to lookup object: { Modal: {styles, config}, Button: {styles, config} }
      const eventTypeMap = {};
      response.data.forEach(row => {
        log.debug(`Processing eventType: ${row.eventType}`, row);
        eventTypeMap[row.eventType] = {
          category: row.category,
          styles: row.styles ? JSON.parse(row.styles) : {},
          config: row.config ? JSON.parse(row.config) : {}
        };
      });
      log.debug('Final eventTypeMap:', eventTypeMap);
      return eventTypeMap;
    }

    log.warn('No eventType data returned');
    return {}; // Return empty object if no eventTypes found
  } catch (error) {
    log.error('Error fetching eventType config:', error);
    return {}; // Return empty object on error to prevent app crash
  }
};
