// Clean, focused store exports for new architecture
import { modalStore } from '@whatsfresh/shared-imports';

// Event handling for API calls
export {
  execEvent,
  getEventType,
  getEventTypes,
  initEventTypeService,
  isEventTypeServiceInitialized,
  resetEventTypeService
} from './eventStore';

// Simple auth and account selection
export {
  default as accountStore,
  useAccountStore,
  AccountContext
} from './accountStore';

// Page state and breadcrumbs
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

// Modal management (from shared-ui)
export { modalStore };

