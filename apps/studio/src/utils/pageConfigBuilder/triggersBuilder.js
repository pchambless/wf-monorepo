export const buildWorkflowTriggers = (triggers) => {
  if (!triggers || triggers.length === 0) {
    return null;
  }

  const workflowTriggers = {};

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

    const triggerObj = { action: trigger.action, _order: trigger.ordr || 0 };

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
