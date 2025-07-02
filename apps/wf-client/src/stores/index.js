// Central barrel file for exporting all store functions
// Import modalStore from new location
import { modalStore } from '@whatsfresh/shared-ui';

// From eventStore
export {
  execEvent,
  getEventType,
  getEventTypes,
  initEventTypeService,
  isEventTypeServiceInitialized,
  resetEventTypeService
} from './eventStore';


// Add this missing function export
export const getEventTypeConfig = (eventTypeId) => {
  const { getEventType } = require('./eventStore');
  const eventType = getEventType(eventTypeId);
  return eventType ? {
    eventType: eventType.eventType,
    method: eventType.method,
    params: eventType.params || []
  } : null;
};

// From accountStore (much simpler!)
export {
  default as accountStore,
  useAccountStore,
  AccountContext
} from './accountStore';



// Export modalStore directly without trying to access non-existent methods
export { 
  modalStore,
};

// From pageStore
export {
  setCurrentPage,
  getCurrentPage,
  setPageTitle,
  getPageTitle,
  setBreadcrumbs,
  getBreadcrumbs,
  usePageStore,
  initPageStore
} from './pageStore';

