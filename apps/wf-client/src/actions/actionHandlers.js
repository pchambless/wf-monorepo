import { subscribeToAction } from './actionStore';
import { ACTIONS } from './core/constants';
import actionHandlers from './handlers';
import createLogger from '../utils/logger';

const log = createLogger('ActionHandlers');

/**
 * Action Handler Documentation
 * 
 * This file serves as both documentation and potential implementation
 * of handlers for various actions in the system.
 * 
 * Each action type has handlers that document what should happen
 * when that action is triggered.
 */

// Handler registry - can be made executable
// const actionHandlers = { ... } <-- This was causing the error

/**
 * Makes the documented handlers executable by registering them with the action system
 * @param {Object} options Configuration options
 * @param {boolean} options.executeHandlers Whether to actually execute the handlers
 * @param {boolean} options.logOnly Only log the actions without executing handlers
 * @returns {Function[]} Array of unsubscribe functions
 */
export const registerActionHandlers = (options = { executeHandlers: true, logOnly: false }) => {
  const unsubscribers = [];
  
  // Helper to process a handler definition
  const processHandlers = (actionType, handlerDef) => {
    if (!handlerDef || !handlerDef.handlers) return;
    
    const unsub = subscribeToAction(actionType, (payload, context) => {
      log.info(`Action triggered: ${actionType}`, { payload });
      
      if (options.logOnly) {
        log.info(`Action ${actionType} handlers:`, {
          handlers: handlerDef.handlers.map(h => h.name)
        });
        return;
      }
      
      if (options.executeHandlers) {
        // Execute all handlers in sequence
        for (const handler of handlerDef.handlers) {
          try {
            log.debug(`Executing handler: ${handler.name}`);
            handler.implementation(payload, context);
          } catch (error) {
            log.error(`Error in handler ${handler.name}:`, error);
          }
        }
      }
    });
    
    unsubscribers.push(unsub);
  };
  
  // Register all handlers from all categories
  Object.entries(actionHandlers).forEach(([categoryKey, category]) => {
    const actionCategory = ACTIONS[categoryKey];
    
    if (actionCategory && category) {
      Object.entries(category).forEach(([actionKey, actionDef]) => {
        const actionType = actionCategory[actionKey];
        
        if (actionType) {
          if (actionDef.handlers) {
            // Direct handler for action type
            log.debug(`Registering handlers for ${categoryKey}.${actionKey}`);
            processHandlers(actionType, actionDef);
          } else {
            // Sub-type handlers
            Object.entries(actionDef).forEach(([subType, handlerDef]) => {
              const subTypeAction = `${actionType}.${subType}`;
              log.debug(`Registering handlers for ${categoryKey}.${actionKey}.${subType}`);
              processHandlers(subTypeAction, handlerDef);
            });
          }
        }
      });
    }
  });
  
  log.info(`Registered ${unsubscribers.length} action handlers`);
  return unsubscribers;
};

export default actionHandlers;
