/**
 * NavigationEfficiency LUOW - Sprint 3
 * 
 * Optimize page navigation to eliminate excessive context store updates.
 * Target the 300-400% waste identified in plan_communication 221:
 * - pageID: 8 updates → 2 updates  
 * - tableName: 9 updates → 4 updates
 * - appName: 4 updates → 1 update
 */

import { createLogger } from '../../utils/logger.js';
import { setVals, execEvent } from '../../utils/api.js';

const log = createLogger('NavigationEfficiency', 'info');

// Import trigger parsing function to avoid dynamic imports in loops
const parseTriggersToWorkflowFormat = (triggersJson) => {
  if (!triggersJson) return null;
  
  try {
    log.debug('NavigationEfficiency: parseTriggersToWorkflowFormat - Raw JSON string (first 200 chars):', 
      typeof triggersJson === 'string' ? triggersJson.substring(0, 200) : 'NOT A STRING - already parsed!');
    
    let triggers;
    if (typeof triggersJson === 'string') {
      triggers = JSON.parse(triggersJson);
    } else {
      triggers = triggersJson;
    }
    
    if (!Array.isArray(triggers) || triggers.length === 0) {
      log.warn('NavigationEfficiency: Triggers not an array or empty:', triggers);
      return null;
    }
    
    log.debug('NavigationEfficiency: parseTriggersToWorkflowFormat - Input array:', triggers);
    
    const workflowTriggers = {};
    
    for (const trigger of triggers) {
      const eventName = trigger.class;  // Use 'class' field as event name (onRefresh, onClick, etc.)
      
      if (!eventName) {
        log.warn('NavigationEfficiency: Trigger missing class field:', trigger);
        continue;
      }
      
      if (!workflowTriggers[eventName]) {
        workflowTriggers[eventName] = [];
      }
      
      // Build action object
      const action = {
        action: trigger.action,
        content: trigger.content,
        trigger_id: trigger.trigger_id,
        is_dom_event: trigger.is_dom_event,
        ordr: trigger.ordr
      };
      
      workflowTriggers[eventName].push(action);
    }
    
    // Sort actions by ordr within each event
    for (const eventName in workflowTriggers) {
      workflowTriggers[eventName].sort((a, b) => (a.ordr || 0) - (b.ordr || 0));
    }
    
    log.debug('NavigationEfficiency: parseTriggersToWorkflowFormat - Output:', workflowTriggers);
    
    return Object.keys(workflowTriggers).length > 0 ? workflowTriggers : null;
  } catch (e) {
    log.error('NavigationEfficiency: parseTriggersToWorkflowFormat failed:', e.message);
    return null;
  }
};

export class NavigationEfficiency {
  constructor() {
    this.lastSetAppName = null;  // Track the last appName we set to avoid duplicates
    this.lastSetPageID = null;   // Track the last pageID we set to avoid duplicates
  }

  /**
   * Efficient page navigation with batched context updates
   * Replaces multiple separate setVals calls with single batch
   */
  async navigateToPage(pageID, additionalContext = {}) {
    try {
      log.info(`NavigationEfficiency: Navigating to page ${pageID}`);
      
      // Batch ALL navigation context updates into single setVals call
      const contextUpdates = [
        { paramName: 'pageID', paramVal: pageID },
        ...Object.entries(additionalContext).map(([key, value]) => ({
          paramName: key,
          paramVal: value
        }))
      ];
      
      log.debug(`NavigationEfficiency: Batching ${contextUpdates.length} context updates`);
      
      // Single context update instead of multiple
      await setVals(contextUpdates);
      this.lastSetPageID = pageID;  // Track what we just set
      
      // Fetch page structure using the already-set pageID
      const response = await execEvent('fetchPageStructure');
      
      if (!response.data || response.data.length === 0) {
        throw new Error(`Page structure not found for pageID: ${pageID}`);
      }

      // NavigationEfficiency: Process the raw data into structured format (like original fetchPageStructure)
      const structuredPageData = await this.processPageStructureData(response.data, pageID);

      // Set tableName from page structure (appName set once at app startup)
      const pageContextUpdates = [];

      if (structuredPageData.props?.tableName) {
        pageContextUpdates.push({ paramName: 'tableName', paramVal: structuredPageData.props.tableName });
      }

      if (pageContextUpdates.length > 0) {
        await setVals(pageContextUpdates);
        log.debug(`NavigationEfficiency: Set ${pageContextUpdates.length} page context values (tableName only - appName set at startup)`);
      }

      log.info(`NavigationEfficiency: Loaded ${response.data.length} components for page ${pageID} with ${contextUpdates.length + pageContextUpdates.length} total context updates`);

      return structuredPageData;
    } catch (error) {
      log.error(`NavigationEfficiency: Navigation failed for pageID ${pageID}:`, error);
      throw error;
    }
  }
  
