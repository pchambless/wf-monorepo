// Re-export from modular eventTriggers operations
// Kept for backward compatibility with existing imports

export {
  insertTrigger as createTrigger,
  updateTrigger,
  deleteTrigger,
  getTriggersByComponent as getTriggersByXrefId,
  getTriggerById as getTriggerByIdbID,
  getTriggersByClass,
  getTriggerByClassAction,
  bulkInsertTriggers,
  updateTriggerOrder
} from './eventTriggers/index.js';

// Keep reorderTriggers for backward compatibility
import { updateTriggerOrder } from './eventTriggers/index.js';

export const reorderTriggers = async (xref_id, triggerIds) => {
  for (let i = 0; i < triggerIds.length; i++) {
    await updateTriggerOrder(triggerIds[i], i + 1);
  }
};
