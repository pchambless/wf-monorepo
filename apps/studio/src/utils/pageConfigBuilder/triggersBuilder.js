import { db } from '../../db/studioDb';

export const buildWorkflowTriggers = async (triggers) => {
  if (!triggers || triggers.length === 0) {
    return null;
  }

  const workflowTriggers = {};

  // Load trigger class definitions to get is_dom_event flags
  const triggerClassDefs = await db.triggers.where('trigType').equals('class').toArray();
  const classDefMap = {};
  triggerClassDefs.forEach(def => {
    classDefMap[def.name] = def;
  });

  triggers.forEach(trigger => {
    if (!workflowTriggers[trigger.class]) {
      workflowTriggers[trigger.class] = [];
    }

    let params;
    try {
      params = JSON.parse(trigger.content || '{}');
    } catch (e) {
      params = trigger.content || {};
    }

    // Look up class definition to get is_dom_event flag
    const classDef = classDefMap[trigger.class];
    const isDomEvent = classDef?.is_dom_event === 1 || classDef?.is_dom_event === true;

    const triggerObj = {
      action: trigger.action,
      _order: trigger.ordr || 0,
      is_dom_event: isDomEvent
    };

    if (params !== null && params !== undefined) {
      if (Array.isArray(params) && params.length > 0) {
        triggerObj.params = params;
      } else if (typeof params === 'object' && Object.keys(params).length > 0) {
        triggerObj.params = params;
      } else if (typeof params === 'string' && params.length > 0) {
        triggerObj.params = params;
      }
    }

    workflowTriggers[trigger.class].push(triggerObj);
  });

  Object.keys(workflowTriggers).forEach(cls => {
    workflowTriggers[cls].sort((a, b) => a._order - b._order);
    workflowTriggers[cls].forEach(t => delete t._order);
  });

  return workflowTriggers;
};