  /**
   * Process raw page structure data into the structured format expected by PageRenderer
   * This replicates the processing done in the original fetchPageStructure function
   */
  async processPageStructureData(rawData, pageID) {
    try {
      // Build hierarchical component tree from flat list (same logic as fetchConfig.js)
      const components = this.buildComponentHierarchy(rawData);

      // Get page metadata from first component
      const firstComp = rawData[0];

      // Get page props from cached page registry (no database call needed!)
      const { getPageByID } = await import('../../utils/pageRegistry.js');
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

      log.debug('NavigationEfficiency: Processed page props:', pageProps);

      return {
        pageID: firstComp.pageID,
        pageName: firstComp.pageName,
        appName: firstComp.appName,
        template_type: firstComp.template_type,
        components: components,
        layout: 'flex',
        props: pageProps  // Use the full props object from page_registry
      };
    } catch (error) {
      log.error('NavigationEfficiency: Failed to process page structure data:', error);
      throw error;
    }
  }
  
  /**
   * Build hierarchical component tree from flat list
   * Replicated from fetchConfig.js buildComponentHierarchy function
   */
  buildComponentHierarchy(flatComponents) {
    log.debug(`NavigationEfficiency: buildComponentHierarchy - Processing ${flatComponents.length} components`);

    // Create lookup map
    const componentMap = new Map();
    
    // First pass: create all components
    for (const comp of flatComponents) {
      try {
        // Handle position parsing
        const position = this.parsePosOrder(comp.posOrder);

        // Handle override_styles parsing
        let override_styles = null;
        if (comp.override_styles) {
          try {
            override_styles = JSON.parse(comp.override_styles);
          } catch (e) {
            log.error(`NavigationEfficiency: Failed to parse override_styles for ${comp.comp_name}:`, comp.override_styles, e);
          }
        }

        // Handle props parsing safely (like original fetchConfig.js)
        let props = {};
        if (comp.props) {
          if (typeof comp.props === 'string') {
            try {
              props = JSON.parse(comp.props);
            } catch (e) {
              log.error(`NavigationEfficiency: Failed to parse props for ${comp.comp_name}:`, comp.props, e);
            }
          } else {
            props = comp.props;
          }
        }

        // Handle triggers parsing safely
        let workflowTriggers = null;
        if (comp.triggers) {
          try {
            workflowTriggers = parseTriggersToWorkflowFormat(comp.triggers);
            if (comp.comp_name === 'Grid') {
              log.debug(`NavigationEfficiency: Grid triggers raw:`, comp.triggers);
              log.debug(`NavigationEfficiency: Parsed Grid triggers result:`, workflowTriggers);
              log.debug(`NavigationEfficiency: Parsed Grid triggers keys:`, workflowTriggers ? Object.keys(workflowTriggers) : 'null');
            }
          } catch (e) {
            log.error(`NavigationEfficiency: Failed to parse triggers for ${comp.comp_name}:`, comp.triggers, e);
          }
        } else if (comp.comp_name === 'Grid') {
          log.warn(`NavigationEfficiency: Grid component has no triggers in database`);
        }

        // Create component object with same structure as original
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
        log.error(`NavigationEfficiency: Failed to process component ${comp.comp_name}:`, e);
      }
    }

    // Build hierarchy (same logic as original)
    const rootComponents = [];
    componentMap.forEach(comp => {
      // Root components: parent_id === xref_id OR level === 0 (for Modals)
      if (comp.parent_id === comp.xref_id || comp.level === 0) {
        log.debug(`NavigationEfficiency: Root component: ${comp.id} (level=${comp.level}, parent_id=${comp.parent_id})`);
        rootComponents.push(comp);
      } else {
        // Child component - add to parent
        const parent = componentMap.get(comp.parent_id);
        if (parent) {
          parent.components.push(comp);
        } else {
          log.warn(`NavigationEfficiency: Parent ${comp.parent_id} not found for ${comp.id}, treating as root`);
          rootComponents.push(comp);
        }
      }
    });

    log.debug(`NavigationEfficiency: buildComponentHierarchy - Built ${rootComponents.length} root components`);
    
    // Debug: Log Grid component details
    const gridComponent = rootComponents.find(c => c.comp_name === 'Grid') || 
                         rootComponents.flatMap(c => c.components).find(c => c.comp_name === 'Grid');
    if (gridComponent) {
      log.info(`NavigationEfficiency: Grid component found:`, {
        comp_name: gridComponent.comp_name,
        comp_type: gridComponent.comp_type,
        hasWorkflowTriggers: !!gridComponent.workflowTriggers,
        triggerKeys: gridComponent.workflowTriggers ? Object.keys(gridComponent.workflowTriggers) : 'none',
        hasOnRefresh: !!(gridComponent.workflowTriggers?.onRefresh)
      });
      
      // Debug: Log all component types for validator
      const allComponentTypes = rootComponents.flatMap(c => [c].concat(c.components || [])).map(c => c.comp_type);
      log.info(`NavigationEfficiency: All component types for validator:`, allComponentTypes);
    } else {
      log.warn(`NavigationEfficiency: No Grid component found in hierarchy`);
    }
    
    return rootComponents;
  }
  
