import logger from '../logger.js';
import { buildSetValsBody } from './setValsBuilder.js';
import { buildExecN8NBody } from './execN8NBuilder.js';
import { buildHxTriggerAttribute } from './triggerEventBuilder.js';

const codeName = '[htmxBuilder]';

export function buildHTMXAttributes(triggers = [], actions = {}, componentType = 'unknown') {
  if (!triggers || triggers.length === 0) {
    return '';
  }

  if (!Array.isArray(triggers)) {
    logger.warn(`${codeName} Triggers is not an array for ${componentType}. Received: ${typeof triggers}`);
    return '';
  }

  logger.debug(`${codeName} Building HTMX for ${componentType} with ${triggers.length} trigger(s): ${triggers.map(t => t.class || t.event).join(', ')}`);

  // Group triggers by class (load, change, click, refresh, etc.)
  const triggersByClass = {};
  triggers.forEach((trigger, index) => {
    const trigClass = trigger.class || trigger.event;
    if (!trigClass) {
      logger.warn(`${codeName} Trigger missing 'class' or 'event' property at index ${index}`);
      return;
    }

    if (!triggersByClass[trigClass]) {
      triggersByClass[trigClass] = [];
    }
    triggersByClass[trigClass].push(trigger);
  });

  // Collect all trigger class data first
  const triggerData = [];
  const clientSideActions = [];
  
  Object.entries(triggersByClass).forEach(([trigClass, classTriggers]) => {
    logger.debug(`${codeName} [${trigClass}] ${classTriggers.length} action(s): ${classTriggers.map(t => t.action).join(' → ')}`);

    const firstTrigger = classTriggers[0];
    const action = actions[firstTrigger.action];

    if (!action) {
      logger.warn(`${codeName} Action not found: ${firstTrigger.action}`);
      return;
    }

    // Client-side actions (no endpoint) - collect separately
    if (!action.endpoint) {
      logger.debug(`${codeName} [${trigClass}] Client-side action "${firstTrigger.action}" - collecting`);
      clientSideActions.push({
        trigClass,
        action: firstTrigger.action,
        params: firstTrigger.params
      });
      return;
    }

    // Server-side actions - collect trigger data
    let endpoint = action.endpoint;
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    const bodyResult = buildActionBody(firstTrigger);
    
    triggerData.push({
      trigClass,
      htmxVerb: action.htmx_verb,
      endpoint,
      bodyResult,
      contentType: action.content_type,
      trigger: firstTrigger,
      needsSwap: trigClass === 'load' || trigClass === 'refresh'
    });
  });

  const htmxParts = [];

  // Handle client-side actions first
  if (clientSideActions.length > 0) {
    clientSideActions.forEach(({ trigClass, action, params }) => {
      htmxParts.push(`data-action="${action}"`);
      htmxParts.push(`data-trigger="${trigClass}"`);
      if (params) {
        htmxParts.push(`data-params='${JSON.stringify(params)}'`);
      }
    });
  }

  // Handle server-side triggers
  if (triggerData.length > 0) {
    // Build combined hx-trigger attribute
    const triggerParts = triggerData.map(data => {
      if (data.trigger.source) {
        return `${data.trigClass} from #${data.trigger.source}`;
      }
      return data.trigClass;
    });
    htmxParts.push(`hx-trigger="${triggerParts.join(', ')}"`);

    // Check if all triggers use the same endpoint and verb
    const uniqueEndpoints = [...new Set(triggerData.map(d => d.endpoint))];
    const uniqueVerbs = [...new Set(triggerData.map(d => d.htmxVerb))];

    if (uniqueEndpoints.length === 1 && uniqueVerbs.length === 1) {
      // Single endpoint - simple case
      logger.debug(`${codeName} Single endpoint: ${uniqueEndpoints[0]}`);
      htmxParts.push(`${uniqueVerbs[0]}="${uniqueEndpoints[0]}"`);
      
      // Handle hx-vals - combine if possible
      const hasJsVals = triggerData.some(d => d.bodyResult?.type === 'js');
      if (hasJsVals || triggerData.length > 1) {
        // Use conditional JavaScript for multiple triggers or js values
        const jsConditions = triggerData.map((data, index) => {
          const condition = `htmx.trigger === '${data.trigClass}'`;
          let value;
          if (data.bodyResult?.type === 'js') {
            value = data.bodyResult.expression;
          } else if (data.bodyResult?.type === 'json') {
            value = JSON.stringify(data.bodyResult.data);
          } else {
            value = '{}';
          }
          
          if (index === 0) {
            return `${condition} ? ${value}`;
          } else if (index === triggerData.length - 1) {
            return ` : ${condition} ? ${value} : null`;
          } else {
            return ` : ${condition} ? ${value}`;
          }
        });
        const jsExpression = `(${jsConditions.join('')})`;
        htmxParts.push(`hx-vals="js:${jsExpression}"`);
      } else if (triggerData[0].bodyResult) {
        // Single trigger with simple values
        const bodyResult = triggerData[0].bodyResult;
        if (bodyResult.type === 'json') {
          const hxVals = JSON.stringify(bodyResult.data).replace(/"/g, '&quot;');
          htmxParts.push(`hx-vals="${hxVals}"`);
        }
      }
    } else {
      // Multiple endpoints - use JavaScript conditionals
      logger.debug(`${codeName} Multiple endpoints: ${uniqueEndpoints.join(', ')}`);
      
      // Build conditional endpoint
      const endpointConditions = triggerData.map((data, index) => {
        if (index === 0) {
          return `htmx.trigger === '${data.trigClass}' ? '${data.endpoint}'`;
        } else if (index === triggerData.length - 1) {
          return ` : htmx.trigger === '${data.trigClass}' ? '${data.endpoint}' : null`;
        } else {
          return ` : htmx.trigger === '${data.trigClass}' ? '${data.endpoint}'`;
        }
      });
      const endpointJs = `(${endpointConditions.join('')})`;
      htmxParts.push(`${uniqueVerbs[0]}="js:${endpointJs}"`);
      
      // Build conditional values
      const valConditions = triggerData.map((data, index) => {
        const condition = `htmx.trigger === '${data.trigClass}'`;
        let value;
        if (data.bodyResult?.type === 'js') {
          value = data.bodyResult.expression;
        } else if (data.bodyResult?.type === 'json') {
          value = JSON.stringify(data.bodyResult.data);
        } else {
          value = '{}';
        }
        
        if (index === 0) {
          return `${condition} ? ${value}`;
        } else if (index === triggerData.length - 1) {
          return ` : ${condition} ? ${value} : null`;
        } else {
          return ` : ${condition} ? ${value}`;
        }
      });
      const valsJs = `(${valConditions.join('')})`;
      htmxParts.push(`hx-vals="js:${valsJs}"`);
    }

    // Add Content-Type header if any trigger needs it
    if (triggerData.some(d => d.contentType === 'object')) {
      htmxParts.push(`hx-headers='{"Content-Type": "application/json"}'`);
    }

    // Add hx-swap if any trigger needs it
    if (triggerData.some(d => d.needsSwap)) {
      htmxParts.push('hx-swap="innerHTML"');
    }
  }

  const result = htmxParts.join(' ');
  logger.debug(`${codeName} ✓ Final: ${result}`);

  return result;
}

function buildActionBody(trigger) {
  // Try specialized builders first
  let result = buildSetValsBody(trigger);
  if (result) return result;

  result = buildExecN8NBody(trigger);
  if (result) return result;

  // Generic params handling for other actions
  if (trigger.params && Object.keys(trigger.params).length > 0) {
    return { type: 'json', data: trigger.params };
  }

  return null;
}

export function buildHTMXAttributesFromObject(triggerObj = {}) {
  if (!triggerObj || Object.keys(triggerObj).length === 0) {
    return '';
  }

  const htmxParts = [];
  const triggerClasses = Object.keys(triggerObj);

  logger.debug(`${codeName} Processing pageStructure triggers: ${triggerClasses.join(', ')}`);

  // Build hx-trigger attribute
  htmxParts.push(`hx-trigger="${triggerClasses.join(', ')}"`);

  // Process each trigger class
  const endpoints = [];
  const verbs = [];
  const allActions = [];

  Object.entries(triggerObj).forEach(([trigClass, trigData]) => {
    if (!trigData.actions || !Array.isArray(trigData.actions)) {
      logger.warn(`${codeName} No actions found for trigger class: ${trigClass}`);
      return;
    }

    trigData.actions.forEach(actionObj => {
      const [actionName, actionData] = Object.entries(actionObj)[0];
      endpoints.push(actionData.endpoint);
      verbs.push(actionData.htmx_verb);
      allActions.push({ trigClass, actionName, actionData });
    });
  });

  // Check if all actions use the same endpoint and verb
  const uniqueEndpoints = [...new Set(endpoints)];
  const uniqueVerbs = [...new Set(verbs)];

  if (uniqueEndpoints.length === 1 && uniqueVerbs.length === 1) {
    // Simple case - single endpoint and verb
    htmxParts.push(`${uniqueVerbs[0]}="${uniqueEndpoints[0]}"`);
    
    // Handle parameters
    if (allActions.length === 1 && allActions[0].actionData.params) {
      const params = allActions[0].actionData.params;
      if (Array.isArray(params) && params.some(p => typeof p === 'string' && p.includes('{{'))) {
        // Has template variables - use js expression
        htmxParts.push(`hx-vals="js:{values: [{paramName: '${params[0]}', paramVal: ${params[1].replace('{{value}}', 'this.value')}}]}"`);
      } else {
        // Static parameters
        const hxVals = JSON.stringify(params).replace(/"/g, '&quot;');
        htmxParts.push(`hx-vals="${hxVals}"`);
      }
    }
  } else {
    // Multiple endpoints/verbs - use conditional logic (for future complex cases)
    logger.debug(`${codeName} Multiple endpoints/verbs detected - using first action for now`);
    if (allActions.length > 0) {
      const firstAction = allActions[0];
      htmxParts.push(`${firstAction.actionData.htmx_verb}="${firstAction.actionData.endpoint}"`);
    }
  }

  // Add common headers
  htmxParts.push(`hx-headers='{"Content-Type": "application/json"}'`);

  const result = htmxParts.join(' ');
  logger.debug(`${codeName} ✓ PageStructure HTMX: ${result}`);

  return result;
}
