// Clean, focused store exports for new architecture
// All event handling now comes from shared-imports
export {
  modalStore,
  execEvent,
  getEventType,
  getEventTypes,
  contextStore
} from '@whatsfresh/shared-imports';

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