  /**
   * Parse position order string into position object
   * Replicated from fetchConfig.js parsePosOrder function  
   */
  parsePosOrder(posOrderStr) {
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
   * Smart navigation that only updates changed context values
   * Prevents unnecessary updates when staying in same app/area
   */
  async smartNavigateToPage(pageID, newContext = {}, currentContext = {}) {
    try {
      log.info(`NavigationEfficiency: Smart navigating to page ${pageID}`);
      
      // Only include changed values in context update
      const contextChanges = [];
      
      // Always update pageID (it's changing)
      contextChanges.push({ paramName: 'pageID', paramVal: pageID });
      
      // Check each new context value against current
      for (const [key, newValue] of Object.entries(newContext)) {
        if (currentContext[key] !== newValue) {
          contextChanges.push({ paramName: key, paramVal: newValue });
          log.debug(`NavigationEfficiency: Context change detected - ${key}: ${currentContext[key]} → ${newValue}`);
        } else {
          log.debug(`NavigationEfficiency: Context unchanged - ${key}: ${newValue} (skipping update)`);
        }
      }
      
      log.info(`NavigationEfficiency: Smart navigation needs ${contextChanges.length} context updates (vs ${Object.keys(newContext).length + 1} without optimization)`);
      
      // Batch only the changed context values
      if (contextChanges.length > 0) {
        await setVals(contextChanges);
      }
      
      // Fetch page structure
      const response = await execEvent('fetchPageStructure');
      
      if (!response.data || response.data.length === 0) {
        throw new Error(`Page structure not found for pageID: ${pageID}`);
      }
      
      return response.data;
    } catch (error) {
      log.error(`NavigationEfficiency: Smart navigation failed for pageID ${pageID}:`, error);
      throw error;
    }
  }
  
  /**
   * Optimized layout config loading - appName already set at app startup
   * No need to set appName repeatedly during layout loads
   */
  async getLayoutConfig(appName, currentAppName = null) {
    try {
      log.info(`NavigationEfficiency: Loading layout config for app: ${appName} (appName set once at startup)`);
      
      // appName is set once at app startup - no need to set again
      log.debug(`NavigationEfficiency: Using appName from startup context - no redundant updates`);
      
      const response = await execEvent('getLayoutConfig');
      
      if (response.data && response.data.length > 0) {
        const app = response.data[0];
        const config = {
          appbar: app.appbarConfig ? JSON.parse(app.appbarConfig) : null,
          sidebar: app.sidebarConfig ? JSON.parse(app.sidebarConfig) : null,
          footer: app.footerConfig ? JSON.parse(app.footerConfig) : null,
        };
        
        log.info(`NavigationEfficiency: Layout config loaded for ${appName}`);
        return config;
      }
      
      throw new Error(`Layout config not found for app: ${appName}`);
    } catch (error) {
      log.error(`NavigationEfficiency: Failed to load layout config for ${appName}:`, error);
      throw error;
    }
  }
  
  /**
   * Efficient DML data context updates that avoid redundant tableName/contextKey sets
   * Batches all DML-related context updates and skips unchanged values
   */
  async updateDMLContext(pageRegistry, dmlData, currentContext = {}) {
    try {
      log.info('NavigationEfficiency: Updating DML context');
      
      const dmlContextUpdates = [];
      const newContext = {
        tableName: pageRegistry.tableName,
        contextKey: pageRegistry.contextKey, 
        tableID: pageRegistry.tableID || 'id',
        dmlData: JSON.stringify(dmlData)
      };
      
      // Only include changed values
      for (const [key, newValue] of Object.entries(newContext)) {
        if (currentContext[key] !== newValue) {
          dmlContextUpdates.push({ paramName: key, paramVal: newValue });
          log.debug(`NavigationEfficiency: DML context change - ${key}: ${currentContext[key]} → ${newValue?.substring ? newValue.substring(0, 50) + '...' : newValue}`);
        } else {
          log.debug(`NavigationEfficiency: DML context unchanged - ${key} (skipping)`);
        }
      }
      
      if (dmlContextUpdates.length > 0) {
        log.info(`NavigationEfficiency: DML context needs ${dmlContextUpdates.length}/4 updates`);
        await setVals(dmlContextUpdates);
      } else {
        log.info('NavigationEfficiency: DML context unchanged, no updates needed');
      }
      
      return newContext;
    } catch (error) {
      log.error('NavigationEfficiency: DML context update failed:', error);
      throw error;
    }
  }
  
  /**
   * Get current page context for smart navigation
   * Prevents redundant context updates
   */
  async getCurrentContext() {
    try {
      // Get current context values to avoid redundant updates
      const contextResponse = await execEvent('getCurrentContext');
      return contextResponse.data || {};
    } catch (error) {
      log.warn('NavigationEfficiency: Could not get current context, proceeding with full updates');
      return {};
    }
  }
}

// Export singleton instance
export const navigationEfficiency = new NavigationEfficiency();