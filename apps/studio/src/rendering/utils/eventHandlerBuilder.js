import { triggerEngine } from '../WorkflowEngine/TriggerEngine.js';

/**
 * Build event handlers from workflowTriggers - only for DOM events
 */
export function buildEventHandlers(workflowTriggers, config, setData, contextStore = {}) {
  if (!workflowTriggers) return {};

  const handlers = {};
  Object.entries(workflowTriggers).forEach(([eventType, triggers]) => {
    const hasDomEventTrigger = triggers.some(trigger => trigger.is_dom_event);

    if (!hasDomEventTrigger) {
      //  console.log(`⏭️ Skipping ${eventType} - workflow callback, not DOM event`);
      return;
    }

    const handlerName = {
      'onSubmit': 'onSubmit', 'onClick': 'onClick', 'onChange': 'onChange', 'onLoad': 'onLoad'
    }[eventType] || 'onClick';

    console.log(`🔧 Building DOM handler: ${handlerName} for eventType: ${eventType}, triggers:`, triggers);

    handlers[handlerName] = async (e) => {
      console.log(`🎯 DOM Handler fired: ${handlerName}`, e.target);
      if (eventType === 'onSubmit' || eventType === 'onClick') {
        e.preventDefault();
      }

      const context = {
        event: e,
        form: e.target.closest('form'),
        formData: e.target.closest('form') ?
          Object.fromEntries(new FormData(e.target.closest('form'))) : null,
        workflowTriggers,
        pageConfig: config,
        setData,
        contextStore: contextStore  // Add runtime context for visibility
      };

      const domTriggers = triggers.filter(trigger => trigger.is_dom_event);
      console.log(`🔄 Executing DOM triggers:`, domTriggers, context);
      await triggerEngine.executeTriggers(domTriggers, context);
    };
  });

  return handlers;
}
