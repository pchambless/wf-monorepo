export const buildWorkflowTriggers = (triggers) => {
  if (!triggers || triggers.length === 0) {
    return null;
  }

  const workflowTriggers = {};

  triggers.forEach(trigger => {
    if (!workflowTriggers[trigger.class]) {
      workflowTriggers[trigger.class] = [];
    }

    let params = {};
    try {
      params = JSON.parse(trigger.content || '{}');
    } catch (e) {
      params = trigger.content || {};
    }

    workflowTriggers[trigger.class].push({
      action: trigger.action,
      params,
      _order: trigger.ordr || 0
    });
  });

  Object.keys(workflowTriggers).forEach(cls => {
    workflowTriggers[cls].sort((a, b) => a._order - b._order);
    workflowTriggers[cls].forEach(t => delete t._order);
  });

  return workflowTriggers;
};
